"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import { useAgentCatalog, useConvoStore, useKnowledgeStore } from "@/lib/stores"
import { Paperclip, Send, Gift, Grid2X2, Languages } from "lucide-react"
import { AgentQuickSettings } from "@/components/agent/agent-quick-settings"

export function ChatShell({ agentId }: { agentId: string }) {
  // Selectors to reduce re-renders
  const conversations = useConvoStore((s) => s.conversations)
  const activeId = useConvoStore((s) => s.activeId)
  const createConversation = useConvoStore((s) => s.createConversation)
  const setActive = useConvoStore((s) => s.setActive)
  const appendMessage = useConvoStore((s) => s.appendMessage)

  const { agents } = useAgentCatalog()
  const knowledge = useKnowledgeStore((s) => s.items)

  const agent = useMemo(
    () => (agents.length ? agents.find((a) => a.id === agentId) || agents[0] : undefined),
    [agents, agentId],
  )

  // Derive the active conversation for this agent without mutating state.
  const convosForAgent = useMemo(() => conversations.filter((c) => c.agentId === agent?.id), [conversations, agent?.id])
  const derivedActiveConvo = useMemo(() => {
    if (!agent) return undefined
    const active = conversations.find((c) => c.id === activeId && c.agentId === agent.id)
    return active || convosForAgent[0]
  }, [conversations, activeId, agent, convosForAgent])

  // Ensure a conversation exists via effect (safe setState outside render).
  useEffect(() => {
    if (!agent) return
    if (!derivedActiveConvo) {
      const c = createConversation({ agentId: agent.id })
      setActive(c.id)
    }
  }, [agent, derivedActiveConvo, createConversation, setActive])

  const [input, setInput] = useState("")
  const [openSettings, setOpenSettings] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [derivedActiveConvo?.messages.length])

  if (!agent) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-sm text-muted-foreground">
          暂无可用 Agent，请先在「工作室」创建或在「插件」中安装一个 Agent。
        </div>
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
    setInput("")
    appendMessage(derivedActiveConvo.id, { role: "user", content: text })
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          agent,
          knowledge,
          messages: [
            ...derivedActiveConvo.messages.map((m) => ({ role: m.role, content: m.content })),
            { role: "user", content: text },
          ],
        }),
      })
      const data = await res.json()
      appendMessage(derivedActiveConvo.id, { role: "assistant", content: data.reply || "（无响应）" })
    } catch {
      appendMessage(derivedActiveConvo.id, { role: "assistant", content: "请求失败，请稍后再试。" })
    }
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-12 border-b px-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary font-semibold">
            {agent.name.slice(0, 1).toUpperCase()}
          </div>
          <div>
            <div className="font-medium">{agent.name}</div>
            <div className="text-xs text-muted-foreground">
              版本 {agent.version} · {agent.visibility === "public" ? "公开" : "私有"}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setOpenSettings(true)}>
            设置
          </Button>
          <Button size="sm" asChild>
            <a href="/marketplace">市场</a>
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
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
                  m.role === "user" ? "bg-primary text-primary-foreground rounded-tr-none" : "bg-muted rounded-tl-none",
                )}
              >
                <div className="whitespace-pre-wrap leading-relaxed text-sm">{m.content}</div>
              </Card>
              {m.role === "user" && (
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="text-xs">U</AvatarFallback>
                </Avatar>
              )}
            </div>
          ))}
          <div ref={endRef} />
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
              <Button size="icon" variant="ghost">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button size="icon" className="rounded-full" onClick={sendMessage}>
                <Send className="w-4 h-4" />
              </Button>
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
