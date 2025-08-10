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

  useEffect(() => {
    if (open) setDraft(agent)
  }, [open, agent])

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
              value={draft.model?.provider || "openai"}
              onValueChange={(v) => setDraft({ ...draft, model: { ...draft.model!, provider: v } })}
            >
              <SelectTrigger>
                <SelectValue placeholder="选择 provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="openai">OpenAI</SelectItem>
                <SelectItem value="xai">xAI</SelectItem>
                <SelectItem value="groq">Groq</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-1.5">
            <Label>Model</Label>
            <Input
              value={draft.model?.model || ""}
              onChange={(e) => setDraft({ ...draft, model: { ...draft.model!, model: e.target.value } })}
              placeholder="如 gpt-4o-mini 或 grok-3"
            />
          </div>

          <div className="grid gap-1.5">
            <Label>温度 {draft.model?.temperature ?? 0.6}</Label>
            <Slider
              value={[draft.model?.temperature ?? 0.6]}
              min={0}
              max={1}
              step={0.05}
              onValueChange={([v]) => setDraft({ ...draft, model: { ...draft.model!, temperature: v } })}
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
