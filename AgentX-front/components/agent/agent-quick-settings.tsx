"use client"

import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import type { Agent } from "@/lib/types"
import { useAgentCatalog } from "@/lib/stores"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent
}

export function AgentQuickSettings({ open, onOpenChange, agent }: Props) {
  const { upsertAgent } = useAgentCatalog()

  const [draft, setDraft] = useState<Agent>(agent)
  type ModelItem = { id: string; name: string; modelId: string; description?: string; official?: boolean; config?: { maxContextLength?: number } }
  type ProviderInfo = { protocol: string; name?: string; description?: string; official?: boolean }
  type ProviderBlock = { provider: ProviderInfo; models: ModelItem[] }
  const [providerBlocks, setProviderBlocks] = useState<ProviderBlock[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [selectedModelId, setSelectedModelId] = useState<string>("")
  const [ctxLen, setCtxLen] = useState<number>(0)

  useEffect(() => {
    if (open) setDraft(agent)
  }, [open, agent])

  // 加载活跃模型列表（按服务商分组）
  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        const r = await fetch('/api/llm/models/active', { cache: 'no-store' })
        const json = await r.json()
        const list = Array.isArray(json) ? json : (json?.data ?? [])
        if (cancelled) return
        setProviderBlocks(list)
        // 去重 Provider（按 protocol）
        const seen: Record<string, { official: boolean; label: string }> = {}
        for (const it of list as ProviderBlock[]) {
          const proto = it?.provider?.protocol || it?.provider?.name || ""
          if (!proto) continue
          const off = !!it?.provider?.official
          if (!seen[proto]) seen[proto] = { official: off, label: it?.provider?.name || it?.provider?.protocol || proto }
          else seen[proto].official = seen[proto].official || off
        }
        const uniq = Object.keys(seen)
        const firstProvider = uniq[0] || ""
        setSelectedProvider(firstProvider)
        const firstBlock = (list as ProviderBlock[]).find(b => (b.provider.protocol || b.provider.name) === firstProvider)
        const models = (firstBlock?.models as ModelItem[] | undefined) || []
        const firstModelId = models[0]?.id || ""
        setSelectedModelId(firstModelId)
        setCtxLen(models[0]?.config?.maxContextLength ?? 0)
      } catch {}
    })()
    return () => { cancelled = true }
  }, [open])

  // 当选择的 Provider 变化时，自动选中其第一个模型并刷新上下文长度
  useEffect(() => {
    if (!selectedProvider || providerBlocks.length === 0) return
    const block = providerBlocks.find(pb => (pb.provider.protocol || pb.provider.name) === selectedProvider)
    if (!block) return
    const models = block.models || []
    const firstModelId = models[0]?.id || ""
    if (!selectedModelId || !models.find(m => m.id === selectedModelId)) {
      setSelectedModelId(firstModelId)
      setCtxLen(models[0]?.config?.maxContextLength ?? 0)
      setDraft({ ...draft, model: { ...draft.model!, provider: selectedProvider, model: models[0]?.name || "" } })
    }
  }, [selectedProvider, providerBlocks])

  function save() {
    upsertAgent({ ...agent, ...draft })
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" aria-describedby="qs-desc">
        <DialogHeader>
          <DialogTitle>Agent 设置</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground" id="qs-desc">
          快速调整 Agent 的名称、模型与工具配置。保存后立即生效。
        </p>
        <div className="space-y-4">
          <div className="grid gap-1.5">
            <Label>名称</Label>
            <Input
              value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              placeholder="给你的 Agent 起个名字"
            />
          </div>
          <div className="grid gap-1.5">
            <Label>描述</Label>
            <Textarea
              rows={3}
              value={draft.description || ""}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              placeholder="一句话描述能力与使用场景…"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>Provider</Label>
            <Select
              value={selectedProvider}
              onValueChange={(v) => {
                setSelectedProvider(v)
                setDraft({ ...draft, model: { ...draft.model!, provider: v } })
                const models = (providerBlocks.find(pb => (pb.provider.protocol || pb.provider.name) === v)?.models) || []
                const nextModelId = models[0]?.id || ""
                setSelectedModelId(nextModelId)
                setCtxLen(models[0]?.config?.maxContextLength ?? 0)
              }}
            >
              <SelectTrigger className="h-10 rounded-md border border-muted-foreground/20 bg-background hover:bg-muted/50 px-3">
                <SelectValue placeholder="选择 provider" />
              </SelectTrigger>
              <SelectContent className="max-h-80 w-[260px]">
                {Array.from(new Map(providerBlocks.map(pb => {
                  const v = pb.provider.protocol || pb.provider.name || ""
                  const label = pb.provider.name || pb.provider.protocol || v
                  const official = !!pb.provider.official
                  return [v, { v, label, official }]
                })).values()).map((p) => (
                  <SelectItem key={p.v} value={p.v} className="cursor-pointer">
                    <span className="inline-flex items-center gap-2">
                      {p.label}
                      {p.official && <span className="text-emerald-600 text-2xs">官方</span>}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Model</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              {((providerBlocks.find(pb => (pb.provider.protocol || pb.provider.name) === selectedProvider)?.models) || []).map((m) => {
                const isSelected = selectedModelId === m.id
                return (
                  <Card
                    key={m.id}
                    className={`p-4 cursor-pointer ${isSelected ? 'ring-2 ring-primary' : ''}`}
                    onClick={() => {
                      setSelectedModelId(m.id)
                      setDraft({ ...draft, model: { ...draft.model!, model: m.name || "" } })
                      setCtxLen(m?.config?.maxContextLength ?? 0)
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium truncate">{m.name}</div>
                      {m.official && <Badge className="bg-emerald-600 hover:bg-emerald-600">官方</Badge>}
                    </div>
                    {m.description && (
                      <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{m.description}</div>
                    )}
                  </Card>
                )
              })}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>最长上下文 {ctxLen}</Label>
            <Slider
              value={[ctxLen]}
              min={0}
              max={200000}
              step={100}
              onValueChange={([v]) => setCtxLen(v)}
            />
          </div>

          <div className="grid gap-3">
            <Toggle
              title="Web 搜索"
              desc="允许模型检索实时信息"
              checked={!!draft.tools?.webSearch}
              onChange={(v) => setDraft({ ...draft, tools: { ...draft.tools, webSearch: v } })}
            />
            <Toggle
              title="计算器"
              desc="执行数学表达式"
              checked={!!draft.tools?.calculator}
              onChange={(v) => setDraft({ ...draft, tools: { ...draft.tools, calculator: v } })}
            />
            <Toggle
              title="HTTP GET"
              desc="调用外部 API（GET）"
              checked={!!draft.tools?.http}
              onChange={(v) => setDraft({ ...draft, tools: { ...draft.tools, http: v } })}
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>
            取消
          </Button>
          <Button onClick={save}>保存</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
function Toggle({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string
  desc: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm font-medium">{title}</div>
        <div className="text-xs text-muted-foreground">{desc}</div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}

