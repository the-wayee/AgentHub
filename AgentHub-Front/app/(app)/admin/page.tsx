"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { PublishStatusLabel, type AgentVersion, type PublishStatusCode } from "@/lib/admin-types"
import { CheckCircle2, Clock, XCircle } from "lucide-react"
import { AdminPageSkeleton } from "@/components/ui/page-skeleton"
import { api } from "@/lib/api"

export default function AdminPage() {
  const [status, setStatus] = useState<PublishStatusCode>(1)
  const [versions, setVersions] = useState<AgentVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState<AgentVersion | null>(null)
  const [reason, setReason] = useState("")
  const [count, setCount] = useState({ reviewing: 0, published: 0, rejected: 0 })

  async function fetchList(s: PublishStatusCode) {
    const list = await api.getAdminAgentVersions(s)
    return (Array.isArray(list) ? list : list?.data) as AgentVersion[]
  }

  async function reload() {
    setLoading(true)
    try {
      // 只获取当前状态的数据
      const currentData = await fetchList(status)
      setVersions(currentData || [])
    } finally {
      setLoading(false)
    }
  }

  // 获取所有状态的统计数据（仅初始化时使用）
  async function loadAllCounts() {
    try {
      // 只获取当前状态（status=1）的数据
      const currentData = await fetchList(1 as PublishStatusCode)
      const currentCount = (currentData || []).length
      
      // 同时设置数据和计数，避免重复调用
      setVersions(currentData || [])
      setCount({ 
        reviewing: currentCount, 
        published: 0, 
        rejected: 0 
      })
      setLoading(false)
    } catch (error) {
      setLoading(false)
    }
  }

  // 单独获取统计数据 - 只获取当前状态的数据
  async function loadCounts() {
    try {
      // 只获取当前状态的数据
      const currentData = await fetchList(status)
      const currentCount = (currentData || []).length
      
      // 根据当前状态更新对应的计数
      setCount(prev => ({
        ...prev,
        ...(status === 1 && { reviewing: currentCount }),
        ...(status === 2 && { published: currentCount }),
        ...(status === 3 && { rejected: currentCount })
      }))
    } catch (error) {
    }
  }



  useEffect(() => {
    // 只有在状态改变时才重新加载（不是初始化）
    if (versions.length > 0 || status !== 1) {
      reload()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status])

  // 初始化时加载数据
  useEffect(() => {
    loadAllCounts()
  }, [])

  async function updateStatus(versionId: string, next: PublishStatusCode) {
    try {
      await api.updateAdminAgentVersionStatus(versionId, next, reason)
      setSelected(null)
      setReason("")
      // 更新操作后，重新加载当前列表和统计数据
      await Promise.all([reload(), loadCounts()])
    } catch (error) {
      console.error('更新状态失败:', error)
    }
  }

  const title = useMemo(() => "Agent 审核后台", [])

  if (loading) {
    return <AdminPageSkeleton />
  }

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


