"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ToolCard } from "@/components/tool/tool-card"
import { ToolDrawer } from "@/components/tool/tool-drawer"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Search, ArrowRight, Package, Sparkles, Plus } from "lucide-react"
import { Tool, UserTool } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function ToolsPage() {
  const [loading, setLoading] = useState(true)
  const [installedTools, setInstalledTools] = useState<UserTool[]>([])
  const [createdTools, setCreatedTools] = useState<Tool[]>([])
  const [marketTools, setMarketTools] = useState<Tool[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedTool, setSelectedTool] = useState<Tool | UserTool | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerType, setDrawerType] = useState<'market' | 'installed' | 'created'>('installed')
  const [activeTab, setActiveTab] = useState("installed")
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // 并行加载已安装工具、创建的工具和推荐工具
      const [installedResult, createdResult, recommendResult] = await Promise.all([
        api.tools.getInstalledTools({ current: 1, size: 10 }),
        api.tools.getCreatedTools(),
        api.tools.getRecommendTools() // 获取推荐工具
      ])

      if (installedResult.success) {
        setInstalledTools(installedResult.data || [])
      }

      if (createdResult.success) {
        setCreatedTools(createdResult.data || [])
      }

      if (recommendResult.success) {
        setMarketTools(recommendResult.data || [])
      }
    } catch (error) {
      toast({
        title: "加载失败",
        description: "无法加载工具数据，请稍后重试",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const handleActionComplete = () => {
    loadData() // 重新加载数据
  }

  const handleCardClick = (tool: Tool | UserTool, type: 'market' | 'installed' | 'created') => {
    setSelectedTool(tool)
    setDrawerType(type)
    setDrawerOpen(true)
  }

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-6 space-y-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-64 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* 页面头部 */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">工具中心</h1>
            <p className="text-muted-foreground">
              管理您的工具，发现更多实用功能
            </p>
          </div>
          <Link href="/marketplace/upload">
            <Button className="flex items-center gap-2 cursor-pointer">
              <Plus className="h-4 w-4" />
              上传工具
            </Button>
          </Link>
        </div>
        
        {/* 搜索栏 */}
        <div className="flex gap-2 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Link href="/marketplace">
            <Button variant="outline" className="gap-2 cursor-pointer">
              <Package className="w-4 h-4" />
              浏览市场
            </Button>
          </Link>
        </div>
      </div>

      {/* 我的工具区域 - 使用 Tabs 区分已安装和创建的工具 */}
      <section className="space-y-4">
        <h2 className="text-xl font-semibold">我的工具</h2>
        
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="installed" className="flex items-center gap-2">
              已安装的工具
              <Badge variant="secondary">{installedTools.length}</Badge>
            </TabsTrigger>
            <TabsTrigger value="created" className="flex items-center gap-2">
              我创建的工具
              <Badge variant="secondary">{createdTools.length}</Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="installed" className="space-y-4">
            {installedTools.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {installedTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    type="installed"
                    onActionComplete={handleActionComplete}
                    onCardClick={(tool) => handleCardClick(tool, 'installed')}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Package className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-lg mb-2">还没有安装任何工具</p>
                    <p className="text-muted-foreground text-sm mb-4">
                      从下方推荐中选择，或者浏览完整的工具市场
                    </p>
                    <Link href="/marketplace">
                      <Button className="gap-2 cursor-pointer">
                        <Search className="w-4 h-4" />
                        探索工具市场
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="created" className="space-y-4">
            {createdTools.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {createdTools.map((tool) => (
                  <ToolCard
                    key={tool.id}
                    tool={tool}
                    type="created"
                    onActionComplete={handleActionComplete}
                    onCardClick={(tool) => handleCardClick(tool, 'created')}
                  />
                ))}
              </div>
            ) : (
              <Card className="p-8 text-center">
                <div className="flex flex-col items-center gap-4">
                  <Plus className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-lg mb-2">还没有创建任何工具</p>
                    <p className="text-muted-foreground text-sm mb-4">
                      上传您的第一个工具，与社区分享
                    </p>
                    <Link href="/marketplace/upload">
                      <Button className="gap-2 cursor-pointer">
                        <Plus className="w-4 h-4" />
                        上传工具
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </section>

      {/* 推荐工具区域 */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-semibold">精选推荐</h2>
            <Sparkles className="w-5 h-5 text-yellow-500" />
          </div>
          <Link href="/marketplace">
            <Button variant="outline" size="sm" className="gap-1 cursor-pointer">
              查看更多 <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
        
        {marketTools.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {marketTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                type="market"
                onActionComplete={handleActionComplete}
                onCardClick={(tool) => handleCardClick(tool, 'market')}
              />
            ))}
          </div>
        ) : (
          <Card className="p-8 text-center">
            <div className="flex flex-col items-center gap-4">
              <Sparkles className="w-12 h-12 text-muted-foreground" />
              <div>
                <p className="font-medium text-lg mb-2">暂无推荐工具</p>
                <p className="text-muted-foreground text-sm">
                  工具正在审核中，请稍后再来查看
                </p>
              </div>
            </div>
          </Card>
        )}
      </section>



      {/* 工具详情抽屉 */}
      <ToolDrawer
        tool={selectedTool}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        type={drawerType}
        onActionComplete={handleActionComplete}
      />
    </div>
  )
}
