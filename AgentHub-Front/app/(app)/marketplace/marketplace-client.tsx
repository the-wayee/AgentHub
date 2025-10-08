"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ToolCard } from "@/components/tool/tool-card"
import { ToolDrawer } from "@/components/tool/tool-drawer"
import { Search, Filter, Package, Sparkles, Users, Grid } from "lucide-react"
import { Tool, UserTool } from "@/lib/types"
import { api } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export default function MarketplaceClient() {
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [tools, setTools] = useState<Tool[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [selectedTool, setSelectedTool] = useState<Tool | UserTool | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const { toast } = useToast()

  const categories = [
    { value: "all", label: "全部分类" },
    { value: "productivity", label: "生产力" },
    { value: "development", label: "开发工具" },
    { value: "communication", label: "通讯工具" },
    { value: "media", label: "多媒体" },
    { value: "utility", label: "实用工具" },
  ]

  const types = [
    { value: "all", label: "全部类型" },
    { value: "official", label: "官方工具" },
    { value: "community", label: "社区工具" },
  ]

  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString())
    const category = params.get('category') || 'all'
    const type = params.get('type') || 'all'
    const query = params.get('search') || ''
    
    setSelectedCategory(category)
    setSelectedType(type)
    setSearchQuery(query)
  }, [searchParams])

  useEffect(() => {
    loadTools()
  }, [selectedCategory, selectedType, searchQuery, currentPage])

  const loadTools = async () => {
    setLoading(true)
    try {
      const result = await api.tools.getMarketTools({
        current: currentPage,
        size: 12,
        toolName: searchQuery || undefined,
      })
      
      if (result.success) {
        setTools(result.data || [])
        setTotalPages(result.pagination?.pages || 1)
      } else {
        toast({
          title: "加载失败",
          description: result.message || "无法加载工具市场数据",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error('Failed to load tools:', error)
      toast({
        title: "加载失败",
        description: "无法加载工具市场，请稍后重试",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setCurrentPage(1)
    loadTools()
  }

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    setCurrentPage(1)
  }

  const handleTypeChange = (type: string) => {
    setSelectedType(type)
    setCurrentPage(1)
  }

  const handleToolAction = () => {
    // 重新加载工具列表
    loadTools()
  }

  const handleCardClick = (tool: Tool | UserTool) => {
    setSelectedTool(tool)
    setDrawerOpen(true)
  }

  return (
    <div className="container mx-auto p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">工具市场</h1>
        <p className="text-gray-600">发现和安装优质的AI工具，提升您的工作效率</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <form onSubmit={handleSearch} className="flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="搜索工具..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button type="submit">搜索</Button>
        </form>

        <div className="flex gap-4">
          <Select value={selectedCategory} onValueChange={handleCategoryChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择分类" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={selectedType} onValueChange={handleTypeChange}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="选择类型" />
            </SelectTrigger>
            <SelectContent>
              {types.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Tools Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {Array.from({ length: 8 }).map((_, index) => (
            <div key={index} className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : tools.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
            {tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                type="market"
                onActionComplete={handleToolAction}
                onCardClick={handleCardClick}
              />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                上一页
              </Button>
              
              <div className="flex gap-1">
                {Array.from({ length: Math.min(5, totalPages) }).map((_, index) => {
                  const page = index + 1
                  return (
                    <Button
                      key={page}
                      variant={currentPage === page ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </Button>
                  )
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
              >
                下一页
              </Button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-12">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-700 mb-2">暂无工具</h3>
          <p className="text-gray-500">尝试调整搜索条件或分类筛选</p>
        </div>
      )}

      {/* Info Cards */}
      <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              <CardTitle className="text-lg">精选工具</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              我们精心挑选了最优质的AI工具，帮助您提升工作效率
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              <CardTitle className="text-lg">社区贡献</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              来自全球开发者的优秀工具，经过严格审核确保质量
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Grid className="w-5 h-5 text-purple-600" />
              <CardTitle className="text-lg">一键安装</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription>
              简单快捷的安装过程，立即开始使用您需要的工具
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      {/* 工具详情抽屉 */}
      <ToolDrawer
        tool={selectedTool}
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        type="market"
        onActionComplete={handleToolAction}
      />
    </div>
  )
}
