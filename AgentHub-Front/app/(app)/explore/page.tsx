"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AgentCard } from "@/components/agent/agent-card"
import { useAgentCatalog } from "@/lib/stores"
import { api } from "@/lib/api"
import { ExplorePageSkeleton } from "@/components/ui/page-skeleton"

export default function ExplorePage() {
  const { setAll } = useAgentCatalog()
  const [agents, setAgents] = useState<any[]>([])
  const [q, setQ] = useState("")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    ;(async () => {
      try {
        const params = new URLSearchParams()
        if (q.trim()) params.set("name", q.trim())
        const result = await api.getPublishedAgents(params)
        const raw = Array.isArray(result) ? result : (result?.data ?? [])
        const mapped = raw.map((v: any) => ({
          id: v.agentId || v.id,
          name: v.name,
          description: v.description,
          version: v.versionNumber || v.version || "",
          visibility: "public" as const,
          type: v.agentType === 'FUNCTIONAL_AGENT' ? 'function' : 'chat',
          tags: v.tags || [],
          systemPrompt: v.systemPrompt,
          welcomeMessage: v.welcomeMessage,
          publishStatus: v.publishStatus,
          publishStatusLabel: v.publishStatusText || v.publishStatusLabel,
          updatedAt: v.publishedAt || v.updatedAt,
        }))
        if (!cancelled) {
          setAgents(mapped)
          setAll(mapped)
        }
      } catch {}
      finally {
        if (!cancelled) setLoading(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [setAll, q])

  const list = useMemo(() => {
    const lower = q.trim().toLowerCase()
    const data = agents
    if (!lower) return data
    return data.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        (a.description || "").toLowerCase().includes(lower) ||
        (a.tags || []).some((t: string) => t.toLowerCase().includes(lower)),
    )
  }, [agents, q])

  const trending = useMemo(() => list.slice(0, 6), [list])
  const latest = useMemo(() => list.slice().reverse().slice(0, 6), [list])

  if (loading) {
    return <ExplorePageSkeleton />
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">探索</h1>
          <p className="text-sm text-muted-foreground">发现优秀的 Agent 与灵感合集。</p>
        </div>
        <div className="flex items-center gap-2 w-full md:w-auto">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="搜索已上架 Agent（名称）…"
            className="md:w-80"
          />
          <Button variant="secondary" onClick={() => { /* effect 基于 q 自动触发 */ }}>
            搜索
          </Button>
        </div>
      </header>

      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">精选</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {trending.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
          {trending.length === 0 && (
            <div className="text-sm text-muted-foreground py-8">暂无已发布的 Agent。发布你的第一个 Agent 或稍后再来看看。</div>
          )}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium">最新发布</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latest.map((a) => (
            <AgentCard key={a.id} agent={a} />
          ))}
        </div>
      </section>
    </div>
  )
}
