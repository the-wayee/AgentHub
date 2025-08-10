"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Plus, Search, Sparkles } from "lucide-react"
import { useConvoStore, useAgentCatalog, useWorkspaceStore } from "@/lib/stores"
import { cn } from "@/lib/utils"
import { WorkspaceSwitcher } from "./workspace-switcher"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useMemo } from "react"

export function WorkspaceSidebar({
  defaultAgentId = "demo",
  currentAgentId,
}: {
  defaultAgentId?: string
  currentAgentId?: string
}) {
  const router = useRouter()
  const { conversations, createConversation, activeId, setActive } = useConvoStore()
  const { agents } = useAgentCatalog()
  const { selectedId, setSelected } = useWorkspaceStore()

  // Agents under current workspace
  const agentsInWs = useMemo(() => agents.filter((a) => a.workspaceId === selectedId), [agents, selectedId])

  // Current agent
  const agent = useMemo(() => {
    return agents.find((a) => a.id === (currentAgentId || defaultAgentId)) || agentsInWs[0] || agents[0]
  }, [agents, agentsInWs, currentAgentId, defaultAgentId])

  const filteredConvos = useMemo(() => conversations.filter((c) => c.agentId === agent?.id), [conversations, agent?.id])

  return (
    <div className="h-full flex flex-col">
      {/* Header with workspace picker */}
      <div className="p-3 border-b space-y-3">
        <WorkspaceSwitcher />
        <div className="flex items-center gap-2">
          <Search className="w-4 h-4 text-muted-foreground" />
          <input className="bg-transparent outline-none text-sm w-full" placeholder="搜索会话…" />
          <Button
            size="icon"
            variant="ghost"
            onClick={() => {
              const c = createConversation({ agentId: agent?.id || defaultAgentId })
              setActive(c.id)
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
            router.push(`/chat/${v}`)
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
            <Link
              key={c.id}
              href={`/chat/${agent?.id || defaultAgentId}`}
              onClick={() => setActive(c.id)}
              className={cn(
                "block rounded-md p-2 border bg-background hover:bg-muted transition",
                activeId === c.id && "border-primary/30 bg-primary/5",
              )}
            >
              <div className="text-sm font-medium truncate">{c.title || agent?.name || "新会话"}</div>
              <div className="text-xs text-muted-foreground">{new Date(c.createdAt).toLocaleString()}</div>
            </Link>
          ))}
          {filteredConvos.length === 0 && (
            <div className="text-xs text-muted-foreground px-2 py-6">当前 Agent 暂无会话，点击右上角「+」开始。</div>
          )}
        </div>
      </ScrollArea>

      <div className="p-3 border-t">
        <Button variant="secondary" className="w-full" asChild>
          <Link href="/marketplace">
            <Sparkles className="w-4 h-4 mr-2" />
            浏览插件
          </Link>
        </Button>
      </div>
    </div>
  )
}
