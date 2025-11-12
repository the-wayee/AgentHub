"use client"

import { useState } from "react"
import { useKbStore, KnowledgeBase } from "@/lib/knowledge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Library, Download, Plus, Trash2 } from "lucide-react"

export function KnowledgeSidebar() {
  const kbs = useKbStore((s) => s.kbs)
  const selectedKbId = useKbStore((s) => s.selectedKbId)
  const selectKb = useKbStore((s) => s.selectKb)
  const createKb = useKbStore((s) => s.createKb)
  const removeKb = useKbStore((s) => s.removeKb)
  const [creating, setCreating] = useState(false)
  const [name, setName] = useState("")

  const mine = kbs.filter((k) => k.kind === "mine")
  const installed = kbs.filter((k) => k.kind === "installed")

  const onCreate = () => {
    if (!name.trim()) return
    createKb(name.trim())
    setName("")
    setCreating(false)
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm font-medium">知识库列表</div>
        <Button size="sm" variant="outline" onClick={() => setCreating((v) => !v)}>
          <Plus className="w-4 h-4 mr-1" /> 新建
        </Button>
      </div>
      {creating && (
        <div className="flex items-center gap-2 mb-3">
          <Input placeholder="知识库名称" value={name} onChange={(e) => setName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' ? onCreate() : undefined} />
          <Button size="sm" onClick={onCreate}>创建</Button>
        </div>
      )}

      <Section title="我的知识库" icon={<Library className="w-4 h-4" />}>
        {mine.length === 0 && <Empty text="暂无" />}
        {mine.map((kb) => (
          <KbItem key={kb.id} kb={kb} active={kb.id === selectedKbId} onClick={() => selectKb(kb.id)} onRemove={() => removeKb(kb.id)} />
        ))}
      </Section>

      <Separator className="my-3" />

      <Section title="已安装" icon={<Download className="w-4 h-4" />}>
        {installed.length === 0 && <Empty text="暂无" />}
        {installed.map((kb) => (
          <KbItem key={kb.id} kb={kb} active={kb.id === selectedKbId} onClick={() => selectKb(kb.id)} onRemove={() => removeKb(kb.id)} installed />
        ))}
      </Section>
    </div>
  )
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-xs text-muted-foreground mb-1 inline-flex items-center gap-1">{icon}{title}</div>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

function Empty({ text }: { text: string }) {
  return <div className="text-xs text-muted-foreground py-2">{text}</div>
}

function KbItem({ kb, active, onClick, onRemove, installed }: { kb: KnowledgeBase; active?: boolean; onClick: () => void; onRemove: () => void; installed?: boolean }) {
  const fileCount = kb.docs.length
  return (
    <div className={`px-2 py-2 rounded-md border cursor-pointer ${active ? 'bg-muted border-primary/40' : 'hover:bg-muted/40'}`} onClick={onClick}>
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-sm font-medium truncate">{kb.name}</div>
          <div className="text-xs text-muted-foreground">{new Date(kb.updatedAt).toLocaleDateString()} · 文件 {fileCount}</div>
        </div>
        <div className="flex items-center gap-2">
          {installed ? <Badge variant="secondary">安装</Badge> : null}
          <Button size="icon" variant="ghost" onClick={(e) => { e.stopPropagation(); onRemove() }}>
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
