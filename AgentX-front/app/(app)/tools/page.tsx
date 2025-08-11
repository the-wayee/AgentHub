"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { useAgentCatalog } from "@/lib/stores"

export default function ToolsPage() {
  const presets = [
    { name: "Web 搜索", desc: "接入实时搜索引擎以获取最新信息", enabled: true },
    { name: "天气预报", desc: "查询指定城市的实时/未来天气", enabled: false },
    { name: "Wiki 百科", desc: "检索维基百科词条并返回摘要", enabled: true },
    { name: "汇率换算", desc: "支持多币种实时汇率换算", enabled: false },
  ]

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">工具库（示例）</h1>
        <p className="text-muted-foreground text-sm">以下为演示用的内置工具集合，后续可接入真实后端。</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {presets.map((t) => (
          <Card key={t.name}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{t.name}</span>
                <span className="text-xs text-muted-foreground">{t.enabled ? "已启用" : "未启用"}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">{t.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
