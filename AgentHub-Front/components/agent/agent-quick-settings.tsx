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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { Agent } from "@/lib/types"
import { useAgentCatalog } from "@/lib/stores"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  agent: Agent
}

// Token策略枚举
enum TokenOverflowStrategy {
  NONE = "NONE",
  SLIDING_WINDOW = "SLIDING_WINDOW", 
  SUMMARIZE = "SUMMARIZE"
}

export function AgentQuickSettings({ open, onOpenChange, agent }: Props) {
  const { upsertAgent } = useAgentCatalog()
  const { toast } = useToast()

  const [draft, setDraft] = useState<Agent>(agent)
  type ModelItem = { id: string; name: string; modelId: string; description?: string; official?: boolean; config?: { maxContextLength?: number } }
  type ProviderInfo = { id?: string; protocol: string; name?: string; description?: string; official?: boolean }
  type ProviderBlock = { provider: ProviderInfo; models: ModelItem[] }
  const [providerBlocks, setProviderBlocks] = useState<ProviderBlock[]>([])
  const [selectedProvider, setSelectedProvider] = useState<string>("")
  const [selectedModelId, setSelectedModelId] = useState<string>("")
  
  // 模型配置参数
  const [temperature, setTemperature] = useState<number>(0.7)
  const [topP, setTopP] = useState<number>(0.9)
  const [topK, setTopK] = useState<number>(40)
  
  // Token策略配置参数
  const [maxTokens, setMaxTokens] = useState<number>(4000)
  const [strategyType, setStrategyType] = useState<TokenOverflowStrategy>(TokenOverflowStrategy.NONE)
  const [reserveRatio, setReserveRatio] = useState<number>(0.1)
  const [summaryThreshold, setSummaryThreshold] = useState<number>(10)

  useEffect(() => {
    if (open) setDraft(agent)
  }, [open, agent])

  // 加载活跃模型列表（按服务商分组）和当前Agent配置
  useEffect(() => {
    if (!open) return
    let cancelled = false
    ;(async () => {
      try {
        // 并行请求模型列表和Agent配置
        const [modelsJson, configJson] = await Promise.all([
          api.getActiveModels(),
          api.getAgentConfig(agent.id)
        ])
        
        const list = Array.isArray(modelsJson) ? modelsJson : (modelsJson?.data ?? [])
        const currentConfig = configJson?.data || {}
        const currentModelId = currentConfig.modelId || ""
        
        if (cancelled) return
        setProviderBlocks(list)
        
        // 设置当前配置参数
        if (currentConfig.temperature !== undefined) setTemperature(currentConfig.temperature)
        else setTemperature(0.7)
        if (currentConfig.topP !== undefined) setTopP(currentConfig.topP)
        else setTopP(0.9)
        if (currentConfig.topK !== undefined) setTopK(currentConfig.topK)
        else setTopK(40)
        if (currentConfig.maxTokens !== undefined) setMaxTokens(currentConfig.maxTokens)
        else setMaxTokens(4000)
        if (currentConfig.strategyType !== undefined) setStrategyType(currentConfig.strategyType as TokenOverflowStrategy)
        else setStrategyType(TokenOverflowStrategy.NONE)
        if (currentConfig.reserveRatio !== undefined) setReserveRatio(currentConfig.reserveRatio)
        else setReserveRatio(0.1)
        if (currentConfig.summaryThreshold !== undefined) setSummaryThreshold(currentConfig.summaryThreshold)
        else setSummaryThreshold(10)
        
        // 去重 Provider（按 protocol）
        const seen: Record<string, { official: boolean; label: string }> = {}
        for (const it of list as ProviderBlock[]) {
          const proto = it?.provider?.protocol || it?.provider?.name || ""
          if (!proto) continue
          const off = !!it?.provider?.official
          if (!seen[proto]) seen[proto] = { official: off, label: it?.provider?.name || it?.provider?.protocol || proto }
          else seen[proto].official = seen[proto].official || off
        }

        // 如果有当前modelId，找到对应的provider和model
        if (currentModelId) {
          let foundProvider = ""
          let foundModel: ModelItem | undefined
          
          for (const block of list as ProviderBlock[]) {
            const model = block.models?.find(m => m.id === currentModelId)
            if (model) {
              foundProvider = block.provider.id || block.provider.name || block.provider.protocol || ""
              foundModel = model
              break
            }
          }
          
          if (foundProvider && foundModel) {
            setSelectedProvider(foundProvider)
            setSelectedModelId(currentModelId)
            return
          }
        }
        
        // 如果没有找到当前模型或currentModelId为空，使用默认的第一个
        const uniq = Object.keys(seen)
        const firstProvider = uniq[0] || ""
        setSelectedProvider(firstProvider)
        const firstBlock = (list as ProviderBlock[]).find(b => (b.provider.id || b.provider.name || b.provider.protocol) === firstProvider)
        const models = (firstBlock?.models as ModelItem[] | undefined) || []
        const firstModelId = models[0]?.id || ""
        setSelectedModelId(firstModelId)
      } catch (error) {
      }
    })()
    return () => { cancelled = true }
  }, [open, agent.id])

  // 当选择的 Provider 变化时，自动选中其第一个模型
  useEffect(() => {
    if (!selectedProvider || providerBlocks.length === 0) return
    const block = providerBlocks.find(pb => (pb.provider.id || pb.provider.name || pb.provider.protocol) === selectedProvider)
    if (!block) return
    const models = block.models || []
    const firstModelId = models[0]?.id || ""
    if (!selectedModelId || !models.find(m => m.id === selectedModelId)) {
      setSelectedModelId(firstModelId)
      setDraft({ ...draft, model: { ...draft.model!, provider: selectedProvider, model: models[0]?.name || "" } })
    }
  }, [selectedProvider, providerBlocks])

  async function save() {
    try {
      // 获取选中的模型信息
      const selectedModel = providerBlocks
        .find(pb => (pb.provider.id || pb.provider.name || pb.provider.protocol) === selectedProvider)
        ?.models?.find(m => m.id === selectedModelId)

      if (!selectedModel) {
        return
      }

      // 调用后端接口更新模型配置
      const modelConfigResult = await api.updateAgentModelConfig(agent.id, {
        modelId: selectedModelId,
        temperature: temperature,
        topP: topP,
        topK: topK,
        maxTokens: maxTokens,
        strategyType: strategyType,
        reserveRatio: reserveRatio,
        summaryThreshold: summaryThreshold,
      })

      // 检查响应状态
      if (modelConfigResult.code !== 200) {
        toast({
          title: "保存失败",
          description: modelConfigResult.message || "无法保存模型配置，请稍后重试",
          variant: "destructive",
        })
        return
      }

      // 保存工具配置（如果需要的话）
      const currentTools = agent.tools || {}
      const newTools = draft.tools || {}
      const toolsChanged = 
        currentTools.webSearch !== newTools.webSearch ||
        currentTools.calculator !== newTools.calculator ||
        currentTools.http !== newTools.http

      if (toolsChanged) {
        const toolsResponse = await fetch(`/api/agent/${agent.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            tools: draft.tools,
          }),
        })

        if (!toolsResponse.ok) {
          toast({
            title: "部分保存失败",
            description: "模型配置已保存，但工具配置保存失败",
            variant: "destructive",
          })
          return
        }

        // 检查工具配置响应状态
        const toolsResult = await toolsResponse.json()
        if (toolsResult.code !== 200 && toolsResult.code !== undefined) {
          toast({
            title: "部分保存失败",
            description: toolsResult.message || "模型配置已保存，但工具配置保存失败",
            variant: "destructive",
          })
          return
        }
      }

      // 更新本地状态
      upsertAgent({ 
        ...agent, 
        model: {
          ...draft.model!,
          provider: selectedProvider,
          model: selectedModel.name,
        },
        tools: draft.tools
      })
      
      // 显示成功提示
      toast({
        title: "保存成功",
        description: "Agent 设置已更新",
      })
      
      onOpenChange(false)
    } catch (error) {
      
      // 显示网络错误提示
      toast({
        title: "保存失败",
        description: "网络错误，请检查连接后重试",
        variant: "destructive",
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto" aria-describedby="qs-desc">
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
              disabled
              className="bg-gray-50 text-gray-500"
              placeholder="给你的 Agent 起个名字"
            />
            <p className="text-xs text-gray-500">名称不允许修改</p>
          </div>
          <div className="grid gap-1.5">
            <Label>描述</Label>
            <Textarea
              rows={3}
              value={draft.description || ""}
              disabled
              className="bg-gray-50 text-gray-500"
              placeholder="一句话描述能力与使用场景…"
            />
            <p className="text-xs text-gray-500">描述不允许修改</p>
          </div>

          <div className="grid gap-1.5">
            <Label>Provider</Label>
            <div className="space-y-4">
              {/* 调试信息 */}
              {providerBlocks.length === 0 && (
                <div className="text-sm text-muted-foreground p-2 bg-muted/20 rounded">
                  正在加载 Provider 列表...
                </div>
              )}
              
              {/* Provider 选择器 */}
              {providerBlocks.length > 0 && (
                <div className="flex flex-wrap gap-2 p-2 bg-muted/30 rounded-xl border">
                  {providerBlocks.map((pb, index) => {
                    const v = pb.provider.id || pb.provider.name || pb.provider.protocol || ""
                    const label = pb.provider.name || pb.provider.protocol || v
                    const isSelected = selectedProvider === v
                    const isOfficial = pb.provider.official
                    // 使用 index 确保 key 的唯一性
                    const uniqueKey = `${v}-${index}`
                    
                    return (
                      <button
                        key={uniqueKey}
                        onClick={() => {
                          setSelectedProvider(v)
                          setDraft({ ...draft, model: { ...draft.model!, provider: v } })
                          // 使用当前 Provider 的模型列表
                          const models = pb.models || []
                          const nextModelId = models[0]?.id || ""
                          setSelectedModelId(nextModelId)
                        }}
                        className={`px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer flex items-center gap-2 ${
                          isSelected
                            ? isOfficial
                              ? 'bg-emerald-500 text-white shadow-md'
                              : 'bg-blue-500 text-white shadow-md'
                            : 'bg-background hover:bg-muted/50 text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{label}</span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          isOfficial
                            ? isSelected
                              ? 'bg-emerald-400/20 text-emerald-100'
                              : 'bg-emerald-100 text-emerald-700'
                            : isSelected
                              ? 'bg-blue-400/20 text-blue-100'
                              : 'bg-blue-100 text-blue-700'
                        }`}>
                          {isOfficial ? '官方' : '自定义'}
                        </span>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="grid gap-1.5">
            <Label>Model</Label>
            <div className="space-y-4">
              {(() => {
                // 找到当前选中的 Provider 对应的模型列表
                const selectedProviderBlock = providerBlocks.find(pb => 
                  (pb.provider.id || pb.provider.name || pb.provider.protocol) === selectedProvider
                )
                const models = selectedProviderBlock?.models || []
                
                if (models.length === 0) {
                  return (
                    <div className="text-sm text-muted-foreground p-2 bg-muted/20 rounded">
                      该 Provider 下暂无可用模型
                    </div>
                  )
                }
                
                return (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {models.map((m) => {
                      const isSelected = selectedModelId === m.id
                      const isOfficial = m.official
                      
                      return (
                        <Card
                          key={m.id}
                          className={`p-4 cursor-pointer transition-all duration-200 ${
                            isSelected 
                              ? 'ring-2 ring-primary bg-primary/5 border-primary shadow-md' 
                              : 'hover:bg-muted/50 hover:border-muted-foreground/20'
                          }`}
                          onClick={() => {
                            setSelectedModelId(m.id)
                            setDraft({ ...draft, model: { ...draft.model!, model: m.name || "" } })
                          }}
                        >
                          <div className="flex items-center justify-between">
                            <div className={`font-medium truncate ${isSelected ? 'text-primary' : ''}`}>
                              {m.name}
                              {isSelected && <span className="ml-2 text-xs bg-primary text-primary-foreground px-1.5 py-0.5 rounded">当前使用</span>}
                            </div>
                            <Badge className={isOfficial ? "bg-emerald-600 hover:bg-emerald-600" : "bg-blue-600 hover:bg-blue-600"}>
                              {isOfficial ? '官方' : '自定义'}
                            </Badge>
                          </div>
                          {m.description && (
                            <div className="mt-1 text-xs text-muted-foreground line-clamp-2">{m.description}</div>
                          )}
                        </Card>
                      )
                    })}
                  </div>
                )
              })()}
            </div>
          </div>

          <Tabs defaultValue="model" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="model">模型配置</TabsTrigger>
              <TabsTrigger value="token">Token策略</TabsTrigger>
              <TabsTrigger value="tools">工具配置</TabsTrigger>
              <TabsTrigger value="knowledge">知识库</TabsTrigger>
            </TabsList>
            
            <TabsContent value="model" className="space-y-4">
              <div className="grid gap-1.5">
                <Label>Temperature: {temperature}</Label>
                <Slider
                  value={[temperature]}
                  min={0}
                  max={2}
                  step={0.1}
                  onValueChange={([v]) => setTemperature(v)}
                />
                <p className="text-xs text-muted-foreground">控制输出的随机性，值越高越有创意</p>
              </div>
              
              <div className="grid gap-1.5">
                <Label>Top P: {topP}</Label>
                <Slider
                  value={[topP]}
                  min={0}
                  max={1}
                  step={0.05}
                  onValueChange={([v]) => setTopP(v)}
                />
                <p className="text-xs text-muted-foreground">控制词汇选择的多样性</p>
              </div>
              
              <div className="grid gap-1.5">
                <Label>Top K: {topK}</Label>
                <Slider
                  value={[topK]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={([v]) => setTopK(v)}
                />
                <p className="text-xs text-muted-foreground">限制每次选择时考虑的词汇数量</p>
              </div>
            </TabsContent>
            
            <TabsContent value="token" className="space-y-4">
              <div className="grid gap-1.5">
                <Label>最大Token数: {maxTokens}</Label>
                <Slider
                  value={[maxTokens]}
                  min={1000}
                  max={32000}
                  step={1000}
                  onValueChange={([v]) => setMaxTokens(v)}
                />
                <p className="text-xs text-muted-foreground">单次对话的最大Token数量</p>
              </div>
              
              <div className="grid gap-1.5">
                <Label>Token溢出策略</Label>
                <Select value={strategyType} onValueChange={(v) => setStrategyType(v as TokenOverflowStrategy)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={TokenOverflowStrategy.NONE}>无策略</SelectItem>
                    <SelectItem value={TokenOverflowStrategy.SLIDING_WINDOW}>滑动窗口</SelectItem>
                    <SelectItem value={TokenOverflowStrategy.SUMMARIZE}>摘要策略</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              {strategyType === TokenOverflowStrategy.SLIDING_WINDOW && (
                <div className="grid gap-1.5">
                  <Label>预留缓冲比例: {reserveRatio}</Label>
                  <Slider
                    value={[reserveRatio]}
                    min={0}
                    max={0.5}
                    step={0.05}
                    onValueChange={([v]) => setReserveRatio(v)}
                  />
                  <p className="text-xs text-muted-foreground">为滑动窗口预留的空间比例</p>
                </div>
              )}
              
              {strategyType === TokenOverflowStrategy.SUMMARIZE && (
                <div className="grid gap-1.5">
                  <Label>摘要触发阈值: {summaryThreshold} 条消息</Label>
                  <Slider
                    value={[summaryThreshold]}
                    min={5}
                    max={50}
                    step={1}
                    onValueChange={([v]) => setSummaryThreshold(v)}
                  />
                  <p className="text-xs text-muted-foreground">达到此消息数量时触发摘要</p>
                </div>
              )}
            </TabsContent>
            
            <TabsContent value="tools" className="space-y-4">
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
            </TabsContent>
            
            <TabsContent value="knowledge" className="space-y-4">
              <div className="text-center py-8 text-muted-foreground">
                <p>知识库配置功能开发中...</p>
              </div>
            </TabsContent>
          </Tabs>
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

