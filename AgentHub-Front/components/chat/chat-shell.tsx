"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAgentCatalog, useConvoStore, useKnowledgeStore, useWorkspaceStore } from "@/lib/stores"
import { api } from "@/lib/api"
import { Paperclip, Send, Gift, Grid2X2, Languages, Square } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Skeleton } from "@/components/ui/skeleton"
import { AgentQuickSettings } from "@/components/agent/agent-quick-settings"
import { MarkdownMessage } from "@/components/chat/markdown-message"
import { MessageTypeBadge } from "@/components/chat/message-type-badge"
import { TaskProgress } from "@/components/chat/task-progress"
import { MessageType, Task } from "@/components/chat/types"

export function ChatShell({ agentId }: { agentId: string }) {
  // Selectors to reduce re-renders
  const conversations = useConvoStore((s) => s.conversations)
  const activeId = useConvoStore((s) => s.activeId)
  const createConversation = useConvoStore((s) => s.createConversation)
  const setActive = useConvoStore((s) => s.setActive)
  const appendMessage = useConvoStore((s) => s.appendMessage)
  const replaceMessages = useConvoStore((s) => s.replaceMessages)
  const appendAssistantMessage = useConvoStore((s) => s.appendAssistantMessage)
  const appendMessageDelta = useConvoStore((s) => s.appendMessageDelta)
  const removeMessage = useConvoStore((s) => s.removeMessage)

  const { agents } = useAgentCatalog()
  const knowledge = useKnowledgeStore((s) => s.items)
  const { currentAgentId } = useWorkspaceStore()

  // Use currentAgentId from global state if available, fallback to prop
  const effectiveAgentId = currentAgentId || agentId

  const agent = useMemo(
    () => (agents.length ? agents.find((a) => a.id === effectiveAgentId) || agents[0] : undefined),
    [agents, effectiveAgentId],
  )

  // Latest published/version info for header
  const [latest, setLatest] = useState<any | null>(null)
  const [latestLoading, setLatestLoading] = useState<boolean>(false)
  // 为避免双请求/闪烁：仅在进入页面或切换不同 agentId 时请求一次 latest
  const lastAgentIdRef = useRef<string | null>(null)
  useEffect(() => {
    if (!agent?.id) return
    if (lastAgentIdRef.current === agent.id) return
    lastAgentIdRef.current = agent.id
    let cancelled = false
    setLatestLoading(true)
    ;(async () => {
      try {
        const j = await api.getLatestVersion(agent.id)
        if (!cancelled) setLatest(j?.data ?? j ?? null)
      } catch {
        if (!cancelled) setLatest(null)
      } finally {
        if (!cancelled) setLatestLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [agent?.id])

  // Derive the active conversation for this agent without mutating state.
  const convosForAgent = useMemo(() => conversations.filter((c) => c.agentId === agent?.id), [conversations, agent?.id])
  const derivedActiveConvo = useMemo(() => {
    if (!agent) return undefined
    const active = conversations.find((c) => c.id === activeId && c.agentId === agent.id)
    const result = active || convosForAgent[0]
    return result
  }, [conversations, activeId, agent, convosForAgent])

  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [enableThink, setEnableThink] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const [openSettings, setOpenSettings] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [showTaskList, setShowTaskList] = useState(false)
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null)

  // Ensure a conversation exists via effect (safe setState outside render).
  useEffect(() => {
    if (!agent) return
    if (!derivedActiveConvo) {
      createConversation({ agentId: agent.id }).then((c) => {
        setActive(c.id)
      }).catch((error) => {
        // 不创建假会话，让用户手动创建
      })
    } else if (!currentConversationId || derivedActiveConvo.id !== currentConversationId) {
      // 初始化当前会话ID
      setCurrentConversationId(derivedActiveConvo.id)
    }
  }, [agent, derivedActiveConvo, createConversation, setActive, currentConversationId])
  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [derivedActiveConvo?.messages.length])

  // 监听会话切换，重置任务状态
  useEffect(() => {
    if (derivedActiveConvo && currentConversationId && derivedActiveConvo.id !== currentConversationId) {
      // 会话切换时重置任务状态，但不要立即隐藏任务区域
      setTasks([])
      // 只有在没有任务消息时才隐藏任务区域
      const hasTaskMessages = derivedActiveConvo.messages.some(msg =>
        msg.messageType && ['TASK_SPLIT', 'TASK_SPLIT_FINISH', 'TASK_EXEC', 'TASK_STATUS_TO_LOADING', 'TASK_STATUS_TO_FINISH'].includes(msg.messageType as string)
      )
      setShowTaskList(hasTaskMessages)
      setCurrentConversationId(derivedActiveConvo.id)
    }
  }, [derivedActiveConvo, currentConversationId])

  
  // 监听任务完成状态，所有任务完成后隐藏任务列表
  useEffect(() => {
    if (tasks.length > 0) {
      const allCompleted = tasks.every(task => task.status === 'completed' || task.status === 'failed')
      if (allCompleted) {
        // 延迟隐藏，让用户看到完成状态
        const timer = setTimeout(() => {
          setShowTaskList(false)
          // 清空任务列表
          setTimeout(() => {
            setTasks([])
          }, 300) // 等待动画完成
        }, 2000) // 显示2秒后隐藏
        return () => clearTimeout(timer)
      }
    }
  }, [tasks])

  // Load messages when conversation changes, but avoid reloading when messages are being added
  const lastLoadedSessionId = useRef<string | null>(null)
  const isLoadingMessages = useRef<boolean>(false)
  
  useEffect(() => {
    if (!derivedActiveConvo) return
    
    // 检查是否是后端会话（32位hex ID），如果是则总是从后端加载消息
    const HEX_32 = /^[a-f0-9]{32}$/i
    const isBackendSession = HEX_32.test(derivedActiveConvo.id)
    
    // 如果已经为这个会话加载过消息，且不是后端会话，则不再重复加载
    if (lastLoadedSessionId.current === derivedActiveConvo.id && !isBackendSession) {
      return
    }
    
    // 如果正在加载消息，避免重复请求
    if (isLoadingMessages.current) {
      return
    }
    
    // 对于非后端会话，如果已有消息则不加载
    if (!isBackendSession && derivedActiveConvo.messages.length > 0) {
      lastLoadedSessionId.current = derivedActiveConvo.id
      return
    }
    
    let cancelled = false
    isLoadingMessages.current = true
    
    ;(async () => {
      try {
        const response = await api.getMessages(derivedActiveConvo.id)
        
        // API返回格式: { code: 200, message: "操作成功", data: [...] }
        const list = response?.data || response
        if (!cancelled && Array.isArray(list)) {
          const mapped = list.map((m: any) => ({
            id: m.id,
            role: (m.role?.toLowerCase() === 'user' ? 'user' : (m.role?.toLowerCase() === 'assistant' ? 'assistant' : 'system')) as "user" | "assistant" | "system",
            content: m.content,
            messageType: m.messageType,
            taskId: m.taskId,
            taskName: m.taskName,
            createdAt: m.createdAt
          }))
          replaceMessages(derivedActiveConvo.id, mapped)
          lastLoadedSessionId.current = derivedActiveConvo.id
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      } finally {
        isLoadingMessages.current = false
      }
    })()
    
    return () => {
      cancelled = true
      isLoadingMessages.current = false
    }
  }, [derivedActiveConvo?.id]) // 移除 messages.length 依赖，避免消息变化时重复加载

  if (!agent) {
    return (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-sm text-muted-foreground">暂无可用 Agent，请先在「工作室」创建或在「探索」中挑选一个 Agent。</div>
        </div>
    )
  }

  if (!derivedActiveConvo) {
    // Effect 会立刻创建会话，这里给一个轻量占位
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">正在初始化会话…</div>
      </div>
    )
  }

  async function sendMessage() {
    const text = input.trim()
    if (!text) return
    if (!derivedActiveConvo) return
    setInput("")
    const convoId = derivedActiveConvo.id
    appendMessage(convoId, { role: "user", content: text })
    try {
      const controller = new AbortController()
      abortRef.current = controller
      setIsStreaming(true)
      setTasks([]) // 清空任务列表
      setShowTaskList(false) // 隐藏任务列表
      const res = await api.chat(text, convoId, enableThink, controller.signal)

      if (!res.body) {
        appendMessage(convoId, { role: "assistant", content: "（无响应）" })
        return
      }

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      // Lazily create bubbles to avoid empty cards
      let reasoningId: string | undefined
      let finalId: string | undefined
      let buffer = ""

      const handlePayload = (payload: string, evtName?: string) => {
        console.log('=== 收到消息 ===', {
          rawPayload: payload,
          eventName: evtName,
          payloadLength: payload.length
        })

        let obj: any
        try {
          obj = JSON.parse(payload)
          console.log('JSON解析成功:', obj)
        } catch (error) {
          console.log('JSON解析失败，使用原始内容:', error)
          obj = { content: payload }
        }

        const content: string = obj?.content ?? ""
        const done: boolean = obj?.done ?? obj?.isDone ?? (evtName === "done")
        const reasoning: boolean = obj?.reasoning ?? obj?.isReasoning ?? obj?.isThinking ?? (evtName === "reasoning")
        const messageType: MessageType = obj?.messageType
        const taskId: string = obj?.taskId
        const taskName: string = obj?.taskName

        console.log('解析后的消息数据:', {
          content,
          done,
          reasoning,
          messageType,
          taskId,
          taskName,
          所有字段: Object.keys(obj)
        })

        // 处理任务状态更新
        if (messageType === MessageType.TASK_STATUS_TO_LOADING && taskId && taskName) {
          setTasks(prev => {
            const existing = prev.find(t => t.id === taskId)
            if (existing) {
              return prev.map(t => t.id === taskId ? { ...t, status: 'loading' as const, updatedAt: new Date() } : t)
            } else {
              return [...prev, { id: taskId, name: taskName, status: 'loading', content, createdAt: new Date(), updatedAt: new Date() }]
            }
          })
        }

        if (messageType === MessageType.TASK_STATUS_TO_FINISH && taskId) {
          setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed' as const, updatedAt: new Date() } : t))
        }

        // 处理任务拆分消息 - 添加到任务列表
        if (messageType === MessageType.TASK_SPLIT && taskId && taskName) {
          setTasks(prev => {
            const existing = prev.find(t => t.id === taskId)
            if (!existing) {
              return [...prev, { id: taskId, name: taskName, status: 'pending' as const, content }]
            }
            return prev
          })
        }

        // 处理任务拆分完成消息 - 添加单个任务到列表
        if (messageType === MessageType.TASK_SPLIT_FINISH && taskId) {
          const finalTaskName = taskName || content || `任务 ${taskId.slice(0, 8)}`
          console.log('收到 TASK_SPLIT_FINISH 消息:', { taskId, taskName: finalTaskName, content })
          setTasks(prev => {
            const existing = prev.find(t => t.id === taskId)
            if (!existing) {
              console.log('添加新任务到列表:', { taskId, taskName: finalTaskName })
              // 显示任务列表
              setShowTaskList(true)
              return [...prev, {
                id: taskId,
                name: finalTaskName,
                status: 'pending' as const,
                content,
                createdAt: new Date(),
                updatedAt: new Date()
              }]
            }
            console.log('任务已存在，跳过:', taskId)
            return prev
          })
        }

        if (reasoning) {
          if (!reasoningId) reasoningId = appendAssistantMessage(convoId, "", "reasoning")
          if (content) appendMessageDelta(convoId, reasoningId, content)
        } else if (messageType !== MessageType.TASK_SPLIT_FINISH) {
          // TASK_SPLIT_FINISH 消息不显示在聊天气泡中，只在任务列表中显示
          if (!finalId) finalId = appendAssistantMessage(convoId, "", "normal", messageType as string, taskId, taskName)
          if (content) appendMessageDelta(convoId, finalId, content)
        }

        if (done && reasoningId) {
          const toRemove = reasoningId
          setTimeout(() => removeMessage(convoId, toRemove), 300)
        }
      }

      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        // split SSE events by blank line
        const events = buffer.split(/\r?\n\r?\n/)
        buffer = events.pop() || ""
        for (const raw of events) {
          const lines = raw.split(/\r?\n/)
          let evtName: string | undefined
          const dataLines: string[] = []
          for (const ln of lines) {
            if (ln.startsWith(":")) continue
            if (ln.startsWith("event:")) {
              evtName = ln.slice(6).trim()
            } else if (ln.startsWith("data:")) {
              dataLines.push(ln.slice(5).trimStart())
            }
          }
          const payload = dataLines.join("\n")
          if (payload) handlePayload(payload, evtName)
        }
      }
      // end of stream
    } catch {
      // If aborted,清理推理气泡
      const aborted = abortRef.current !== null
      if (aborted) {
        // attempt to remove reasoning bubble if存在
        // Note: cannot access local reasoningId here once out of scope
      } else {
        appendMessage(convoId, { role: "assistant", content: "请求失败，请稍后再试。" })
      }
    } finally {
      setIsStreaming(false)
      abortRef.current = null
    }
  }

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="h-12 border-b px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {agent.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{agent.name}</div>
            {latestLoading ? (
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-10" />
              </div>
            ) : (
              <div className="text-xs text-muted-foreground">
                {(() => {
                  const v = latest?.versionNumber ? `v${latest.versionNumber}` : "v-Beta"
                  const vis = latest?.publishStatus === 2 ? "公开" : "私有"
                  return `版本 ${v} · ${vis}`
                })()}
              </div>
            )}
          </div>
        </div>

      </div>

      {/* 任务进度显示屏 - 刘海样式 */}
      <div className={`px-4 py-2 transition-all duration-300 ease-in-out overflow-hidden ${
        showTaskList
          ? 'max-h-48 opacity-100'
          : 'max-h-0 opacity-0 py-0'
      }`}>
        <div className="mx-auto">
          <TaskProgress tasks={tasks} />
        </div>
      </div>

      <div className="flex-1 flex flex-col min-h-0">
        {/* 对话框区域 */}
        <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
          <div className="mx-auto max-w-3xl space-y-6">
            {derivedActiveConvo.messages.map((m, i) => (
              <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
                {m.role !== "user" && (
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs">A</AvatarFallback>
                  </Avatar>
                )}
                <div className="flex flex-col gap-1">
                  {m.role === "assistant" && m.messageType && (
                    <MessageTypeBadge messageType={m.messageType as any} />
                  )}
                  <Card
                    className={cn(
                      "px-4 py-3 rounded-2xl max-w-[600px] min-w-[200px] shadow-sm whitespace-pre-wrap break-words",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground rounded-tr-none"
                        : m.kind === "reasoning"
                          ? "bg-muted text-muted-foreground rounded-tl-none animate-in fade-in duration-300"
                          : "bg-muted rounded-tl-none",
                    )}
                  >
                    {m.role === "assistant" ? (
                    <MarkdownMessage
                      content={m.content}
                      className={cn(
                        "leading-relaxed text-sm",
                        m.kind === "reasoning" && "text-[12px] italic prose-p:my-1 prose-ul:my-1 prose-ol:my-1",
                      )}
                    />
                  ) : (
                    <div
                      className={cn(
                        "whitespace-pre-wrap leading-relaxed text-sm",
                        m.kind === "reasoning" && "text-[12px] italic",
                      )}
                    >
                      {m.content}
                    </div>
                  )}
                  </Card>
                </div>
                {m.role === "user" && (
                  <Avatar className="w-7 h-7">
                    <AvatarFallback className="text-xs">U</AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
            <div />
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 bg-background/80 backdrop-blur border-t">
        <div className="max-w-3xl mx-auto p-3">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="输入消息…（Shift+Enter 换行，Enter 发送）"
              rows={1}
              className="min-h-[48px] resize-none rounded-2xl pr-14"
            />
            <div className="absolute right-2 top-2 flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex items-center gap-1 px-2 py-1 rounded-md border bg-background">
                      <span className="text-xs text-muted-foreground select-none">推理</span>
                      <Switch checked={enableThink} onCheckedChange={setEnableThink} disabled={isStreaming} />
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" align="end" className="max-w-[220px] text-xs">
                    目前仅部分模型支持推理。
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button size="icon" variant="ghost" disabled={isStreaming}>
                <Paperclip className="w-4 h-4" />
              </Button>
              {isStreaming ? (
                <Button
                  size="icon"
                  className="rounded-full"
                  variant="destructive"
                  onClick={() => {
                    abortRef.current?.abort()
                  }}
                  title="停止生成"
                >
                  <Square className="w-4 h-4" />
                </Button>
              ) : (
                <Button size="icon" className="rounded-full" onClick={sendMessage} title="发送">
                  <Send className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Floating actions */}
      <div className="fixed right-4 bottom-28 hidden md:flex flex-col gap-3">
        <button
          className="w-10 h-10 rounded-full bg-pink-100 text-pink-700 flex items-center justify-center shadow hover:scale-105 transition"
          title="礼包"
        >
          <Gift className="w-5 h-5" />
        </button>
        <button
          className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shadow hover:scale-105 transition"
          title="组件"
        >
          <Grid2X2 className="w-5 h-5" />
        </button>
        <button
          className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shadow hover:scale-105 transition"
          title="语言"
        >
          <Languages className="w-5 h-5" />
        </button>
      </div>

      {agent && <AgentQuickSettings open={openSettings} onOpenChange={setOpenSettings} agent={agent} />}
    </div>
  )
}
