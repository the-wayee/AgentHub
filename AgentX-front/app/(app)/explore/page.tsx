"use client"

import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { AgentCard } from "@/components/agent/agent-card"
import { useAgentCatalog } from "@/lib/stores"
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
        const r = await fetch(`/api/published${params.toString() ? `?${params.toString()}` : ""}`, { cache: "no-store" })
        const list = await r.json()
        if (!cancelled && Array.isArray(list)) {
          setAgents(list)
          setAll(list)
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
    const data = agents.filter((a) => a.visibility === "public")
    if (!lower) return data
    return data.filter(
      (a) =>
        a.name.toLowerCase().includes(lower) ||
        (a.description || "").toLowerCase().includes(lower) ||
        (a.tags || []).some((t) => t.toLowerCase().includes(lower)),
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
          <Link href="/explore" className="text-sm text-muted-foreground hover:underline">
            查看全部
          </Link>
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
