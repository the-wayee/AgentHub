"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PublishStatusLabel, type AgentVersion, type PublishStatusCode } from "@/lib/admin-types"
import { CheckCircle2, Clock, XCircle } from "lucide-react"

export default function AdminPage() {
  const [status, setStatus] = useState<PublishStatusCode>(1)
  const [versions, setVersions] = useState<AgentVersion[]>([])
  const [loading, setLoading] = useState(false)
  const [selected, setSelected] = useState<AgentVersion | null>(null)
  const [reason, setReason] = useState("")
  const [count, setCount] = useState({ reviewing: 0, published: 0, rejected: 0 })

  async function fetchList(s: PublishStatusCode) {
    const r = await fetch(`/api/admin/agent/versions?status=${s}`, { cache: "no-store" })
    const list = await r.json()
    return (Array.isArray(list) ? list : list?.data) as AgentVersion[]
  }

  async function reload() {
    setLoading(true)
    try {
      // 去重：统一请求 1/2/3 三类一次用于统计，当前列表按 status 从中挑选
      const [r1, r2, r3] = await Promise.all([
        fetchList(1 as PublishStatusCode),
        fetchList(2 as PublishStatusCode),
        fetchList(3 as PublishStatusCode),
      ])
      const map: Record<number, AgentVersion[]> = { 1: r1 || [], 2: r2 || [], 3: r3 || [] }
      setVersions(map[status] || [])
      setCount({ reviewing: map[1].length, published: map[2].length, rejected: map[3].length })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  async function updateStatus(versionId: string, next: PublishStatusCode) {
    const qs = new URLSearchParams({ status: String(next) })
    if (next === 3 && reason.trim()) qs.set("reason", reason.trim())
    const r = await fetch(`/api/admin/agent/versions/${encodeURIComponent(versionId)}/status?${qs.toString()}`, {
      method: "POST",
    })
    if (r.ok) {
      setSelected(null)
      setReason("")
      await reload()
    }
  }

  const title = useMemo(() => "Agent 审核后台", [])

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{title}</h1>
          <p className="text-sm text-muted-foreground">管理和审核用户提交的 Agent 插件</p>
        </div>
        <div className="text-sm flex items-center gap-5">
          <span className="inline-flex items-center gap-1 text-amber-600">
            <Clock className="w-4 h-4" /> 待审核: {count.reviewing}
          </span>
          <span className="inline-flex items-center gap-1 text-green-600">
            <CheckCircle2 className="w-4 h-4" /> 已通过: {count.published}
          </span>
          <span className="inline-flex items-center gap-1 text-rose-600">
            <XCircle className="w-4 h-4" /> 已拒绝: {count.rejected}
          </span>
          <Button onClick={reload} disabled={loading}>刷新</Button>
        </div>
      </div>

      {/* 顶部筛选标签 */}
      <div className="flex items-center gap-3">
        <button
          className={`h-8 px-3 rounded-full border text-sm inline-flex items-center gap-1 ${status === 1 ? "bg-amber-50 border-amber-200 text-amber-700" : "bg-background"}`}
          onClick={() => setStatus(1)}
        >
          <Clock className="w-3 h-3" /> 待审核 ({count.reviewing})
        </button>
        <button
          className={`h-8 px-3 rounded-full border text-sm inline-flex items-center gap-1 ${status === 2 ? "bg-green-50 border-green-200 text-green-700" : "bg-background"}`}
          onClick={() => setStatus(2)}
        >
          <CheckCircle2 className="w-3 h-3" /> 已通过 ({count.published})
        </button>
        <button
          className={`h-8 px-3 rounded-full border text-sm inline-flex items-center gap-1 ${status === 3 ? "bg-rose-50 border-rose-200 text-rose-700" : "bg-background"}`}
          onClick={() => setStatus(3)}
        >
          <XCircle className="w-3 h-3" /> 已拒绝 ({count.rejected})
        </button>
      </div>

      <div className="space-y-4">
        {versions.map((v) => (
          <Card key={v.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="truncate flex items-center gap-2">
                  <span className="font-medium truncate">{v.name || `#${v.agentId}`}</span>
                  {v.publishStatus && (
                    <Badge className={v.publishStatus === 1 ? "bg-amber-100 text-amber-700" : v.publishStatus === 2 ? "bg-green-100 text-green-700" : v.publishStatus === 3 ? "bg-rose-100 text-rose-700" : "bg-muted text-muted-foreground"}>
                      {PublishStatusLabel[v.publishStatus]}
                    </Badge>
                  )}
                  <Badge variant="outline">{(v as any).agentType === 2 ? "功能" : "聊天"}</Badge>
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">v{v.versionNumber || "-"}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="text-sm space-y-2">
              <div className="text-muted-foreground">{v.description || "无描述"}</div>
              <div className="text-xs text-muted-foreground">版本: {v.versionNumber || "-"}　工作区: team　提交时间: {v.createdAt ? new Date(v.createdAt).toLocaleString() : "-"}</div>
              <div className="text-xs flex items-center gap-2"><span className="text-muted-foreground">标签:</span> <div className="inline-flex gap-2">{(v as any).tags?.length ? (v as any).tags.map((t: any) => <Badge key={String(t)} variant="outline">{String(t)}</Badge>) : <span className="text-muted-foreground">-</span>}</div></div>
              <div className="text-xs text-muted-foreground">模型: {v.modelConfig?.modelName || "-"}（温度: {v.modelConfig?.temperature ?? "-"}）</div>
              <div className="text-xs text-muted-foreground">工具: {(v as any).tools?.map((t: any) => t?.name || t).join(", ") || "-"}</div>
              {status === 1 && (
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" className="bg-green-600 text-white hover:bg-green-700" onClick={() => updateStatus(v.id, 2)}>通过</Button>
                  <Button size="sm" variant="destructive" onClick={() => setSelected(v)}>拒绝</Button>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
        {!loading && versions.length === 0 && (
          <div className="text-sm text-muted-foreground py-12">暂无数据</div>
        )}
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>填写拒绝原因</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="grid gap-2">
              <Textarea rows={4} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="请填写拒绝原因…" />
              <div className="flex justify-end gap-2">
                <Button variant="ghost" onClick={() => setSelected(null)}>取消</Button>
                <Button variant="destructive" disabled={!reason.trim()} onClick={() => updateStatus(selected.id, 3)}>提交拒绝</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}


