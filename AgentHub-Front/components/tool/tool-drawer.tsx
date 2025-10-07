"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Download,
  Shield,
  Github,
  Calendar,
  Users,
  Zap,
  Settings,
  X,
  ExternalLink
} from "lucide-react"
import { Tool, UserTool } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { MarkdownMessage } from "@/components/chat/markdown-message"

interface ToolDrawerProps {
  tool: Tool | UserTool | null
  open: boolean
  onOpenChange: (open: boolean) => void
  type: 'market' | 'installed' | 'created'
  onActionComplete?: () => void
}

export function ToolDrawer({ tool, open, onOpenChange, type, onActionComplete }: ToolDrawerProps) {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  if (!tool) return null

  const isUserTool = (tool: Tool | UserTool): tool is UserTool => {
    return 'toolId' in tool
  }

  const handleInstall = async () => {
    if (type !== 'market' || isUserTool(tool)) return
    
    setLoading(true)
    try {
      const result = await api.tools.installTool(tool.id)
      if (result.success) {
        toast({
          title: "安装成功",
          description: `${tool.name} 已成功安装`,
        })
        onActionComplete?.()
        onOpenChange(false)
      } else {
        toast({
          title: "安装失败",
          description: result.message || "工具安装失败",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "安装失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleUninstall = async () => {
    if (type !== 'installed' || !isUserTool(tool)) return

    setLoading(true)
    try {
      const result = await api.tools.uninstallTool(tool.id)
      if (result.success) {
        toast({
          title: "卸载成功",
          description: `${tool.name} 已成功卸载`,
        })
        onActionComplete?.()
        onOpenChange(false)
      } else {
        toast({
          title: "卸载失败",
          description: result.message || "工具卸载失败",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "卸载失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 根据工具类型获取版本信息
  const getToolVersion = () => {
    if (type === 'installed' && isUserTool(tool)) {
      // 已安装的工具使用currentVersion字段
      return tool.currentVersion || tool.version || '1.0.0'
    } else if (type === 'created') {
      // 创建的工具使用version字段
      return isUserTool(tool) ? tool.version : '1.0.0'
    } else {
      // 市场工具使用默认版本
      return '1.0.0'
    }
  }
  
  const toolVersion = getToolVersion()
  const installCount = isUserTool(tool) ? 0 : (tool as Tool).installCount || 0

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-[500px] sm:w-[540px] p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          <SheetHeader className="px-6 py-4 border-b">
            <div className="flex items-start gap-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={tool.icon} alt={tool.name} />
                <AvatarFallback className="text-lg">
                  {tool.name[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <SheetTitle className="text-xl truncate">{tool.name}</SheetTitle>
                  {tool.isOffice && (
                    <Badge 
                      variant="outline" 
                      className="gap-1 text-xs border-red-200 bg-red-50 text-red-700"
                    >
                      <Shield className="w-3 h-3" />
                      官方
                    </Badge>
                  )}
                </div>
                {tool.subtitle && (
                  <p className="text-sm text-muted-foreground mb-2">
                    {tool.subtitle}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    v{toolVersion}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {installCount} 安装
                  </span>
                </div>
              </div>
            </div>
          </SheetHeader>

          {/* Content */}
          <ScrollArea className="flex-1 px-6">
            <div className="py-6 space-y-6">
              {/* 描述 */}
              {tool.description && (
                <div>
                  <h3 className="font-semibold mb-3">工具描述</h3>
                  <MarkdownMessage 
                    content={tool.description}
                    className="text-sm text-gray-700 bg-gray-50 p-4 rounded-lg"
                  />
                </div>
              )}

              {/* 标签 */}
              {tool.labels && tool.labels.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-3">标签</h3>
                  <div className="flex flex-wrap gap-2">
                    {tool.labels.map((label, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {label}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* 工具列表 - 模拟数据 */}
              <div>
                <h3 className="font-semibold mb-3">功能列表</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">主要功能</p>
                      <p className="text-xs text-muted-foreground">
                        提供核心功能实现，支持多种参数配置
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                    <div>
                      <p className="font-medium text-sm">扩展功能</p>
                      <p className="text-xs text-muted-foreground">
                        提供额外的扩展能力和定制化选项
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* 工具列表 */}
              {(tool.toolList && tool.toolList.length > 0) && (
                <div>
                  <h3 className="font-semibold mb-3">工具列表</h3>
                  <div className="space-y-2">
                    {tool.toolList.map((toolItem: any, index: number) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-xs font-medium text-blue-600">
                              {(toolItem.name || toolItem.title || `工具${index + 1}`)[0]}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium text-sm">
                              {toolItem.name || toolItem.title || `工具${index + 1}`}
                            </div>
                            {toolItem.description && (
                              <div className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {toolItem.description}
                              </div>
                            )}
                          </div>
                        </div>
                        {type === 'installed' && toolItem.currentVersion && (
                          <Badge variant="outline" className="text-xs">
                            v{toolItem.currentVersion}
                          </Badge>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub链接 - 模拟数据 */}
              <div>
                <h3 className="font-semibold mb-3">项目信息</h3>
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                  <Github className="w-4 h-4 text-gray-600" />
                  <span className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer">
                    https://github.com/example/{tool.name.toLowerCase()}
                  </span>
                  <ExternalLink className="w-3 h-3 text-gray-400" />
                </div>
              </div>

              {/* 统计信息 */}
              <div>
                <h3 className="font-semibold mb-3">统计信息</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-blue-50 rounded-lg">
                    <div className="text-lg font-semibold text-blue-600">
                      {installCount}
                    </div>
                    <div className="text-xs text-blue-600">总安装量</div>
                  </div>
                  <div className="text-center p-3 bg-green-50 rounded-lg">
                    <div className="text-lg font-semibold text-green-600">
                      {Math.floor(Math.random() * 50) + 10}
                    </div>
                    <div className="text-xs text-green-600">今日使用</div>
                  </div>
                </div>
              </div>
            </div>
          </ScrollArea>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t">
            {type === 'market' ? (
              <Button 
                onClick={handleInstall} 
                disabled={loading}
                className="w-full cursor-pointer"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                {loading ? "安装中..." : "安装工具"}
              </Button>
            ) : type === 'installed' ? (
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 cursor-pointer" size="lg">
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleUninstall}
                  disabled={loading}
                  className="flex-1 cursor-pointer"
                  size="lg"
                >
                  <X className="w-4 w-4 mr-2" />
                  {loading ? "卸载中..." : "卸载"}
                </Button>
              </div>
            ) : (
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 cursor-pointer" size="lg">
                  <Settings className="w-4 h-4 mr-2" />
                  设置
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={handleUninstall}
                  disabled={loading}
                  className="flex-1 cursor-pointer"
                  size="lg"
                >
                  <X className="w-4 w-4 mr-2" />
                  {loading ? "删除中..." : "删除"}
                </Button>
              </div>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  )
}
