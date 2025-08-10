"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAgentCatalog, useKnowledgeStore } from "@/lib/stores"
import type { Agent } from "@/lib/types"
import { AgentTypeSelector } from "./agent-type-selector"
import { AgentPreview } from "./agent-preview"
import { useRouter } from "next/navigation"

const defaultModel = {
  provider: "openai",
  model: "gpt-4o-mini",
  temperature: 0.6,
  maxTokens: 1024,
}

export function AgentBuilder() {
  const { upsertAgent } = useAgentCatalog()
  const knowledge = useKnowledgeStore((s) => s.items)
  const [activeTab, setActiveTab] = useState("base")
  const router = useRouter()
  const [openPublish, setOpenPublish] = useState(false)

  const [draft, setDraft] = useState<Agent>({
    id: "custom",
    name: "我的 Agent",
    description: "个性化的智能助手",
    version: "1.0.0",
    visibility: "private",
    type: "chat",
    tags: ["assistant"],
    model: defaultModel,
    tools: { webSearch: false, calculator: true, http: false },
    systemPrompt: "你是一个专业且友好的助手。",
  })

  const toolCount = (draft.tools?.webSearch ? 1 : 0) + (draft.tools?.calculator ? 1 : 0) + (draft.tools?.http ? 1 : 0)

  function save() {
    upsertAgent({ ...draft })
    setOpenPublish(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-semibold">创建 / 编辑助理</h1>
          <p className="text-sm text-muted-foreground">选择类型，配置模型、知识库和工具。右侧提供实时预览。</p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
        {/* Left: editor */}
        <div className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-2">
              <TabsTrigger value="base">基本信息</TabsTrigger>
              <TabsTrigger value="prompt">提示词配置</TabsTrigger>
              <TabsTrigger value="tools">工具与知识库</TabsTrigger>
            </TabsList>

            <TabsContent value="base" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>选择类型</CardTitle>
                </CardHeader>
                <CardContent>
                  <AgentTypeSelector value={draft.type || "chat"} onChange={(v) => setDraft({ ...draft, type: v })} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>名称 & 简介</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid gap-1.5">
                    <Label>名称</Label>
                    <Input
                      value={draft.name}
                      onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                      placeholder="给你的助理起个名字"
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>描述</Label>
                    <Textarea
                      value={draft.description}
                      onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                      placeholder="输入助理的描述"
                      rows={4}
                    />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={draft.visibility === "public"}
                      onCheckedChange={(v) => setDraft({ ...draft, visibility: v ? "public" : "private" })}
                      id="visibility"
                    />
                    <Label htmlFor="visibility">公开到市场</Label>
                  </div>
                </CardContent>
                <CardFooter className="justify-end gap-2">
                  <Button variant="ghost" onClick={() => router.back()}>
                    取消
                  </Button>
                  <Dialog open={openPublish} onOpenChange={setOpenPublish}>
                    <DialogTrigger asChild>
                      <Button onClick={() => setOpenPublish(true)}>创建 / 发布</Button>
                    </DialogTrigger>
                    <DialogContent aria-describedby="publish-desc">
                      <DialogHeader>
                        <DialogTitle>发布版本</DialogTitle>
                        <p className="text-sm text-muted-foreground" id="publish-desc">
                          确认将当前配置作为一个新版本发布到插件市场。
                        </p>
                      </DialogHeader>
                      <div className="space-y-3">
                        <Label>版本号</Label>
                        <Input
                          value={draft.version}
                          onChange={(e) => setDraft({ ...draft, version: e.target.value })}
                          placeholder="例如 1.0.1"
                        />
                        <p className="text-xs text-muted-foreground">发布后，其他用户可在插件市场看到。</p>
                      </div>
                      <DialogFooter>
                        <Button variant="ghost" onClick={() => setOpenPublish(false)}>
                          取消
                        </Button>
                        <Button onClick={save}>确认发布</Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardFooter>
              </Card>
            </TabsContent>

            <TabsContent value="prompt">
              <Card>
                <CardHeader>
                  <CardTitle>系统提示词</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Textarea
                    value={draft.systemPrompt || ""}
                    onChange={(e) => setDraft({ ...draft, systemPrompt: e.target.value })}
                    placeholder="为你的助理设置系统行为与语气…"
                    rows={10}
                  />
                  <div className="text-xs text-muted-foreground">
                    提示词用于引导模型的行为。不同类型助理可设置不同风格。
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tools" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>模型配置</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
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
                    <Label>温度 {draft.model?.temperature}</Label>
                    <Slider
                      value={[draft.model?.temperature || 0.6]}
                      min={0}
                      max={1}
                      step={0.05}
                      onValueChange={([v]) => setDraft({ ...draft, model: { ...draft.model!, temperature: v } })}
                    />
                  </div>
                  <div className="grid gap-1.5">
                    <Label>最大 Tokens</Label>
                    <Input
                      type="number"
                      value={draft.model?.maxTokens || 1024}
                      onChange={(e) =>
                        setDraft({ ...draft, model: { ...draft.model!, maxTokens: Number(e.target.value) } })
                      }
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>知识库 & 工具</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-3">
                    <div className="text-sm font-medium">已关联的知识条目</div>
                    <div className="grid gap-2">
                      {knowledge.slice(0, 6).map((k) => (
                        <div key={k.id} className="text-sm p-2 rounded border bg-muted/30">
                          <div className="font-medium truncate">{k.title}</div>
                          <div className="text-xs text-muted-foreground line-clamp-2">{k.content}</div>
                        </div>
                      ))}
                      {knowledge.length === 0 && (
                        <div className="text-sm text-muted-foreground">暂无知识条目，前往「知识库」添加。</div>
                      )}
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">Web 搜索</div>
                        <div className="text-xs text-muted-foreground">允许模型检索实时信息</div>
                      </div>
                      <Switch
                        checked={!!draft.tools?.webSearch}
                        onCheckedChange={(v) => setDraft({ ...draft, tools: { ...draft.tools, webSearch: v } })}
                        id="webSearch"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">计算器</div>
                        <div className="text-xs text-muted-foreground">执行数学表达式</div>
                      </div>
                      <Switch
                        checked={!!draft.tools?.calculator}
                        onCheckedChange={(v) => setDraft({ ...draft, tools: { ...draft.tools, calculator: v } })}
                        id="calculator"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium">HTTP GET</div>
                        <div className="text-xs text-muted-foreground">调用外部 API（GET）</div>
                      </div>
                      <Switch
                        checked={!!draft.tools?.http}
                        onCheckedChange={(v) => setDraft({ ...draft, tools: { ...draft.tools, http: v } })}
                        id="http"
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right: live preview */}
        <div className="hidden lg:block">
          <AgentPreview agent={draft} knowledgeCount={knowledge.length} toolCount={toolCount} />
        </div>
      </div>
    </div>
  )
}
