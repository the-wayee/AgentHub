'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarkdownMessage } from '@/components/chat/markdown-message'
import { api } from '@/lib/api'
import { Tool } from '@/lib/types'
import { 
  Download, 
  User, 
  Calendar, 
  Code, 
  ArrowLeft,
  CheckCircle
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ToolDetailClientProps {
  toolId: string
}

export default function ToolDetailClient({ toolId }: ToolDetailClientProps) {
  const router = useRouter()
  const [tool, setTool] = useState<Tool | null>(null)
  const [loading, setLoading] = useState(true)
  const [installing, setInstalling] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  useEffect(() => {
    loadToolDetail()
  }, [toolId])

  const loadToolDetail = async () => {
    try {
      setLoading(true)
      const toolData = await api.tools.getToolDetail(toolId)
      setTool(toolData)
    } catch (error) {
      console.error('获取工具详情失败:', error)
      toast.error('获取工具详情失败')
    } finally {
      setLoading(false)
    }
  }

  const handleInstall = async () => {
    if (!tool) return
    
    try {
      setInstalling(true)
      const result = await api.tools.installTool(tool.id)
      if (result.success) {
        toast.success(result.message)
        // 更新安装次数（模拟）
        setTool(prev => prev ? { ...prev, installCount: (prev.installCount || 0) + 1 } : null)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('安装工具失败:', error)
      toast.error('安装工具失败')
    } finally {
      setInstalling(false)
    }
  }

  const formatInstallCount = (count?: number) => {
    if (!count) return '0'
    if (count >= 10000) return `${(count / 10000).toFixed(1)}万`
    if (count >= 1000) return `${(count / 1000).toFixed(1)}k`
    return count.toString()
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="h-32 bg-gray-200 rounded mb-8"></div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="space-y-2">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
            <div>
              <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="space-y-4">
                <div className="h-20 bg-gray-200 rounded"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!tool) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">工具不存在</h2>
          <p className="text-gray-600">您访问的工具不存在或已被删除</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="container mx-auto px-6 py-8">
        {/* 返回按钮 */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-8"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          返回
        </Button>

        {/* 上部分：工具基本信息 */}
        <div className="border-b border-gray-200 pb-8 mb-8">
          <div className="flex items-start gap-6">
            {/* 工具图标 */}
            <div className="flex-shrink-0">
              <div className="w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center text-4xl">
                {tool.icon || '🔧'}
              </div>
            </div>

            {/* 工具信息 */}
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">{tool.name}</h1>
                  {tool.subtitle && (
                    <p className="text-lg text-gray-600 mb-3">{tool.subtitle}</p>
                  )}
                  
                  {/* 作者和安装次数 */}
                  <div className="flex items-center gap-6 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <User className="h-4 w-4" />
                      <span>{tool.author?.name || '未知作者'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{formatInstallCount(tool.installCount)} 次安装</span>
                    </div>
                    {tool.isOffice && (
                      <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        官方
                      </Badge>
                    )}
                  </div>
                </div>

                {/* 安装按钮 */}
                <Button 
                  onClick={handleInstall}
                  disabled={installing}
                  size="lg"
                  className="min-w-[120px]"
                >
                  {installing ? '安装中...' : '安装工具'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* 下部分：左右布局 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* 左侧：工具描述 */}
          <div className="lg:col-span-2">
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">工具描述</h2>
              <MarkdownMessage 
                content={tool.description || ''}
                className="text-gray-700 leading-relaxed"
              />
            </div>
          </div>

          {/* 右侧：标签、工具列表、版本信息等 */}
          <div className="space-y-8">
            {/* 工具标签 */}
            {tool.labels && tool.labels.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">标签</h3>
                <div className="flex flex-wrap gap-2">
                  {tool.labels.map((label, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* 工具功能列表 */}
            {tool.toolList && tool.toolList.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-4">工具功能列表</h3>
                <div className="space-y-4">
                  {tool.toolList.map((toolItem, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-3 w-3 text-blue-600" />
                        <span className="font-mono text-xs font-semibold text-blue-700">
                          {toolItem.name}
                        </span>
                      </div>
                      <p className="text-gray-600 text-xs mb-2">
                        {toolItem.description}
                      </p>
                      {toolItem.parameters && (
                        <div className="bg-gray-50 rounded p-2 mt-2">
                          <div className="text-xs font-semibold text-gray-700 mb-1">参数:</div>
                          <div className="space-y-1">
                            {Object.entries(toolItem.parameters).map(([key, param]: [string, any]) => (
                              <div key={key} className="text-xs text-gray-600">
                                <span className="font-mono font-semibold">{key}</span>
                                <span className="text-gray-500"> ({param.type})</span>
                                {param.description && <span> - {param.description}</span>}
                                {param.default !== undefined && (
                                  <span className="text-blue-600"> [默认: {String(param.default)}]</span>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 版本信息 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">版本信息</h3>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">当前版本</span>
                  <Badge variant="secondary" className="text-xs">
                    {tool.versions?.[0]?.version || '1.0.0'}
                  </Badge>
                </div>
                
                {tool.changelog && (
                  <div>
                    <div className="text-gray-600 mb-2">更新说明</div>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded text-xs">
                      {tool.changelog}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">发布时间</span>
                  <span className="text-gray-800">
                    {tool.versions?.[0]?.date ? formatDate(tool.versions[0].date) : formatDate(tool.createdAt)}
                  </span>
                </div>

                {/* 历史版本按钮 */}
                {tool.versions && tool.versions.length > 1 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="w-full h-7 text-xs mt-3"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {showVersionHistory ? '隐藏历史版本' : '查看历史版本'}
                  </Button>
                )}
              </div>
            </div>

            {/* 版本历史 */}
            {showVersionHistory && tool.versions && tool.versions.length > 1 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">版本历史</h3>
                <div className="space-y-3">
                  {tool.versions.slice(1).map((version, index) => (
                    <div key={index} className="border-l-2 border-gray-200 pl-3">
                      <div className="flex items-center justify-between mb-1">
                        <Badge variant="outline" className="text-xs">
                          {version.version}
                        </Badge>
                        <span className="text-xs text-gray-500">
                          {formatDate(version.date)}
                        </span>
                      </div>
                      <p className="text-xs text-gray-700">
                        {version.changelog}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 工具统计 */}
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-3">统计信息</h3>
              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">工具类型</span>
                  <Badge variant="outline" className="text-xs">{tool.toolType}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">上传方式</span>
                  <span className="text-gray-800">{tool.uploadType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">创建时间</span>
                  <span className="text-gray-800">{formatDate(tool.createdAt)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">最后更新</span>
                  <span className="text-gray-800">{formatDate(tool.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
