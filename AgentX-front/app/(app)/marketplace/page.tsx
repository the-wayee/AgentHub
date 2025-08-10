"use client"

import { useMemo, useState } from "react"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AgentCard } from "@/components/agent/agent-card"
import { useAgentCatalog, useWorkspaceStore } from "@/lib/stores"
import type { Agent } from "@/lib/types"

export default function MarketplacePage() {
  const { agents } = useAgentCatalog()
  const { workspaces } = useWorkspaceStore()
  const [q, setQ] = useState("")
  const [type, setType] = useState<"all" | "chat" | "function">("all")
  const [ws, setWs] = useState<string>("all")

  const publicAgents = useMemo(() => agents.filter((a) => a.visibility === "public"), [agents])

  const filtered = useMemo(() => {
    return publicAgents.filter((a) => {
      const matchType = type === "all" ? true : a.type === type
      const matchWs = ws === "all" ? true : a.workspaceId === ws
      const matchQ =
        !q ||
        a.name.toLowerCase().includes(q.toLowerCase()) ||
        (a.description || "").toLowerCase().includes(q.toLowerCase()) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(q.toLowerCase()))
      return matchType && matchWs && matchQ
    })
  }, [publicAgents, q, type, ws])

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-end justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-semibold">插件市场</h1>
          <p className="text-sm text-muted-foreground">浏览并安装社区发布的 Agent，或克隆进行二次编辑。</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索名称、描述或标签…"
            className="md:w-72"
          />
          <Select value={type} onValueChange={(v: "all" | "chat" | "function") => setType(v)}>
            <SelectTrigger className="w-32">
              <SelectValue placeholder="类型" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部类型</SelectItem>
              <SelectItem value="chat">聊天助理</SelectItem>
              <SelectItem value="function">功能助理</SelectItem>
            </SelectContent>
          </Select>
          <Select value={ws} onValueChange={setWs}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="工作区" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部工作区</SelectItem>
              {workspaces.map((w) => (
                <SelectItem key={w.id} value={w.id}>
                  {w.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="text-xs text-muted-foreground">为你找到 {filtered.length} 个插件</div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((agent: Agent) => (
          <AgentCard key={agent.id} agent={agent} />
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-sm text-muted-foreground py-12 text-center">没有匹配的插件，试试更少的筛选条件。</div>
      )}
    </div>
  )
}
