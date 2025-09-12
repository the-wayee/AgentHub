"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { api } from "@/lib/api"
import { Server, Settings, Plus, Search, Edit, Trash2, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import { ProvidersPageSkeleton } from "@/components/ui/page-skeleton"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { ProviderSettings } from "@/components/user/provider-settings"

type Model = {
  id: string
  userId: string
  providerId: string
  modelId: string
  name: string
  description?: string
  official: boolean
  type: string
  config?: {
    maxContextLength?: number
  }
  status: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string | null
}

type Provider = {
  provider: {
    id: string
    userId: string
    protocol: string
    name: string
    description?: string
    config?: {
      apiKey?: string
      baseUrl?: string
    }
    official: boolean
    status: boolean
    createdAt: string
    updatedAt: string
    deletedAt?: string | null
  }
  models: Model[]
  // 展平的字段
  id: string
  name: string
  protocol: string
  description?: string
  status: boolean
  official: boolean
}

export default function ProvidersPage() {
  const [providers, setProviders] = useState<Provider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("ALL")
  const [filterTypes, setFilterTypes] = useState<string[]>([])
  const [editingProvider, setEditingProvider] = useState<Provider | null>(null)
  const [editForm, setEditForm] = useState({
    name: "",
    description: "",
    status: true
  })

  const { toast } = useToast()

  // 加载筛选条件
  async function loadFilterTypes() {
    try {
      const result = await api.getProviderTypes()
      if (result.code === 200 && Array.isArray(result.data)) {
        setFilterTypes(result.data)
      }
    } catch (error) {
    }
  }

  async function loadProviders() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (statusFilter && statusFilter !== "ALL") {
        params.set("type", statusFilter)
      }
      
      const result = await api.getProviders()
      
      if (result.code === 200 && Array.isArray(result.data)) {
        setProviders(result.data)
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

  // 切换服务商状态
  async function toggleProviderStatus(providerId: string, currentStatus: boolean) {
    try {
      const res = await fetch(`/api/llm/providers/${providerId}/toggle-status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' }
      })
      
      const result = await res.json().catch(() => null)
      
      if (res.ok && result?.success) {
        // 更新本地状态
        setProviders(prev => prev.map(provider => 
          provider.id === providerId 
            ? { ...provider, status: !currentStatus, provider: { ...provider.provider, status: !currentStatus } }
            : provider
        ))
        toast({
          title: currentStatus ? "已禁用服务商" : "已启用服务商",
          description: `服务商状态已${currentStatus ? '禁用' : '启用'}`
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

  // 打开编辑对话框
  function openEditDialog(provider: Provider) {
    setEditingProvider(provider)
    setEditForm({
      name: provider.name,
      description: provider.description || "",
      status: provider.status
    })
  }

  // 关闭编辑对话框
  function closeEditDialog() {
    setEditingProvider(null)
    setEditForm({
      name: "",
      description: "",
      status: true
    })
  }

  // 保存编辑
  async function saveEdit() {
    if (!editingProvider) return
    
    try {
      const payload = {
        id: editingProvider.id,
        protocol: editingProvider.protocol,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        status: editForm.status
      }

      const result = await api.createProvider(payload)

      if (result?.code === 200) {
        // 更新本地状态
        setProviders(prev => prev.map(provider => 
          provider.id === editingProvider.id 
            ? { 
                ...provider, 
                name: editForm.name.trim(),
                description: editForm.description.trim(),
                status: editForm.status,
                provider: { 
                  ...provider.provider, 
                  name: editForm.name.trim(),
                  description: editForm.description.trim(),
                  status: editForm.status
                }
              }
            : provider
        ))
        
        toast({
          title: "保存成功",
          description: "服务商信息已更新"
        })
        closeEditDialog()
      } else {
        const errorMsg = result?.message || '保存失败'
        toast({
          title: "保存失败",
          description: errorMsg,
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "保存失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    }
  }

  // 删除服务商
  async function deleteProvider(provider: Provider) {
    try {
      const result = await api.deleteProvider(provider.id)

      if (result?.code === 200) {
        // 从本地状态中移除
        setProviders(prev => prev.filter(p => p.id !== provider.id))
        
        toast({
          title: "删除成功",
          description: `服务商 "${provider.name}" 已删除`
        })
      } else {
        const errorMsg = result?.message || '删除失败'
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

  useEffect(() => {
    loadFilterTypes()
  }, [])

  useEffect(() => {
    loadProviders()
  }, [statusFilter])

  // 监听服务商保存事件，重新加载数据
  useEffect(() => {
    const handleProviderSaved = () => {
      loadProviders()
    }
    
    window.addEventListener('provider-saved', handleProviderSaved)
    return () => {
      window.removeEventListener('provider-saved', handleProviderSaved)
    }
  }, [])

  const filteredProviders = providers.filter(provider => {
    const matchesSearch = provider.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         provider.protocol.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (provider.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return <ProvidersPageSkeleton />
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">服务商管理</h1>
          <p className="text-sm text-muted-foreground">管理 AI 模型服务商和其提供的模型</p>
        </div>
        <Button 
          className="bg-black text-white hover:bg-black/90 cursor-pointer"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('open-provider-settings'))
          }}
        >
          <Plus className="w-4 h-4 mr-2" />
          添加服务商
        </Button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{providers.length}</div>
            <div className="text-sm text-muted-foreground">总服务商</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {providers.filter(p => p.status).length}
            </div>
            <div className="text-sm text-muted-foreground">已启用</div>
          </div>
          <div>
            <div className="text-2xl font-bold">
              {providers.reduce((sum, p) => sum + (p.models || []).length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">总模型数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {providers.reduce((sum, p) => sum + (p.models || []).filter(m => m.status).length, 0)}
            </div>
            <div className="text-sm text-muted-foreground">激活模型</div>
          </div>
        </div>
      </div>

      {/* Filters */}
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
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-32 cursor-pointer">
            <SelectValue placeholder="类型" />
          </SelectTrigger>
          <SelectContent>
            {filterTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type === "ALL" ? "全部类型" : 
                 type === "OFFICIAL" ? "官方" : 
                 type === "CUSTOM" ? "自定义" : type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button variant="secondary" onClick={loadProviders}>
          刷新
        </Button>
      </div>

      {/* Provider Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredProviders.map((provider) => (
          <Card 
            key={provider.id} 
            className={`relative border rounded-xl shadow-sm hover:shadow-md transition-all duration-200 ${
              provider.status 
                ? 'bg-green-50 border-green-200' 
                : 'bg-gray-50 border-gray-200'
            }`}
          >
            <CardContent className="p-6 relative">

              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-xl font-semibold text-gray-900">{provider.name}</h3>
                  {provider.official && (
                    <Badge 
                      variant="outline" 
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        provider.status 
                          ? 'bg-red-100 border-red-300 text-red-800 shadow-sm'
                          : 'bg-red-50 border-red-200 text-red-700'
                      }`}
                    >
                      ✓ 官方
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  <div className={`relative flex items-center justify-center w-6 h-6 rounded-full transition-all duration-200 ${
                    provider.status 
                      ? 'bg-green-100 shadow-sm' 
                      : 'bg-gray-100'
                  }`}>
                    <div className={`w-3 h-3 rounded-full transition-all duration-200 ${
                      provider.status 
                        ? 'bg-green-500 shadow-sm' 
                        : 'bg-gray-400'
                    }`}></div>
                    {provider.status && (
                      <div className="absolute inset-0 rounded-full bg-green-500 opacity-20 animate-pulse"></div>
                    )}
                  </div>
                  <Switch
                    checked={provider.status}
                    onCheckedChange={() => toggleProviderStatus(provider.id, provider.status)}
                    className="cursor-pointer data-[state=checked]:bg-green-500"
                  />
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-6">
                {provider.description || `${provider.protocol} 协议服务商`}
              </p>

              {/* Model Count */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm text-gray-500">模型数量</span>
                <span className="text-sm font-medium text-gray-900">
                  {(provider.models || []).filter(m => m.status).length}/{(provider.models || []).length} 激活
                </span>
              </div>

              {/* Model Tags */}
              <div className="mb-6">
                <span className="text-sm text-gray-500 mb-2 block">可用模型</span>
                <div className="flex flex-wrap gap-2 max-h-20 overflow-y-auto">
                  {(provider.models || []).length > 0 ? (
                    provider.models.slice(0, 6).map((model, index) => (
                      <Badge
                        key={model.id || index}
                        variant="outline"
                        className={`text-xs px-2 py-1 rounded-md font-medium border transition-all duration-200 ${
                          model.status
                            ? 'bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100'
                            : 'bg-gray-50 border-gray-200 text-gray-500'
                        }`}
                      >
                        {model.name || model.modelId || '未命名模型'}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-xs text-gray-400">暂无模型</span>
                  )}
                  {(provider.models || []).length > 6 && (
                    <Badge
                      variant="outline"
                      className="text-xs px-2 py-1 rounded-md font-medium bg-gray-50 border-gray-200 text-gray-500"
                    >
                      +{(provider.models || []).length - 6} 更多
                    </Badge>
                  )}
                </div>
              </div>

              {/* Buttons */}
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <Button
                    variant="outline"
                    className={`h-10 border transition-all duration-200 cursor-pointer ${
                      provider.status 
                        ? 'border-green-300 hover:bg-green-50 hover:border-green-400 text-green-700' 
                        : 'border-gray-300 hover:bg-gray-50 text-gray-700'
                    }`}
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
                      }
                    }}
                  >
                    <Server className="w-4 h-4 mr-2" />
                    官方网站
                  </Button>
                  <Button
                    variant="outline"
                    className="h-10 border border-blue-300 hover:bg-blue-50 hover:border-blue-400 text-blue-700 cursor-pointer transition-all duration-200"
                    onClick={() => openEditDialog(provider)}
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    编辑
                  </Button>
                </div>
                              <Button
                className={`w-full h-10 text-white transition-all duration-200 cursor-pointer ${
                  provider.status 
                    ? 'bg-green-600 hover:bg-green-700 shadow-sm' 
                    : 'bg-gray-600 hover:bg-gray-700'
                }`}
                onClick={async () => {
                  try {
                    // 直接调用后端接口加载模型列表
                    const res = await fetch(`/api/llm/models/by-provider/${provider.id}`, { 
                      cache: 'no-store' 
                    })
                    const result = await res.json()
                    
                    if (result.code === 200) {
                      // 成功加载模型列表后跳转
                      window.location.href = `/providers/${provider.id}/models`
                    } else {
                      toast({
                        title: "加载失败",
                        description: result.message || "无法加载模型列表",
                        variant: "destructive"
                      })
                    }
                  } catch (error) {
                    toast({
                      title: "加载失败",
                      description: "网络错误，请稍后重试",
                      variant: "destructive"
                    })
                  }
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                管理模型
              </Button>
              </div>

              {/* Status */}
              <div className="mt-4 text-xs text-gray-500">
                {provider.status ? "需要 API Key" : "已禁用"}
              </div>

              {/* 删除按钮 - 右下角 */}
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <button
                    className="absolute bottom-3 right-3 w-8 h-8 rounded-md bg-transparent hover:bg-red-50 transition-all duration-200 cursor-pointer p-0 border-0 flex items-center justify-center"
                    onMouseEnter={(e) => {
                      const icon = e.currentTarget.querySelector('svg')
                      if (icon) icon.style.color = '#ef4444'
                    }}
                    onMouseLeave={(e) => {
                      const icon = e.currentTarget.querySelector('svg')
                      if (icon) icon.style.color = '#9ca3af'
                    }}
                  >
                    <Trash2 className="w-5 h-5 text-gray-400 transition-colors duration-200" />
                  </button>
                </AlertDialogTrigger>
                <AlertDialogContent className="bg-white border border-gray-200 shadow-lg">
                  <AlertDialogHeader>
                    <AlertDialogTitle className="text-gray-900 font-semibold">确认删除服务商</AlertDialogTitle>
                    <AlertDialogDescription className="text-gray-600 mt-2">
                      您确定要删除服务商 "<strong className="text-gray-900">{provider.name}</strong>" 吗？
                      <br />
                      此操作将删除该服务商及其所有相关模型，且无法撤销。
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-6">
                    <AlertDialogCancel className="cursor-pointer bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300">
                      取消
                    </AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-red-600 hover:bg-red-700 text-white cursor-pointer border-red-600"
                      onClick={() => deleteProvider(provider)}
                    >
                      确认删除
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Empty State */}
      {filteredProviders.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery || statusFilter !== "all" 
              ? "没有找到匹配的服务商" 
              : "暂无服务商，点击右上角添加"}
          </div>
        </div>
      )}
      
      {/* Provider Settings Dialog */}
      <ProviderSettings />

      {/* Edit Provider Dialog */}
      <Dialog open={!!editingProvider} onOpenChange={(open) => !open && closeEditDialog()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑服务商</DialogTitle>
          </DialogHeader>
          {editingProvider && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>协议类型</Label>
                <Input
                  value={editingProvider.protocol}
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

              <div className="space-y-2">
                <Label>API Key</Label>
                <Input
                  value="*********************"
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500">API Key 不允许修改，请联系管理员</p>
              </div>

              <div className="space-y-2">
                <Label>Base URL</Label>
                <Input
                  value="https://api.example.com"
                  disabled
                  className="bg-gray-50 text-gray-500"
                />
                <p className="text-xs text-gray-500">Base URL 不允许修改，请联系管理员</p>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={editForm.status}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, status: checked }))}
                  className="cursor-pointer"
                />
                <span className="text-sm text-muted-foreground">
                  {editForm.status ? "启用服务商" : "禁用服务商"}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button variant="secondary" onClick={closeEditDialog} className="cursor-pointer">
                  取消
                </Button>
                <Button 
                  onClick={saveEdit}
                  className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
                  disabled={!editForm.name.trim()}
                >
                  保存
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
