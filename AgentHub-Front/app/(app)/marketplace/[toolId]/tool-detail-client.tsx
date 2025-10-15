'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MarkdownMessage } from '@/components/chat/markdown-message'
import { api } from '@/lib/api'
import { Tool, ToolVersion } from '@/lib/types'
import { 
  Download, 
  User, 
  Calendar, 
  Code, 
  ArrowLeft,
  CheckCircle,
  Github,
  ExternalLink
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface ToolDetailClientProps {
  toolId: string
}

export default function ToolDetailClient({ toolId }: ToolDetailClientProps) {
  const router = useRouter()
  const [tool, setTool] = useState<Tool | null>(null)
  const [versions, setVersions] = useState<ToolVersion[]>([])
  const [loading, setLoading] = useState(true)
  const [versionsLoading, setVersionsLoading] = useState(false)
  const [installing, setInstalling] = useState(false)
  const [showVersionHistory, setShowVersionHistory] = useState(false)

  useEffect(() => {
    loadToolDetail()
  }, [toolId])

  const loadToolDetail = async () => {
    try {
      setLoading(true)
      // 并行加载工具详情和版本信息
      const [toolResult, versionsResult] = await Promise.all([
        api.tools.getToolDetail(toolId),
        api.tools.getToolVersions(toolId)
      ])
      
      if (toolResult.success && toolResult.data) {
        setTool(toolResult.data)
      }
      
      if (versionsResult.success && versionsResult.data) {
        setVersions(versionsResult.data)
      }
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
      // 使用工具ID和版本进行安装
      const version = versions.length > 0 ? versions[0].version : '1.0.0'
      const result = await api.tools.installTool(tool.id, version)
      if (result.success) {
        toast.success(result.message || '安装成功')
        // 更新安装次数
        setTool(prev => prev ? { ...prev, installCount: (prev.installCount || 0) + 1 } : null)
      } else {
        toast.error(result.message || '安装失败')
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
              {tool.icon ? (
                <img 
                  src={tool.icon} 
                  alt={tool.name}
                  className="w-20 h-20 rounded-2xl object-cover bg-gradient-to-br from-blue-50 to-indigo-100"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.style.display = 'none';
                    target.nextElementSibling?.classList.remove('hidden');
                  }}
                />
              ) : null}
              <div className={`w-20 h-20 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl flex items-center justify-center text-4xl ${tool.icon ? 'hidden' : ''}`}>
                🔧
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
                      <span>{tool.userName || '未知作者'}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Download className="h-4 w-4" />
                      <span>{formatInstallCount(tool.installCount)} 次安装</span>
                    </div>
                    {tool.office && (
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
                content={tool.description || tool.subtitle || '暂无描述'}
                className="text-gray-700 leading-relaxed"
              />
            </div>
          </div>

          {/* 右侧：标签、项目信息、版本信息等 */}
          <div className="space-y-8">
            {/* 项目信息 */}
            {tool.uploadUrl && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">项目地址</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Github className="w-4 h-4 text-gray-600" />
                  <a 
                    href={tool.uploadUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 cursor-pointer truncate flex-1 text-sm"
                  >
                    {tool.uploadUrl}
                  </a>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>
            )}

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

            {/* 功能列表 */}
            {tool.toolList && tool.toolList.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">功能列表</h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {tool.toolList.map((toolItem: any, index: number) => (
                    <div key={index} className="border rounded-lg p-3 bg-blue-50/30">
                      <div className="flex items-center gap-2 mb-2">
                        <Code className="h-3 w-3 text-blue-600" />
                        <span className="font-mono text-xs font-semibold text-blue-700">
                          {toolItem.name || toolItem.function?.name || `功能${index + 1}`}
                        </span>
                      </div>
                      {(toolItem.description || toolItem.function?.description) && (
                        <p className="text-gray-600 text-xs mb-2">
                          {toolItem.description || toolItem.function?.description}
                        </p>
                      )}
                      {(toolItem.parameters || toolItem.function?.parameters) && (
                        <div className="bg-white rounded p-2 mt-2">
                          <div className="text-xs font-semibold text-gray-700 mb-1">参数:</div>
                          <div className="space-y-1">
                            {Object.entries(toolItem.parameters || toolItem.function?.parameters || {}).map(([key, param]: [string, any]) => (
                              <div key={key} className="text-xs text-gray-600">
                                <span className="font-mono font-semibold text-blue-600">{key}</span>
                                <span className="text-gray-500"> ({param.type})</span>
                                {param.description && <span> - {param.description}</span>}
                                {param.default !== undefined && (
                                  <span className="text-blue-600"> [默认: {String(param.default)}]</span>
                                )}
                                {param.required && (
                                  <span className="text-red-600 text-xs"> *必填</span>
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
                    {versions.length > 0 ? versions[0].version : '1.0.0'}
                  </Badge>
                </div>
                
                {versions.length > 0 && versions[0].changeLog && (
                  <div>
                    <div className="text-gray-600 mb-2">更新说明</div>
                    <p className="text-gray-800 bg-gray-50 p-2 rounded text-xs">
                      {versions[0].changeLog}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                  <span className="text-gray-600">发布时间</span>
                  <span className="text-gray-800">
                    {versions.length > 0 && versions[0].createdAt ? formatDate(versions[0].createdAt) : tool.createdAt ? formatDate(tool.createdAt) : '未知'}
                  </span>
                </div>

                {/* 历史版本按钮 */}
                {versions.length > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowVersionHistory(!showVersionHistory)}
                    className="w-full h-7 text-xs mt-3"
                  >
                    <Calendar className="h-3 w-3 mr-1" />
                    {showVersionHistory ? '隐藏版本历史' : `查看版本历史 (${versions.length})`}
                  </Button>
                )}
              </div>
            </div>

            {/* 版本历史 */}
            {showVersionHistory && versions.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">版本历史</h3>
                <div className="space-y-4 max-h-80 overflow-y-auto">
                  {versions.map((version, index) => (
                    <div key={version.id || index} className="border rounded-lg p-3 bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={index === 0 ? "default" : "outline"} 
                            className="text-xs"
                          >
                            v{version.version}
                          </Badge>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                              当前版本
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-gray-500">
                          {version.createdAt ? formatDate(version.createdAt) : '未知'}
                        </span>
                      </div>

                      {version.changeLog && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-700 leading-relaxed">
                            {version.changeLog}
                          </p>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-xs text-gray-500">
                        {version.userName && (
                          <div className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            <span>{version.userName}</span>
                          </div>
                        )}
                        {version.installCount && (
                          <div className="flex items-center gap-1">
                            <Download className="h-3 w-3" />
                            <span>{version.installCount} 安装</span>
                          </div>
                        )}
                      </div>
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
                  <Badge variant="outline" className="text-xs">{tool.toolType || 'CUSTOM'}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">上传方式</span>
                  <span className="text-gray-800">{tool.uploadType || 'GITHUB'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">审核状态</span>
                  <Badge 
                    variant={tool.status === 'APPROVED' ? 'default' : 'secondary'} 
                    className="text-xs"
                  >
                    {tool.status === 'APPROVED' ? '已审核' : tool.status || '待审核'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">版本数量</span>
                  <span className="text-gray-800">{versions.length} 个版本</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">创建时间</span>
                  <span className="text-gray-800">{tool.createdAt ? formatDate(tool.createdAt) : '未知'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">最后更新</span>
                  <span className="text-gray-800">{tool.updatedAt ? formatDate(tool.updatedAt) : '未知'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
