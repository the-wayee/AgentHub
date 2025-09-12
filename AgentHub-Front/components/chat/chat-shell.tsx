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

  // Ensure a conversation exists via effect (safe setState outside render).
  useEffect(() => {
    if (!agent) return
    if (!derivedActiveConvo) {
      createConversation({ agentId: agent.id }).then((c) => {
        setActive(c.id)
      }).catch((error) => {
        // 不创建假会话，让用户手动创建
      })
    }
  }, [agent, derivedActiveConvo, createConversation, setActive])

  const [input, setInput] = useState("")
  const [isStreaming, setIsStreaming] = useState(false)
  const [enableThink, setEnableThink] = useState(false)
  const abortRef = useRef<AbortController | null>(null)
  const [openSettings, setOpenSettings] = useState(false)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = scrollRef.current
    if (el) {
      el.scrollTop = el.scrollHeight
    }
  }, [derivedActiveConvo?.messages.length])

  // Load messages when conversation changes OR when its messages become empty
  useEffect(() => {
    if (!derivedActiveConvo) return
    
    // 检查是否是后端会话（32位hex ID），如果是则总是从后端加载消息
    const HEX_32 = /^[a-f0-9]{32}$/i
    const isBackendSession = HEX_32.test(derivedActiveConvo.id)
    
    if (!isBackendSession && derivedActiveConvo.messages.length > 0) {
      return
    }
    
    let cancelled = false
    ;(async () => {
      try {
        const response = await api.getMessages(derivedActiveConvo.id)
        console.log('Messages API response:', response)
        
        // API返回格式: { code: 200, message: "操作成功", data: [...] }
        const list = response?.data || response
        if (!cancelled && Array.isArray(list)) {
          const mapped = list.map((m: any) => ({ 
            id: m.id, 
            role: (m.role?.toLowerCase() === 'user' ? 'user' : (m.role?.toLowerCase() === 'assistant' ? 'assistant' : 'system')) as "user" | "assistant" | "system", 
            content: m.content, 
            createdAt: m.createdAt 
          }))
          console.log('Mapped messages:', mapped)
          replaceMessages(derivedActiveConvo.id, mapped)
        }
      } catch (error) {
        console.error('Failed to load messages:', error)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [derivedActiveConvo?.id, derivedActiveConvo?.messages.length])

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
        let obj: any
        try {
          obj = JSON.parse(payload)
        } catch {
          obj = { content: payload }
        }
        const content: string = obj?.content ?? ""
        const done: boolean = obj?.done ?? obj?.isDone ?? (evtName === "done")
        const reasoning: boolean = obj?.reasoning ?? obj?.isReasoning ?? (evtName === "reasoning")

        if (reasoning) {
          if (!reasoningId) reasoningId = appendAssistantMessage(convoId, "", "reasoning")
          if (content) appendMessageDelta(convoId, reasoningId, content)
        } else {
          if (!finalId) finalId = appendAssistantMessage(convoId, "", "normal")
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

      <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-6">
        <div className="mx-auto max-w-3xl space-y-6">
          {derivedActiveConvo.messages.map((m, i) => (
            <div key={i} className={cn("flex gap-3", m.role === "user" ? "justify-end" : "justify-start")}>
              {m.role !== "user" && (
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs">A</AvatarFallback>
                </Avatar>
              )}
              <Card
                className={cn(
                  "px-3 py-2 rounded-2xl max-w-[75%] shadow-sm",
                  m.role === "user"
                    ? "bg-primary text-primary-foreground rounded-tr-none"
                    : m.kind === "reasoning"
                      ? "bg-muted text-muted-foreground rounded-tl-none animate-in fade-in duration-300"
                      : "bg-muted rounded-tl-none",
                )}
              >
                <div
                  className={cn(
                    "whitespace-pre-wrap leading-relaxed text-sm",
                    m.kind === "reasoning" && "text-[12px] italic",
                  )}
                >
                  {m.content}
                </div>
              </Card>
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
