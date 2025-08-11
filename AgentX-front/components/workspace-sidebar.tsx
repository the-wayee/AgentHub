"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Pencil, Plus, Search, Sparkles, Trash2 } from "lucide-react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
// lightweight inline UI without bringing full antd styles
import { useConvoStore, useAgentCatalog, useWorkspaceStore } from "@/lib/stores"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useEffect, useMemo, useState, useRef } from "react"

export function WorkspaceSidebar({
  defaultAgentId = "demo",
  currentAgentId,
}: {
  defaultAgentId?: string
  currentAgentId?: string
}) {
  const router = useRouter()
  const { conversations, createConversation, addConversation, activeId, setActive, replaceConversationsForAgent, renameConversation, deleteConversation } = useConvoStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const { agents } = useAgentCatalog()
  const { setCurrentAgentId } = useWorkspaceStore()
  const { selectedId, setSelected } = useWorkspaceStore()
  const { toast } = useToast()

  // Agents under current workspace
  // Ignore workspace filter for now per requirement
  const agentsInWs = useMemo(() => agents, [agents])

  // Current agent
  const agent = useMemo(() => {
    const wantedId = currentAgentId || defaultAgentId
    const found = agents.find((a) => a.id === wantedId)
    return found || agentsInWs[0] || agents[0]
  }, [agents, agentsInWs, currentAgentId, defaultAgentId])

  const filteredConvos = useMemo(() => conversations.filter((c) => c.agentId === agent?.id), [conversations, agent?.id])

  // Avoid hydration mismatch for locale/timezone rendering
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  async function reloadSessions() {
    if (!agent?.id) return
    try {
      const res = await fetch(`/api/sessions/${agent.id}`, { cache: "no-store" })
      const list = await res.json()
      if (Array.isArray(list)) {
        const mapped = list.map((s: any) => ({ id: s.id, title: s.title, createdAt: s.createdAt }))
        replaceConversationsForAgent(agent.id, mapped)
      }
    } catch {}
  }

  // Fetch sessions when agent changes
  // 避免重复调用：仅当 agentId 实际变化时拉取
  const lastFetchedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!agent?.id) return
    if (agent.id === "demo") return
    // 仅当不存在“后端会话”时才拉取。后端会话 id 通常为 32 位 hex
    const HEX_32 = /^[a-f0-9]{32}$/i
    const hasRemote = filteredConvos.some((c) => HEX_32.test(c.id))
    if (lastFetchedRef.current === agent.id || hasRemote) return
    lastFetchedRef.current = agent.id
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/sessions/${agent.id}`, { cache: "no-store" })
        const list = await res.json()
        if (!cancelled && Array.isArray(list)) {
          const mapped = list.map((s: any) => ({ id: s.id, title: s.title, createdAt: s.createdAt }))
          replaceConversationsForAgent(agent.id, mapped)
        }
      } catch {}
    })()
    return () => {
      cancelled = true
    }
  }, [agent?.id, replaceConversationsForAgent])

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header with workspace picker */}
      <div className="p-3 border-b space-y-3">
          <WorkspaceSwitcher />
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="bg-transparent outline-none text-sm w-full" placeholder="搜索会话…" />
          <Button
            size="icon"
            variant="ghost"
            onClick={async () => {
              if (!agent?.id) return
              try {
                const r = await fetch(`/api/sessions/${agent.id}`, { method: 'POST' })
                const j = await r.json().catch(() => ({}))
                if (r.ok && j?.id) {
                  // insert locally without reloading
                  addConversation({ id: j.id, agentId: agent.id, title: j.title, createdAt: j.createdAt })
                  setActive(j.id)
                  toast({ title: '已新建会话' })
                } else {
                  // fallback to local create if backend not ready
                  const c = createConversation({ agentId: agent.id })
                  setActive(c.id)
                  toast({ title: '已新建会话（本地）' })
                }
              } catch {
                const c = createConversation({ agentId: agent.id })
                setActive(c.id)
                toast({ title: '已新建会话（本地）' })
              }
            }}
            title="新建会话"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {/* Agent selector inside current workspace */}
            <Select
          value={agent?.id}
          onValueChange={(v) => {
            setCurrentAgentId(v)
            // 仅切换列表状态，不跳转 URL
            const convos = conversations.filter((c)=>c.agentId===v)
            if (convos.length>0) {
              setActive(convos[0].id)
            } else {
              // 先本地创建会话并选中
              const c = createConversation({ agentId: v })
              setActive(c.id)
              // 异步尝试从后端拉一个会话（如果有）并替换本地
              fetch(`/api/sessions/${v}`, { cache: 'no-store' })
                .then(r=>r.json())
                .then(list=>{
                  if (Array.isArray(list) && list.length>0) {
                    const mapped = list.map((s: any) => ({ id: s.id, title: s.title, createdAt: s.createdAt }))
                    replaceConversationsForAgent(v, mapped)
                    setActive(mapped[0].id)
                  }
                }).catch(()=>{})
            }
          }}
        >
          <SelectTrigger className="h-8">
            <SelectValue placeholder="选择 Agent" />
          </SelectTrigger>
          <SelectContent>
            {agentsInWs.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                {a.name}
              </SelectItem>
            ))}
            {agentsInWs.length === 0 && (
              <div className="px-2 py-1 text-xs text-muted-foreground">该工作区暂无 Agent</div>
            )}
          </SelectContent>
        </Select>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-2 space-y-2">
          {filteredConvos.map((c) => (
            <div
              key={c.id}
              className={cn(
                "group rounded-md p-2 border bg-background hover:bg-muted transition",
                activeId === c.id && "border-primary/30 bg-primary/5",
              )}
            >
              <div className="flex items-center gap-2">
                {editingId === c.id ? (
                  <div className="flex-1 min-w-0">
                    <input
                      className="w-full h-7 px-2 rounded border bg-background text-sm outline-none focus:ring-2 focus:ring-primary"
                      autoFocus
                      value={editingTitle}
                      onChange={(e) => setEditingTitle(e.target.value)}
                      onKeyDown={async (e) => {
                        if (e.key === 'Enter') {
                          const title = editingTitle.trim()
                          if (!title) return setEditingId(null)
                          const r = await fetch(`/api/session/${c.id}`, {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ title }),
                          })
                          if (r.ok) {
                            renameConversation(c.id, title)
                            toast({ title: '已更新会话标题' })
                          } else {
                            toast({ title: '更新失败', description: '请稍后重试' })
                          }
                          setEditingId(null)
                        }
                        if (e.key === 'Escape') setEditingId(null)
                      }}
                      onBlur={() => setEditingId(null)}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setActive(c.id)}
                    className="flex-1 min-w-0 text-left"
                  >
                    <div className="text-sm font-medium truncate">{c.title || agent?.name || "新会话"}</div>
                    <div className="text-xs text-muted-foreground" suppressHydrationWarning>
                      {mounted ? new Date(c.createdAt).toLocaleString() : ""}
                    </div>
                  </button>
                )}
                <button
                  title="重命名"
                  className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-muted"
                  onClick={() => {
                    setEditingId(c.id)
                    setEditingTitle(c.title || "")
                  }}
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  title="删除会话"
                  className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-destructive/10 text-destructive"
                  onClick={() => setConfirmDeleteId(c.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
          {filteredConvos.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-6">当前 Agent 暂无会话，点击右上角「+」开始。</div>
          )}
        </div>
      </ScrollArea>

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!confirmDeleteId} onOpenChange={(open) => !open && setConfirmDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>删除会话</AlertDialogTitle>
            <AlertDialogDescription>此操作不可撤销，确认要删除这个会话吗？</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-white hover:bg-destructive/90"
              onClick={async () => {
                if (!confirmDeleteId) return
                const r = await fetch(`/api/session/${confirmDeleteId}`, { method: "DELETE" })
                if (r.ok) {
                  await reloadSessions()
                  toast({ title: '已删除会话' })
                } else {
                  toast({ title: '删除失败', description: '请稍后重试' })
                }
                setConfirmDeleteId(null)
              }}
            >
              删除
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="p-3 border-t">
        <Button variant="secondary" className="w-full" asChild>
          <Link href="/explore">
            <Sparkles className="w-4 h-4 mr-2" />
            浏览探索
          </Link>
        </Button>
      </div>
    </div>
  )
}
