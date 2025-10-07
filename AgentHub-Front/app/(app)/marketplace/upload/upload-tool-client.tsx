'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { MarkdownMessage } from '@/components/chat/markdown-message'
import { 
  ArrowLeft, 
  Upload, 
  X,
  Github
} from 'lucide-react'
import { toast } from 'sonner'
import { api } from '@/lib/api'

export default function UploadToolClient() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  
  // 表单字段
  const [toolName, setToolName] = useState('')
  const [toolIcon, setToolIcon] = useState('')
  const [toolSubtitle, setToolSubtitle] = useState('')
  const [toolDescription, setToolDescription] = useState('')
  const [labels, setLabels] = useState<string[]>([])
  const [newLabel, setNewLabel] = useState('')
  const [githubUrl, setGithubUrl] = useState('')
  const [installCommand, setInstallCommand] = useState('')



  // 添加标签
  const addLabel = () => {
    if (newLabel.trim() && !labels.includes(newLabel.trim())) {
      setLabels([...labels, newLabel.trim()])
      setNewLabel('')
    }
  }

  // 移除标签
  const removeLabel = (index: number) => {
    setLabels(labels.filter((_, i) => i !== index))
  }

  // 处理标签输入的回车事件
  const handleLabelKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addLabel()
    }
  }

  // 表单验证
  const validateForm = () => {
    if (!toolName.trim()) {
      toast.error('请输入工具名称')
      return false
    }
    if (!toolDescription.trim()) {
      toast.error('请输入工具描述')
      return false
    }
    if (!githubUrl.trim()) {
      toast.error('请输入GitHub地址')
      return false
    }
    if (!installCommand.trim()) {
      toast.error('请输入安装命令')
      return false
    }
    
    // 验证JSON格式
    try {
      JSON.parse(installCommand)
    } catch (error) {
      toast.error('安装命令必须是有效的JSON格式')
      return false
    }
    
    return true
  }

  // 提交表单
  const handleSubmit = async () => {
    if (!validateForm()) return
    
    setLoading(true)
    try {
      // 构建工具数据
      const toolData = {
        name: toolName.trim(),
        icon: toolIcon.trim() || '🔧',
        subtitle: toolSubtitle.trim(),
        description: toolDescription.trim(),
        labels: labels.filter(label => label.trim()),
        githubUrl: githubUrl.trim(),
        installCommand: JSON.parse(installCommand.trim())
      }
      
      // 调用上传工具API
      const result = await api.tools.uploadTool(toolData)
      
      if (result.success) {
        toast.success('工具上传成功！等待审核...')
        // 跳转回工具中心
        router.push('/tools')
      } else {
        throw new Error(result.message || '上传失败')
      }
      
    } catch (error) {
      console.error('上传工具失败:', error)
      toast.error('上传工具失败')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-6 py-8 max-w-6xl">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        {/* 页面标题 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">上传工具</h1>
          <p className="text-gray-600">创建并分享你的工具，让更多人受益</p>
        </div>

        {/* 左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左侧：表单输入 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>基本信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="toolName">工具名称 *</Label>
                  <Input
                    id="toolName"
                    value={toolName}
                    onChange={(e) => setToolName(e.target.value)}
                    placeholder="输入工具名称"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="toolIcon">工具图标</Label>
                  <Input
                    id="toolIcon"
                    value={toolIcon}
                    onChange={(e) => setToolIcon(e.target.value)}
                    placeholder="输入emoji图标"
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">建议使用emoji，如：🔍、🌤️、🌐</p>
                </div>
                
                <div>
                  <Label htmlFor="toolSubtitle">副标题</Label>
                  <Input
                    id="toolSubtitle"
                    value={toolSubtitle}
                    onChange={(e) => setToolSubtitle(e.target.value)}
                    placeholder="简短的工具描述"
                    className="mt-2"
                  />
                </div>
                
                <div>
                  <Label htmlFor="toolDescription">工具描述 *</Label>
                  <Textarea
                    id="toolDescription"
                    value={toolDescription}
                    onChange={(e) => setToolDescription(e.target.value)}
                    placeholder="详细描述工具的功能和用途，支持 Markdown 格式"
                    rows={8}
                    className="mt-2"
                  />
                  <p className="text-xs text-gray-500 mt-1">支持 Markdown 格式，如：**粗体**、*斜体*、`代码`</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>标签</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="newLabel">添加标签</Label>
                  <Input
                    id="newLabel"
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyPress={handleLabelKeyPress}
                    placeholder="输入标签后按回车添加"
                    className="mt-2"
                  />
                </div>
                
                {labels.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {labels.map((label, index) => (
                      <Badge key={index} variant="secondary" className="flex items-center gap-1">
                        {label}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-red-500" 
                          onClick={() => removeLabel(index)}
                        />
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>技术信息</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <Label htmlFor="githubUrl">GitHub 地址 *</Label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      id="githubUrl"
                      value={githubUrl}
                      onChange={(e) => setGithubUrl(e.target.value)}
                      placeholder="https://github.com/username/repository"
                      className="pl-10 mt-2"
                    />
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="installCommand">安装命令 (JSON格式) *</Label>
                  <Textarea
                    id="installCommand"
                    value={installCommand}
                    onChange={(e) => setInstallCommand(e.target.value)}
                    placeholder='{"type": "npm", "command": "npm install your-package"}'
                    rows={4}
                    className="mt-2 font-mono text-sm"
                  />
                  <p className="text-xs text-gray-500 mt-1">JSON格式，例如：{`{"type": "npm", "command": "npm install package-name"}`}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：预览 */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>预览</CardTitle>
              </CardHeader>
              <CardContent>
                {/* 工具预览 */}
                <div className="border rounded-lg p-4 bg-gray-50">
                  <div className="flex items-start gap-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg flex items-center justify-center text-2xl">
                      {toolIcon || '🔧'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg">
                        {toolName || '工具名称'}
                      </h3>
                      {(toolSubtitle || '副标题') && (
                        <p className="text-gray-600 text-sm">
                          {toolSubtitle || '副标题'}
                        </p>
                      )}
                    </div>
                  </div>
                  
                  {toolDescription && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">描述:</h4>
                      <MarkdownMessage 
                        content={toolDescription}
                        className="text-sm text-gray-700 bg-white p-3 rounded border"
                      />
                    </div>
                  )}
                  
                  {labels.length > 0 && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">标签:</h4>
                      <div className="flex flex-wrap gap-1">
                        {labels.map((label, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {label}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {githubUrl && (
                    <div className="mb-4">
                      <h4 className="text-sm font-semibold mb-2">GitHub:</h4>
                      <div className="flex items-center gap-2 text-sm text-blue-600">
                        <Github className="w-4 h-4" />
                        <span className="truncate">{githubUrl}</span>
                      </div>
                    </div>
                  )}
                  
                  {installCommand && (
                    <div>
                      <h4 className="text-sm font-semibold mb-2">安装命令:</h4>
                      <pre className="bg-gray-900 text-green-400 p-3 rounded text-xs overflow-x-auto">
                        {installCommand}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>提交须知</CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-gray-600 space-y-2">
                <p>• 请确保工具描述准确清晰</p>
                <p>• GitHub地址必须可访问</p>
                <p>• 安装命令格式必须正确</p>
                <p>• 提交后需要管理员审核</p>
                <p>• 审核通过后将在工具市场展示</p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 底部提交按钮 */}
        <div className="flex justify-center space-x-4 mt-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            disabled={loading}
            className="cursor-pointer"
          >
            取消
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={loading}
            className="min-w-[120px] cursor-pointer"
          >
            {loading ? (
              <>
                <Upload className="h-4 w-4 mr-2 animate-spin" />
                上传中...
              </>
            ) : (
              <>
                <Upload className="h-4 w-4 mr-2" />
                提交工具
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
