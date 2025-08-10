"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAgentCatalog } from "@/lib/stores"

export default function ToolsPage() {
  const { agents, upsertAgent } = useAgentCatalog()
  const a = agents[0]
  if (!a) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="text-sm text-muted-foreground">暂无 Agent，请先到「工作室」创建一个。</div>
      </div>
    )
  }
  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">全局工具开关（示例）</h1>
        <p className="text-muted-foreground text-sm">为演示目的，我们对第一个 Agent 的工具进行配置。</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>{a.name}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "webSearch", label: "Web 搜索" },
            { key: "calculator", label: "计算器" },
            { key: "http", label: "HTTP GET" },
          ].map((t) => (
            <div key={t.key} className="flex items-center justify-between">
              <Label>{t.label}</Label>
              <Switch
                checked={(a.tools as any)?.[t.key]}
                onCheckedChange={(v) => upsertAgent({ ...a, tools: { ...a.tools, [t.key]: v } as any })}
              />
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
