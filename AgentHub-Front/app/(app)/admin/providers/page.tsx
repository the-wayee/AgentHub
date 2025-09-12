"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { AdminProvidersSkeleton } from "@/components/ui/page-skeleton"
import { Server, Eye, EyeOff, Plus, Edit, Trash2, Search, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

interface ProviderConfig {
  apiKey?: string
  baseUrl?: string
}

interface Provider {
  id: string
  userId: string
  protocol: string // ProviderProtocol enum as string
  name: string
  description?: string
  config?: ProviderConfig
  official: boolean
  status: boolean
  createdAt: string
  updatedAt: string
}

interface LLMModelConfig {
  maxContextLength?: number
  temperature?: number
  [key: string]: any
}

interface Model {
  id: string
  userId: string
  providerId: string
  providerName: string // 额外添加，便于前端显示
  modelId: string
  name: string
  description?: string
  type: string // ModelType enum as string
  config?: LLMModelConfig
  official: boolean
  status: boolean
  createdAt: string
  updatedAt: string
}

interface ProviderAggregate {
  provider: Provider
  models: Model[]
}

export default function AdminProvidersPage() {
  const [providerAggregates, setProviderAggregates] = useState<ProviderAggregate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [protocols, setProtocols] = useState<string[]>([])
  const [createForm, setCreateForm] = useState({
    protocol: "",
    name: "",
    description: "",
    apiKey: "",
    baseUrl: ""
  })
  const [editForm, setEditForm] = useState({
    id: "",
    protocol: "",
    name: "",
    description: "",
    status: true
  })

  const { toast } = useToast()

  // 获取协议显示名称
  function getProtocolDisplayName(protocol: string) {
    const protocolMap: Record<string, string> = {
      'OPENAI': 'OpenAI',
      'DASHSCOPE': 'DashScope (阿里云)',
      'ZHIPU': 'ChatGLM (智谱)',
      'ANTHROPIC': 'Anthropic',
      'GROQ': 'Groq',
      'XAI': 'xAI'
    }
    return protocolMap[protocol] || protocol
  }

  // 加载服务商列表
  async function loadProviders() {
    setLoading(true)
    try {
      const result = await api.getAdminProviders()
      
      // 处理后端响应格式：支持 {success, data} 和 {code, data} 两种格式
      const data = result.data || result
      if (((result.success || result.code === 200) || result.code === 200) && Array.isArray(data)) {
        setProviderAggregates(data)
      } else {
        throw new Error(result.message || "API返回错误")
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载服务商列表，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadProviders()
    loadProtocols()
  }, [])

  // 加载协议类型列表
  async function loadProtocols() {
    try {
      const result = await api.getProviderProtocols()
      
      if ((result.success || result.code === 200) && Array.isArray(result.data)) {
        setProtocols(result.data)
      } else {
        // 使用默认协议列表作为后备
        setProtocols(["OPENAI", "DASHSCOPE", "ZHIPU"])
      }
    } catch (error) {
      // 使用默认协议列表作为后备
      setProtocols(["OPENAI", "DASHSCOPE", "ZHIPU"])
    }
  }

  // 创建服务商
  async function createProvider() {
    try {
      const payload = {
        protocol: createForm.protocol,
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        config: {
          apiKey: createForm.apiKey.trim(),
          baseUrl: createForm.baseUrl.trim()
        }
      }

      const result = await api.createAdminProvider(payload)

      if (result.success || result.code === 200) {
        toast({
          title: "创建成功",
          description: "服务商已成功创建"
        })
        setShowCreateDialog(false)
        setCreateForm({
          protocol: "",
          name: "",
          description: "",
          apiKey: "",
          baseUrl: ""
        })
        loadProviders()
      } else {
        const errorMsg = result.message || '创建失败'
        toast({
          title: "创建失败",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "创建失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 更新服务商
  async function updateProvider() {
    if (!editingProvider) return
    
    try {
      const payload = {
        id: editForm.id,
        protocol: editForm.protocol,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        status: editForm.status
      }

      const result = await api.updateAdminProvider(editingProvider.id, payload)

      if (result.success || result.code === 200) {
        toast({
          title: "更新成功",
          description: "服务商信息已更新"
        })
        setEditingProvider(null)
        loadProviders()
      } else {
        const errorMsg = result.message || '更新失败'
        toast({
          title: "更新失败",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "更新失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 删除服务商
  async function deleteProvider(provider: Provider) {
    try {
      const result = await api.deleteAdminProvider(provider.id)

      if (result.success || result.code === 200) {
        setProviderAggregates(prev => prev.filter(agg => agg.provider.id !== provider.id))
        toast({
          title: "删除成功",
          description: `服务商 "${provider.name}" 已删除`
        })
      } else {
        const errorMsg = result.message || '删除失败'
        toast({
          title: "删除失败",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 切换服务商状态
  async function toggleProviderStatus(providerId: string, status: boolean) {
    try {
      const result = await api.toggleProviderStatus(providerId)

      if (result.success || result.code === 200) {
        setProviderAggregates(prev => prev.map(agg => 
          agg.provider.id === providerId 
            ? { ...agg, provider: { ...agg.provider, status } }
            : agg
        ))
        toast({
          title: "状态更新成功",
          description: `服务商已${status ? '启用' : '禁用'}`
        })
      } else {
        const errorMsg = result.message || '状态更新失败'
        toast({
          title: "状态更新失败",
          description: errorMsg,
          variant: "destructive"
        })
        // 恢复原状态
        setProviderAggregates(prev => prev.map(agg => 
          agg.provider.id === providerId 
            ? { ...agg, provider: { ...agg.provider, status: !status } }
            : agg
        ))
      }
    } catch (error) {
      toast({
        title: "状态更新失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
      // 恢复原状态
      setProviderAggregates(prev => prev.map(agg => 
        agg.provider.id === providerId 
          ? { ...agg, provider: { ...agg.provider, status: !status } }
          : agg
      ))
    }
  }

  // 打开编辑对话框
  function openEditDialog(provider: Provider) {
    setEditingProvider(provider)
    setEditForm({
      id: provider.id,
      protocol: provider.protocol,
      name: provider.name,
      description: provider.description || "",
      status: provider.status
    })
  }

  const filteredAggregates = providerAggregates.filter(aggregate => {
    const provider = aggregate.provider
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (provider.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return <AdminProvidersSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">服务商管理</h1>
          <p className="text-sm text-muted-foreground">管理官方 AI 模型服务商和模型</p>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加服务商
        </Button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{providerAggregates.length}</div>
            <div className="text-sm text-muted-foreground">总服务商</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {providerAggregates.filter(agg => agg.provider.status).length}
            </div>
            <div className="text-sm text-muted-foreground">已启用</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {providerAggregates.reduce((sum, agg) => sum + (agg.models?.length || 0), 0)}
            </div>
            <div className="text-sm text-muted-foreground">总模型数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {providerAggregates.reduce((sum, agg) => sum + ((agg.models || []).filter(m => m.status).length), 0)}
            </div>
            <div className="text-sm text-muted-foreground">激活模型</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索服务商..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="secondary" onClick={loadProviders}>
          刷新
        </Button>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6">
        {filteredAggregates.map((aggregate) => {
          const provider = aggregate.provider
          const models = aggregate.models || []
          return (
            <Card 
              key={provider.id} 
              className={`relative ${provider.status ? 'bg-green-50 border-green-200' : ''}`}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Server className="w-5 h-5" />
                    <span>{provider.name}</span>
                    {provider.official && (
                      <Badge className="bg-red-100 text-red-700 border-red-200">官方</Badge>
                    )}
                    <Badge variant="outline">{provider.protocol}</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {provider.status ? "已启用" : "已禁用"}
                    </span>
                    <Switch
                      checked={provider.status}
                      onCheckedChange={(checked) => toggleProviderStatus(provider.id, checked)}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {provider.description && (
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                )}
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">模型数量</span>
                  <span>{models.length} 个模型</span>
                </div>

                {/* Model Preview */}
                {models.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium mb-2">模型预览</h4>
                    <div className="flex flex-wrap gap-2">
                      {models.slice(0, 4).map((model) => (
                        <Badge
                          key={model.id}
                          variant="outline"
                          className={`text-xs ${
                            model.status
                              ? 'bg-green-50 border-green-200 text-green-700'
                              : 'bg-gray-50 border-gray-200 text-gray-500'
                          }`}
                        >
                          {model.name}
                        </Badge>
                      ))}
                      {models.length > 4 && (
                        <Badge variant="outline" className="text-xs bg-gray-50 border-gray-200 text-gray-500">
                          +{models.length - 4} 更多
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button variant="outline" size="sm" onClick={() => openEditDialog(provider)}>
                    <Edit className="w-4 h-4 mr-1" />
                    编辑
                  </Button>
                  <Button variant="outline" size="sm" asChild>
                    <a href={`/admin/providers/${provider.id}/models`}>
                      <Settings className="w-4 h-4 mr-1" />
                      管理模型
                    </a>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>确认删除</AlertDialogTitle>
                        <AlertDialogDescription>
                          确定要删除服务商 "{provider.name}" 吗？此操作将同时删除其所有 {models.length} 个模型，且无法撤销。
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>取消</AlertDialogCancel>
                        <AlertDialogAction 
                          onClick={() => deleteProvider(provider)} 
                          className="bg-red-600 hover:bg-red-700"
                        >
                          删除
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredAggregates.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery 
              ? "没有找到匹配的服务商" 
              : "暂无服务商，点击右上角添加"}
          </div>
        </div>
      )}

      {/* Create Provider Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加服务商</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>协议类型</Label>
              <Select value={createForm.protocol} onValueChange={(value) => setCreateForm(prev => ({ ...prev, protocol: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="选择协议类型" />
                </SelectTrigger>
                <SelectContent>
                  {protocols.map((protocol) => (
                    <SelectItem key={protocol} value={protocol}>
                      {getProtocolDisplayName(protocol)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>显示名称</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入显示名称"
              />
            </div>

            <div className="space-y-2">
              <Label>描述</Label>
              <Textarea
                value={createForm.description}
                onChange={(e) => setCreateForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="请输入描述信息"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label>API Key</Label>
              <Input
                type="password"
                value={createForm.apiKey}
                onChange={(e) => setCreateForm(prev => ({ ...prev, apiKey: e.target.value }))}
                placeholder="请输入 API Key"
              />
            </div>

            <div className="space-y-2">
              <Label>Base URL</Label>
              <Input
                value={createForm.baseUrl}
                onChange={(e) => setCreateForm(prev => ({ ...prev, baseUrl: e.target.value }))}
                placeholder="请输入 Base URL（可选）"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={createProvider}
              disabled={!createForm.protocol || !createForm.name.trim()}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Provider Dialog */}
      <Dialog open={!!editingProvider} onOpenChange={(open) => !open && setEditingProvider(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑服务商</DialogTitle>
          </DialogHeader>
          {editingProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>协议类型</Label>
                <Input
                  value={editForm.protocol}
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500">协议类型不允许修改</p>
              </div>

              <div className="space-y-2">
                <Label>显示名称</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入显示名称"
                />
              </div>

              <div className="space-y-2">
                <Label>描述</Label>
                <Textarea
                  value={editForm.description}
                  onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="请输入描述信息"
                  rows={3}
                />
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={editForm.status}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, status: checked }))}
                />
                <span className="text-sm text-muted-foreground">
                  {editForm.status ? "启用服务商" : "禁用服务商"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditingProvider(null)}>
              取消
            </Button>
            <Button 
              onClick={updateProvider}
              disabled={!editForm.name.trim()}
            >
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
