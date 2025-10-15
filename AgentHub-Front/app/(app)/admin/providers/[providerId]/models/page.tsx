"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Plus, Edit, Trash2, Search, Settings } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { api } from "@/lib/api"
import { AdminModelsSkeleton } from "@/components/ui/page-skeleton"

interface Model {
  id: string
  userId?: string
  providerId: string
  providerName?: string
  modelId: string
  name: string
  description?: string
  type: string
  config?: {
    maxContextLength?: number
    temperature?: number
    enable_search?: boolean
  }
  official: boolean
  status: boolean
  createdAt: string
  updatedAt: string
}

export default function AdminProviderModelsPage() {
  const params = useParams()
  const { toast } = useToast()
  
  const [models, setModels] = useState<Model[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingModel, setEditingModel] = useState<Model | null>(null)
  
  const [createForm, setCreateForm] = useState({
    modelId: "",
    name: "",
    description: "",
    type: "NORMAL",
    maxContextLength: 4096,
    temperature: 0.7,
    enable_search: false
  })
  
  const [editForm, setEditForm] = useState({
    id: "",
    name: "",
    description: "",
    type: "NORMAL",
    maxContextLength: 4096,
    temperature: 0.7,
    enable_search: false,
    status: true
  })

  const providerId = params.providerId as string

  // 加载模型列表
  async function loadModels() {
    setLoading(true)
    try {
      const result = await api.adminModels.getModelsByProvider(providerId)

      if (result.success && Array.isArray(result.data)) {
        setModels(result.data)
      } else {
        throw new Error(result.message || "API返回错误")
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载模型列表，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 创建模型
  async function createModel() {
    try {
      const payload = {
        providerId,
        modelId: createForm.modelId.trim(),
        name: createForm.name.trim(),
        description: createForm.description.trim(),
        type: createForm.type,
        config: {
          maxContextLength: createForm.maxContextLength,
          temperature: createForm.temperature,
          enable_search: createForm.enable_search
        }
      }

      const result = await api.adminModels.createModel(payload)

      if (result.success) {
        toast({
          title: "创建成功",
          description: "模型已成功创建"
        })
        setShowCreateDialog(false)
        setCreateForm({
          modelId: "",
          name: "",
          description: "",
          type: "NORMAL",
          maxContextLength: 4096,
          temperature: 0.7,
          enable_search: false
        })
        loadModels()
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

  // 更新模型
  async function updateModel() {
    if (!editingModel) return
    
    try {
      const payload = {
        id: editForm.id,
        name: editForm.name.trim(),
        description: editForm.description.trim(),
        type: editForm.type,
        config: {
          maxContextLength: editForm.maxContextLength,
          temperature: editForm.temperature,
          enable_search: editForm.enable_search
        },
        status: editForm.status
      }

      const result = await api.adminModels.updateModel(payload)
      if (result.success) {
        toast({
          title: "更新成功",
          description: "模型信息已更新"
        })
        setEditingModel(null)
        loadModels()
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

  // 删除模型
  async function deleteModel(model: Model) {
    try {
      const result = await api.adminModels.deleteModel(model.id)

      if (result.success) {
        setModels(prev => prev.filter(m => m.id !== model.id))
        toast({
          title: "删除成功",
          description: `模型 "${model.name}" 已删除`
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

  // 切换模型状态
  async function toggleModelStatus(modelId: string, status: boolean) {
    try {
      const result = await api.toggleModelStatus(modelId)

      if (result?.success) {
        setModels(prev => prev.map(m =>
          m.id === modelId ? { ...m, status } : m
        ))
        toast({
          title: "状态更新成功",
          description: `模型已${status ? '启用' : '禁用'}`
        })
      } else {
        const errorMsg = result?.message || '状态更新失败'
        toast({
          title: "状态更新失败",
          description: errorMsg,
          variant: "destructive"
        })
        // 恢复原状态
        setModels(prev => prev.map(m =>
          m.id === modelId ? { ...m, status: !status } : m
        ))
      }
    } catch (error) {
      toast({
        title: "状态更新失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
      // 恢复原状态
      setModels(prev => prev.map(m =>
        m.id === modelId ? { ...m, status: !status } : m
      ))
    }
  }

  // 打开编辑对话框
  function openEditDialog(model: Model) {
    setEditingModel(model)
    setEditForm({
      id: model.id,
      name: model.name,
      description: model.description || "",
      type: model.type,
      maxContextLength: model.config?.maxContextLength || 4096,
      temperature: model.config?.temperature || 0.7,
      enable_search: model.config?.enable_search || false,
      status: model.status
    })
  }

  useEffect(() => {
    if (providerId) {
      loadModels()
    }
  }, [providerId])

  const filteredModels = models.filter(model => {
    const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         model.modelId.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (model.description || "").toLowerCase().includes(searchQuery.toLowerCase())
    
    return matchesSearch
  })

  if (loading) {
    return <AdminModelsSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => window.history.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            返回
          </Button>
          <div>
            <h1 className="text-2xl font-semibold">模型管理</h1>
            <p className="text-sm text-muted-foreground">管理服务商的 AI 模型</p>
          </div>
        </div>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-2" />
          添加模型
        </Button>
      </div>

      {/* Stats */}
      <div className="bg-white rounded-lg border p-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold">{models.length}</div>
            <div className="text-sm text-muted-foreground">总模型数</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-green-600">
              {models.filter(m => m.status).length}
            </div>
            <div className="text-sm text-muted-foreground">已启用</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">
              {models.filter(m => m.official).length}
            </div>
            <div className="text-sm text-muted-foreground">官方模型</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">
              {models.filter(m => !m.official).length}
            </div>
            <div className="text-sm text-muted-foreground">自定义模型</div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="搜索模型..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Button variant="secondary" onClick={loadModels}>
          刷新
        </Button>
      </div>

      {/* Model Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredModels.map((model) => (
          <Card key={model.id} className={`relative ${model.status ? 'border-green-200' : 'border-gray-200'}`}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="truncate">{model.name}</span>
                  {model.official && (
                    <Badge className="bg-blue-100 text-blue-700">官方</Badge>
                  )}
                </div>
                <Switch
                  checked={model.status}
                  onCheckedChange={(checked) => toggleModelStatus(model.id, checked)}
                />
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                <div><strong>模型ID:</strong> {model.modelId}</div>
                <div><strong>类型:</strong> {model.type}</div>
              </div>
              
              {model.description && (
                <p className="text-sm text-muted-foreground">{model.description}</p>
              )}
              
              <div className="text-sm space-y-1">
                <div><strong>上下文长度:</strong> {model.config?.maxContextLength || 'N/A'}</div>
                <div><strong>温度:</strong> {model.config?.temperature || 'N/A'}</div>
                <div><strong>搜索功能:</strong> {model.config?.enable_search ? '启用' : '禁用'}</div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => openEditDialog(model)}>
                  <Edit className="w-4 h-4 mr-1" />
                  编辑
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
                        确定要删除模型 "{model.name}" 吗？此操作无法撤销。
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>取消</AlertDialogCancel>
                      <AlertDialogAction 
                        onClick={() => deleteModel(model)} 
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
        ))}
      </div>

      {/* Empty State */}
      {filteredModels.length === 0 && !loading && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            {searchQuery 
              ? "没有找到匹配的模型" 
              : "暂无模型，点击右上角添加"}
          </div>
        </div>
      )}

      {/* Create Model Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>添加模型</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>模型ID</Label>
              <Input
                value={createForm.modelId}
                onChange={(e) => setCreateForm(prev => ({ ...prev, modelId: e.target.value }))}
                placeholder="请输入模型ID"
              />
            </div>

            <div className="space-y-2">
              <Label>模型名称</Label>
              <Input
                value={createForm.name}
                onChange={(e) => setCreateForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="请输入模型名称"
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
              <Label>模型类型</Label>
              <Select value={createForm.type} onValueChange={(value) => setCreateForm(prev => ({ ...prev, type: value }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NORMAL">普通模型</SelectItem>
                  <SelectItem value="FUNCTION">函数调用</SelectItem>
                  <SelectItem value="VISION">视觉模型</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>上下文长度</Label>
                <Input
                  type="number"
                  value={createForm.maxContextLength}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, maxContextLength: parseInt(e.target.value) || 4096 }))}
                />
              </div>
              <div className="space-y-2">
                <Label>温度</Label>
                <Input
                  type="number"
                  step="0.1"
                  min="0"
                  max="2"
                  value={createForm.temperature}
                  onChange={(e) => setCreateForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
                />
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                checked={createForm.enable_search}
                onCheckedChange={(checked) => setCreateForm(prev => ({ ...prev, enable_search: checked }))}
              />
              <span className="text-sm text-muted-foreground">启用搜索功能</span>
            </div>
          </div>
          <DialogFooter>
            <Button variant="secondary" onClick={() => setShowCreateDialog(false)}>
              取消
            </Button>
            <Button 
              onClick={createModel}
              disabled={!createForm.modelId.trim() || !createForm.name.trim()}
            >
              创建
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Model Dialog */}
      <Dialog open={!!editingModel} onOpenChange={(open) => !open && setEditingModel(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>编辑模型</DialogTitle>
          </DialogHeader>
          {editingModel && (
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>模型名称</Label>
                <Input
                  value={editForm.name}
                  onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="请输入模型名称"
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
                <Label>模型类型</Label>
                <Select value={editForm.type} onValueChange={(value) => setEditForm(prev => ({ ...prev, type: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="NORMAL">普通模型</SelectItem>
                    <SelectItem value="FUNCTION">函数调用</SelectItem>
                    <SelectItem value="VISION">视觉模型</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>上下文长度</Label>
                  <Input
                    type="number"
                    value={editForm.maxContextLength}
                    onChange={(e) => setEditForm(prev => ({ ...prev, maxContextLength: parseInt(e.target.value) || 4096 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>温度</Label>
                  <Input
                    type="number"
                    step="0.1"
                    min="0"
                    max="2"
                    value={editForm.temperature}
                    onChange={(e) => setEditForm(prev => ({ ...prev, temperature: parseFloat(e.target.value) || 0.7 }))}
                  />
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={editForm.enable_search}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, enable_search: checked }))}
                />
                <span className="text-sm text-muted-foreground">启用搜索功能</span>
              </div>

              <div className="flex items-center gap-3">
                <Switch
                  checked={editForm.status}
                  onCheckedChange={(checked) => setEditForm(prev => ({ ...prev, status: checked }))}
                />
                <span className="text-sm text-muted-foreground">
                  {editForm.status ? "启用模型" : "禁用模型"}
                </span>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="secondary" onClick={() => setEditingModel(null)}>
              取消
            </Button>
            <Button 
              onClick={updateModel}
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
