"use client"

import Link from "next/link"
import { useEffect, useMemo, useState, useRef } from "react"
import { useConvoStore, useAgentCatalog, useWorkspaceStore } from "@/lib/stores"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AgentQuickSettings } from "@/components/agent/agent-quick-settings"
import { Settings } from "lucide-react"
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

export function WorkspaceSidebar({
  defaultAgentId = "demo",
  currentAgentId,
}: {
  defaultAgentId?: string
  currentAgentId?: string
}) {
  const { conversations, createConversation, addConversation, activeId, setActive, replaceConversationsForAgent, renameConversation, deleteConversation } = useConvoStore()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editingTitle, setEditingTitle] = useState<string>("")
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null)
  const [openSettings, setOpenSettings] = useState(false)
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
      const response = await api.getSessions(agent.id)
      const list = Array.isArray(response) ? response : response?.data ?? []
      if (Array.isArray(list)) {
        const mapped = list.map((s: any) => ({ id: s.id, title: s.title, createdAt: s.createdAt }))
        replaceConversationsForAgent(agent.id, mapped)
      }
    } catch (error) {
    }
  }

  // Fetch sessions when agent changes
  // 避免重复调用：仅当 agentId 实际变化时拉取
  const lastFetchedRef = useRef<string | null>(null)
  useEffect(() => {
    if (!agent?.id) return
    // 如果已经为这个agent获取过会话，就不再重复获取
    if (lastFetchedRef.current === agent.id) return
    lastFetchedRef.current = agent.id
    
    // 使用 reloadSessions 函数来保持一致性
    reloadSessions()
  }, [agent?.id])

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
                const j = await api.createSession(agent.id)
                if (j?.id) {
                  // insert locally without reloading
                  addConversation({ id: j.id, agentId: agent.id, title: j.title, createdAt: j.createdAt })
                  setActive(j.id)
                  toast({ title: '已新建会话' })
                } else {
                  // 后端创建失败，显示错误信息
                  toast({ title: '创建会话失败', description: j?.message || '请稍后重试' })
                }
              } catch (error) {
                // 网络错误，显示错误信息
                toast({ title: '创建会话失败', description: '网络错误，请稍后重试' })
              }
            }}
            title="新建会话"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        {/* Agent selector inside current workspace */}
        <div className="flex items-center gap-2">
          <Select
            value={agent?.id}
            onValueChange={(v) => {
              setCurrentAgentId(v)
              // 仅切换列表状态，不跳转 URL
              const convos = conversations.filter((c)=>c.agentId===v)
              if (convos.length>0) {
                setActive(convos[0].id)
              } else {
                // 直接从后端拉取会话，不创建假会话
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
            <SelectTrigger className="h-8 flex-1">
              <SelectValue placeholder="选择 Agent">
                {agent && (
                  <span className="text-sm truncate max-w-[120px] inline-block" title={agent.name}>
                    {agent.name}
                  </span>
                )}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              {agentsInWs.map((a) => (
                <SelectItem key={a.id} value={a.id}>
                  <span className="text-sm truncate max-w-[180px] inline-block" title={a.name}>
                    {a.name}
                  </span>
                </SelectItem>
              ))}
              {agentsInWs.length === 0 && (
                <div className="px-2 py-1 text-xs text-muted-foreground">该工作区暂无 Agent</div>
              )}
            </SelectContent>
          </Select>
          <Button
            size="sm"
            variant="outline"
            className="h-8 w-8 p-0"
            onClick={() => setOpenSettings(true)}
            title="Agent设置"
            disabled={!agent}
          >
            <Settings className="h-4 w-4" />
          </Button>
        </div>
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
                try {
                  await api.deleteSession(confirmDeleteId)
                  await reloadSessions()
                  toast({ title: '已删除会话' })
                } catch (error) {
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

      <div className="p-3 border-t space-y-2">
        <Button variant="secondary" className="w-full" asChild>
          <Link href="/explore" prefetch={false}>
            <Sparkles className="w-4 h-4 mr-2" />
            浏览探索
          </Link>
        </Button>
        
      </div>

      {/* Agent Quick Settings Dialog */}
      {agent && (
        <AgentQuickSettings 
          open={openSettings} 
          onOpenChange={setOpenSettings} 
          agent={agent} 
        />
      )}
    </div>
  )
}
