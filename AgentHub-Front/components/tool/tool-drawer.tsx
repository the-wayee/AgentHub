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
  ExternalLink,
  Info
} from "lucide-react"
import { Tool, UserTool } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { MarkdownMessage } from "@/components/chat/markdown-message"
import { useRouter } from "next/navigation"

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
  const router = useRouter()



  if (!tool) return null

  const isUserTool = (tool: Tool | UserTool): tool is UserTool => {
    return 'toolId' in tool
  }

  const handleInstall = async () => {
    if (type !== 'market') return
    
    setLoading(true)
    try {
      // 安装市场工具，需要传递toolId和version
      const toolId = (tool as any).toolId || tool.id
      const version = tool.version || '1.0.0'
      const result = await api.tools.installTool(toolId, version)
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
    if (type !== 'installed') return

    setLoading(true)
    try {
      // 卸载已安装的工具，需要传递toolId
      const toolId = (tool as any).toolId || tool.id
      const result = await api.tools.uninstallTool(toolId)
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

  // 跳转详情页面
  const handleViewDetail = () => {
    const toolId = isUserTool(tool) ? tool.toolId : tool.id
    router.push(`/marketplace/${toolId}`)
  }



  // 删除用户创建的工具
  const handleDeleteTool = async () => {
    if (type !== 'created') return

    setLoading(true)
    try {
      const result = await api.tools.deleteTool(tool.id)
      if (result.success) {
        toast({
          title: "删除成功",
          description: `${tool.name} 已成功删除`,
        })
        onActionComplete?.()
        onOpenChange(false)
      } else {
        toast({
          title: "删除失败",
          description: result.message || "工具删除失败",
          variant: "destructive"
        })
      }
    } catch (error) {
      toast({
        title: "删除失败",
        description: "网络错误，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // 直接使用后端返回的version字段
  const toolVersion = tool.version || '1.0.0'
  const installCount = tool.installCount || 0

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
                  {tool.office && (
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
              {tool.subtitle && (
                <div>
                  <h3 className="font-semibold mb-3">工具描述</h3>
                  <MarkdownMessage 
                    content={tool.subtitle}
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

              {/* 功能列表 */}
              {(tool.toolList && tool.toolList.length > 0) && (
                <div>
                  <h3 className="font-semibold mb-3">功能列表</h3>
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

              {/* 项目信息 */}
              {tool.uploadUrl && (
                <div>
                  <h3 className="font-semibold mb-3">项目信息</h3>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Github className="w-4 h-4 text-gray-600" />
                    <a 
                      href={tool.uploadUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-sm text-blue-600 hover:text-blue-800 cursor-pointer truncate flex-1"
                    >
                      {tool.uploadUrl}
                    </a>
                    <ExternalLink className="w-3 h-3 text-gray-400" />
                  </div>
                </div>
              )}

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
              <div className="flex gap-3">
                <Button 
                  onClick={handleInstall}
                  disabled={loading}
                  className="flex-1 cursor-pointer"
                  size="lg"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? "安装中..." : "安装"}
                </Button>
                <Button 
                  variant="outline"
                  onClick={handleViewDetail}
                  className="flex-1 cursor-pointer"
                  size="lg"
                >
                  <Info className="w-4 h-4 mr-2" />
                  详情
                </Button>
              </div>
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
                  onClick={handleDeleteTool}
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
