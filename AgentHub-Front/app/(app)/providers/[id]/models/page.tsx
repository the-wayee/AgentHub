"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, ExternalLink, Trash2, Plus } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"

type Model = {
  id: string
  userId: string | null
  providerId: string
  providerName: string | null
  modelId: string
  name: string
  description?: string
  type: string
  config?: {
    maxContextLength?: number
  } | null
  official: boolean
  status: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

type Provider = {
  id: string
  name: string
  protocol: string
  description?: string
  status: boolean
}

export default function ProviderModelsPage() {
  const params = useParams()
  const providerId = params.id as string
  const [provider, setProvider] = useState<Provider | null>(null)
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [modelTypes, setModelTypes] = useState<string[]>(["NORMAL"]) // 默认值，避免空白
  const [modelTypesLoading, setModelTypesLoading] = useState(false)
  const [addForm, setAddForm] = useState({
    modelId: "",
    name: "",
    description: "",
    modelType: "NORMAL",
    maxContextLength: 20000,
    temperature: 0.7,
    enable_search: false
  })
  const { toast } = useToast()

  async function loadProviderAndModels() {
    setLoading(true)
    try {
      // 通过Next.js API代理获取服务商信息
      const result = await api.getProviders()
      
      if (result.success && Array.isArray(result.data)) {
        const currentProvider = result.data.find((p: any) => p.id === providerId)
        
        if (currentProvider) {
          setProvider({
            id: currentProvider.id,
            name: currentProvider.name,
            protocol: currentProvider.protocol,
            description: currentProvider.description,
            status: currentProvider.status,
          })
          
          // 使用专门的模型接口获取最新模型数据
          await loadModels()
        } else {
          throw new Error("未找到对应的服务商")
        }
      } else {
        throw new Error(result.message || "API返回错误")
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载服务商和模型信息",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 专门获取模型列表的函数
  async function loadModels() {
    try {
      const result = await api.getModelsByProvider(providerId)

      if (result.success && Array.isArray(result.data)) {
        setModels(result.data)
      } else {
        throw new Error(result.message || "获取模型列表失败")
      }
    } catch (error) {
      toast({
        title: "加载模型列表失败",
        description: "无法获取最新的模型列表",
        variant: "destructive"
      })
    }
  }

  async function loadModelTypes() {
    setModelTypesLoading(true)
    try {
      const result = await api.getModelTypes()

      if (result.success && Array.isArray(result.data)) {
        setModelTypes(result.data)
        return result.data // 返回加载的类型数据
      } else {
        return ["NORMAL"] // 返回默认值
      }
    } catch (error) {
      return ["NORMAL"] // 返回默认值，不显示错误提示，避免影响用户体验
    } finally {
      setModelTypesLoading(false)
    }
  }

  async function addModel() {
    if (!addForm.modelId.trim() || !addForm.name.trim()) {
      toast({
        title: "验证失败",
        description: "请填写模型ID和名称",
        variant: "destructive"
      })
      return
    }

    try {
      const result = await api.createModel({
        providerId: providerId,
        modelId: addForm.modelId,
        name: addForm.name,
        description: addForm.description,
        type: addForm.modelType,
        config: {
          maxContextLength: addForm.maxContextLength,
          temperature: addForm.temperature,
          enable_search: addForm.enable_search
        }
      })

      if (result.success) {
        toast({
          title: "添加成功",
          description: `模型 "${addForm.name}" 已添加`
        })
        setShowAddDialog(false)
        resetAddForm()
        // 重新加载模型列表
        loadModels()
      } else {
        const errorMsg = result?.message || '添加失败'
        toast({
          title: "添加失败",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "添加失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  function resetAddForm() {
    setAddForm({
      modelId: "",
      name: "",
      description: "",
      modelType: "NORMAL", // 默认值
      maxContextLength: 20000,
      temperature: 0.7,
      enable_search: false
    })
  }

  async function openAddDialog() {
    setShowAddDialog(true)
    // 先重置表单为默认值
    resetAddForm()
    
    // 异步加载模型类型，不阻塞弹窗显示
    const loadedTypes = await loadModelTypes()
    
    // 类型加载完成后，重新设置默认类型
    setAddForm(prev => ({
      ...prev,
      modelType: loadedTypes.length > 0 ? loadedTypes[0] : "NORMAL"
    }))
  }

  useEffect(() => {
    loadProviderAndModels()
  }, [providerId])

  async function toggleModel(modelId: string, currentStatus: boolean) {
    try {
      const result = await api.toggleModelStatus(modelId)

      if (result?.success) {
        // 更新本地状态
        setModels(prev => prev.map(model =>
          model.id === modelId ? { ...model, status: !currentStatus } : model
        ))
        toast({
          title: currentStatus ? "已禁用模型" : "已启用模型",
          description: `模型状态已${currentStatus ? '禁用' : '启用'}`
        })
      } else {
        const errorMsg = result?.message || '切换状态失败'
        toast({
          title: "操作失败",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "操作失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="space-y-4">
          <div className="h-8 bg-muted rounded animate-pulse" />
          <div className="grid gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="text-center py-12">
          <div className="text-muted-foreground">服务商不存在</div>
          <Button className="mt-4" onClick={() => window.history.back()}>
            返回
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => window.history.back()}
          className="cursor-pointer hover:bg-gray-100 transition-colors"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          返回
        </Button>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold">{provider.name}</h1>
            {provider && (
              <Badge 
                variant="outline" 
                className="text-xs px-3 py-1 rounded-full font-medium bg-red-100 border-red-300 text-red-800 shadow-sm"
              >
                ✓ 官方
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground">
            {provider.description || `${provider.protocol} 协议服务商`}
          </p>
        </div>
        <Button
          variant="outline"
          className="cursor-pointer"
          onClick={() => {
            const urls: Record<string, string> = {
              openai: "https://platform.openai.com",
              xai: "https://console.x.ai", 
              groq: "https://console.groq.com",
              dashscope: "https://dashscope.aliyun.com",
            }
            const url = urls[provider.protocol.toLowerCase()]
            if (url) {
              window.open(url, '_blank')
            } else {
            }
          }}
        >
          <ExternalLink className="w-4 h-4 mr-2" />
          官网
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold">{models.length}</div>
            <div className="text-sm text-muted-foreground">模型列表</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {models.filter(m => m.status).length}
            </div>
            <div className="text-sm text-muted-foreground">激活</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {models.filter(m => !m.status).length}
            </div>
            <div className="text-sm text-muted-foreground">禁用</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {models.filter(m => m.official).length}
            </div>
            <div className="text-sm text-muted-foreground">官方模型</div>
          </CardContent>
        </Card>
      </div>

      {/* Models List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-medium text-gray-900">模型列表</h2>
            <Badge variant="outline" className="text-xs px-2 py-1 bg-blue-50 border-blue-200 text-blue-700">
              {models.filter(m => m.status).length}/{models.length} 激活
            </Badge>
          </div>
          <Button 
            className="bg-black text-white hover:bg-gray-800 cursor-pointer"
            onClick={openAddDialog}
          >
            <Plus className="w-4 h-4 mr-2" />
            添加模型
          </Button>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {models.map((model) => (
            <Card 
              key={model.id} 
              className={`border rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${
                model.status 
                  ? 'bg-green-50 border-green-200' 
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    {/* Model Header */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{model.name}</h3>
                      {model.official && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            model.status 
                              ? 'bg-red-100 border-red-300 text-red-800 shadow-sm'
                              : 'bg-red-50 border-red-200 text-red-700'
                          }`}
                        >
                          ✓ 官方
                        </Badge>
                      )}
                      <Switch
                        checked={model.status}
                        onCheckedChange={() => toggleModel(model.id, model.status)}
                        className="cursor-pointer data-[state=checked]:bg-green-500 ml-auto"
                      />
                    </div>
                    
                    {/* Description */}
                    <p className="text-sm text-gray-600 mb-4">
                      {model.description || "暂无描述"}
                    </p>
                    
                    {/* Model Info */}
                    <div className="flex items-center gap-3 mb-6">
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 ${
                          model.status 
                            ? 'bg-green-50 border-green-200 text-green-700' 
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        {model.modelId}
                      </Badge>
                      {model.config?.maxContextLength && (
                        <Badge 
                          variant="outline" 
                          className={`text-xs px-2 py-1 ${
                            model.status 
                              ? 'bg-blue-50 border-blue-200 text-blue-700' 
                              : 'bg-gray-50 border-gray-200 text-gray-700'
                          }`}
                        >
                          {model.config.maxContextLength.toLocaleString()} tokens
                        </Badge>
                      )}
                      <Badge 
                        variant="outline" 
                        className={`text-xs px-2 py-1 ${
                          model.status 
                            ? 'bg-purple-50 border-purple-200 text-purple-700' 
                            : 'bg-gray-50 border-gray-200 text-gray-700'
                        }`}
                      >
                        {model.type}
                      </Badge>
                    </div>

                    {/* Pricing/Stats Section */}
                    <div className="space-y-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-900 font-medium mb-1">$ 输入: $0.005/1K tokens</div>
                        <div className="text-sm text-gray-900 font-medium">$ 输出: $0.015/1K tokens</div>
                      </div>
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-1 ${
                              model.status 
                                ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            text
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-1 ${
                              model.status 
                                ? 'bg-purple-100 text-purple-800 border border-purple-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            vision
                          </Badge>
                          <Badge 
                            variant="secondary" 
                            className={`text-xs px-2 py-1 ${
                              model.status 
                                ? 'bg-orange-100 text-orange-800 border border-orange-200' 
                                : 'bg-gray-100 text-gray-600 border border-gray-200'
                            }`}
                          >
                            function-calling
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Delete Button */}
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-500 hover:text-red-600 hover:bg-red-50 cursor-pointer transition-all duration-200 opacity-70 hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {models.length === 0 && (
          <div className="text-center py-12">
            <div className="text-muted-foreground">该服务商暂无可用模型</div>
          </div>
        )}
      </div>
      
      {/* Add Model Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="modelId">模型ID *</Label>
              <Input
                id="modelId"
                placeholder="例如: gpt-4, claude-3, 等"
                value={addForm.modelId}
                onChange={(e) => setAddForm({...addForm, modelId: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name">模型名称 *</Label>
              <Input
                id="name"
                placeholder="例如: GPT-4, Claude 3, 等"
                value={addForm.name}
                onChange={(e) => setAddForm({...addForm, name: e.target.value})}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">描述</Label>
              <Textarea
                id="description"
                placeholder="简单描述这个模型的特点..."
                value={addForm.description}
                onChange={(e) => setAddForm({...addForm, description: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="modelType">模型类型</Label>
              <Select value={addForm.modelType} onValueChange={(value) => setAddForm({...addForm, modelType: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {modelTypesLoading ? (
                    <SelectItem value="LOADING" disabled>加载中...</SelectItem>
                  ) : (
                    modelTypes.map((type) => {
                      const typeLabels: Record<string, string> = {
                        "NORMAL": "普通模型",
                        "VISION": "视觉模型", 
                        "FUNCTION": "工具调用",
                        "EMBEDDING": "嵌入模型"
                      }
                      return (
                        <SelectItem key={type} value={type}>
                          {typeLabels[type] || type}
                        </SelectItem>
                      )
                    })
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxContextLength">最大上下文长度</Label>
                <Input
                  id="maxContextLength"
                  type="number"
                  value={addForm.maxContextLength}
                  onChange={(e) => setAddForm({...addForm, maxContextLength: parseInt(e.target.value) || 20000})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temperature">温度</Label>
                <Input
                  id="temperature"
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={addForm.temperature}
                  onChange={(e) => setAddForm({...addForm, temperature: parseFloat(e.target.value) || 0.7})}
                />
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="enable_search"
                checked={addForm.enable_search}
                onChange={(e) => setAddForm({...addForm, enable_search: e.target.checked})}
                className="rounded border-gray-300"
              />
              <Label htmlFor="enable_search" className="text-sm">启用搜索功能</Label>
            </div>
            
            <div className="flex justify-end gap-2 pt-4">
              <Button 
                variant="outline" 
                onClick={() => setShowAddDialog(false)}
              >
                取消
              </Button>
              <Button 
                onClick={addModel}
              >
                添加模型
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

