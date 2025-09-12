"use client"

import { AgentBuilder } from "@/components/agent/agent-builder"
import { useEffect, useState } from "react"
import { MyAgentCard } from "@/components/agent/my-agent-card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Plus } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { StudioPageSkeleton } from "@/components/ui/page-skeleton"
import { api } from "@/lib/api"

function PublishDialog({ agentId, onPublished }: { agentId: string; onPublished?: () => void }) {
  const [open, setOpen] = useState(false)
  const [versionNumber, setVersionNumber] = useState("")
  const [changeLog, setChangeLog] = useState("")
  const [submitting, setSubmitting] = useState(false)
  async function submit() {
    if (!versionNumber.trim()) return
    setSubmitting(true)
    try {
      await api.publishAgent(agentId, versionNumber, changeLog)
      onPublished?.()
      setOpen(false)
    } finally {
      setSubmitting(false)
    }
  }
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button id={`publish-${agentId}`} />
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>发布版本</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div>
            <div className="text-sm mb-1">版本号</div>
            <Input value={versionNumber} onChange={(e) => setVersionNumber(e.target.value)} placeholder="例如 1.0.1" />
          </div>
          <div>
            <div className="text-sm mb-1">版本日志</div>
            <Textarea rows={5} value={changeLog} onChange={(e) => setChangeLog(e.target.value)} placeholder="本次变更说明…" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button disabled={submitting || !versionNumber.trim()} onClick={submit}>
            {submitting ? "发布中…" : "确认发布"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default function StudioPage() {
  const [myAgents, setMyAgents] = useState<any[]>([])
  const [openCreate, setOpenCreate] = useState(false)
  const [q, setQ] = useState("")
  const [enabled, setEnabled] = useState<string>("all")
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  async function reload() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (q.trim()) params.set("name", q.trim())
      if (enabled !== "all") params.set("enable", enabled)
      const response = await api.getAgents(params)
      const list = Array.isArray(response) ? response : (response?.data || [])
      if (Array.isArray(list)) setMyAgents(list)
    } catch (error) {
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    reload()
  }, [])

  if (loading) {
    return <StudioPageSkeleton />
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">我的 Agent</h1>
        <div className="flex items-center gap-2">
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="搜索名称…" className="w-56" />
          <Select value={enabled} onValueChange={setEnabled}>
            <SelectTrigger className="w-28">
              <SelectValue placeholder="状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">全部</SelectItem>
              <SelectItem value="true">启用</SelectItem>
              <SelectItem value="false">禁用</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={reload} variant="secondary">搜索</Button>
        </div>
        <Dialog open={openCreate} onOpenChange={(o)=>{ if(!o) setSelectedAgent(null); setOpenCreate(o) }}>
          <DialogTrigger asChild>
            <Button className="bg-black text-white hover:bg-black/90" onClick={()=> setSelectedAgent(null)}>
              <Plus className="w-4 h-4 mr-2" /> 创建 Agent
            </Button>
          </DialogTrigger>
          <DialogContent className="w-[95vw] max-w-[1100px] sm:max-w-[1100px] md:max-w-[1100px] lg:max-w-[1100px]">
            <DialogHeader>
              <DialogTitle>{selectedAgent ? '编辑助理' : '创建助理'}</DialogTitle>
            </DialogHeader>
            <AgentBuilder agent={selectedAgent ?? undefined} showTitle={false} onCancel={() => setOpenCreate(false)} onSave={() => { setOpenCreate(false); reload() }} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {myAgents.map((a) => (
          <div key={a.id} className="relative">
            <MyAgentCard agent={a} onEdit={() => { setSelectedAgent(a); setOpenCreate(true) }} onDelete={async ()=>{
              await api.deleteAgent(a.id)
              reload()
            }} onToggle={() => reload()} onPublish={() => {
              const trigger = document.getElementById(`publish-${a.id}`)
              trigger?.click()
            }} />
            {/* hidden dialog trigger per-card */}
            <div className="sr-only">
              <PublishDialog agentId={a.id} onPublished={reload} />
            </div>
          </div>
        ))}
        {myAgents.length === 0 && (
          <div className="text-sm text-muted-foreground py-8">你还没有创建 Agent，点击右上角「创建 Agent」。</div>
        )}
      </div>
    </div>
  )
}
