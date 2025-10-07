"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { 
  Download, 
  CheckCircle, 
  Shield, 
  Info, 
  MoreHorizontal,
  Trash2,
  RefreshCw,
  Share,
  Settings
} from "lucide-react"
import { Tool, UserTool } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface ToolCardProps {
  tool: Tool | UserTool
  type: 'market' | 'installed'
  onActionComplete?: () => void
  onCardClick?: (tool: Tool | UserTool) => void
}

export function ToolCard({ tool, type, onActionComplete, onCardClick }: ToolCardProps) {
  const [loading, setLoading] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

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

  const handleViewDetail = () => {
    const toolId = isUserTool(tool) ? tool.toolId : tool.id
    router.push(`/marketplace/${toolId}`)
  }

  const handleCardClick = (e: React.MouseEvent) => {
    // 防止冒泡到卡片点击事件
    if ((e.target as HTMLElement).closest('[data-dropdown-trigger]')) {
      return
    }
    onCardClick?.(tool)
  }

  const handleUpdateTool = async () => {
    // TODO: 实现工具更新逻辑
    toast({
      title: "更新工具",
      description: "工具更新功能即将推出",
    })
  }

  const handlePublishTool = async () => {
    // TODO: 实现工具发布逻辑
    toast({
      title: "发布工具",
      description: "工具发布功能即将推出",
    })
  }

  const handleShareTool = async () => {
    // TODO: 实现工具分享逻辑
    toast({
      title: "分享工具",
      description: "工具分享功能即将推出",
    })
  }

  const renderStatusBadge = () => {
    if (type === 'installed') {
      return <Badge variant="default" className="gap-1"><CheckCircle className="w-3 h-3" />已安装</Badge>
    }

    // 市场工具不显示审核状态，用户看到的都是已审核通过的
    return null
  }

  return (
    <Card 
      className="h-full flex flex-col hover:shadow-lg transition-all duration-200 relative group overflow-hidden cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleCardClick}
    >
      <CardHeader>
        <div className="flex items-start gap-3">
          <Avatar className="w-12 h-12">
            <AvatarImage src={tool.icon} alt={tool.name} />
            <AvatarFallback>{tool.name[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <CardTitle className="text-lg truncate">{tool.name}</CardTitle>
              {tool.isOffice && (
                <Badge 
                  variant="outline" 
                  className="gap-1 text-xs border-red-200 bg-red-50 text-red-700 hover:bg-red-100"
                >
                  <Shield className="w-3 h-3" />
                  官方
                </Badge>
              )}
            </div>
            {tool.subtitle && (
              <CardDescription className="text-sm truncate">
                {tool.subtitle}
              </CardDescription>
            )}
          </div>
          <div className="flex flex-col items-end gap-1">
            {renderStatusBadge()}
            {/* 更多选项按钮 */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild data-dropdown-trigger>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 w-8 p-0 hover:bg-gray-100 cursor-pointer"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                {type === 'market' && (
                  <>
                    <DropdownMenuItem onClick={handleInstall} disabled={loading} className="cursor-pointer">
                      <Download className="h-4 w-4 mr-2" />
                      {loading ? "安装中..." : "安装工具"}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleViewDetail} className="cursor-pointer">
                      <Info className="h-4 w-4 mr-2" />
                      查看详情
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleShareTool} className="cursor-pointer">
                      <Share className="h-4 w-4 mr-2" />
                      分享工具
                    </DropdownMenuItem>
                  </>
                )}
                {type === 'installed' && (
                  <>
                    <DropdownMenuItem onClick={handleUpdateTool} className="cursor-pointer">
                      <RefreshCw className="h-4 w-4 mr-2" />
                      更新工具
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handlePublishTool} className="cursor-pointer">
                      <Share className="h-4 w-4 mr-2" />
                      发布工具
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={handleViewDetail} className="cursor-pointer">
                      <Settings className="h-4 w-4 mr-2" />
                      工具设置
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleUninstall} 
                      disabled={loading}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {loading ? "卸载中..." : "卸载工具"}
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1">
        {tool.description && (
          <p className="text-sm text-muted-foreground mb-3" style={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden'
          }}>
            {tool.description}
          </p>
        )}
        
        {tool.labels && tool.labels.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {tool.labels.slice(0, 3).map((label, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {label}
              </Badge>
            ))}
            {tool.labels.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{tool.labels.length - 3}
              </Badge>
            )}
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-2">
        {/* 保持footer的最小高度，但不显示按钮 */}
        <div className="w-full h-2"></div>
      </CardFooter>
    </Card>
  )
}
