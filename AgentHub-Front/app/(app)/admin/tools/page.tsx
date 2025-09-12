"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { ToolsPageSkeleton } from "@/components/ui/page-skeleton"
import { Wrench, Code, Globe, Database, Settings, Plus } from "lucide-react"

interface Tool {
  id: string
  name: string
  type: "api" | "function" | "webhook" | "database"
  status: boolean
  official: boolean
  description: string
  usageCount: number
  version: string
  createdBy: string
}

export default function AdminToolsPage() {
  const [tools, setTools] = useState<Tool[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      // 模拟数据加载
      setTools([
        {
          id: "1",
          name: "天气查询",
          type: "api",
          status: true,
          official: true,
          description: "获取实时天气信息和预报",
          usageCount: 1250,
          version: "1.2.0",
          createdBy: "系统"
        },
        {
          id: "2", 
          name: "代码执行器",
          type: "function",
          status: true,
          official: true,
          description: "执行Python/JavaScript代码片段",
          usageCount: 890,
          version: "2.1.0",
          createdBy: "系统"
        },
        {
          id: "3",
          name: "网页抓取",
          type: "webhook",
          status: false,
          official: false,
          description: "抓取指定网页内容并解析",
          usageCount: 234,
          version: "1.0.5",
          createdBy: "张三"
        },
        {
          id: "4",
          name: "数据库查询",
          type: "database",
          status: true,
          official: false,
          description: "查询MySQL/PostgreSQL数据库",
          usageCount: 567,
          version: "1.3.2",
          createdBy: "李四"
        }
      ])
      setLoading(false)
    }, 700)
    
    return () => clearTimeout(timer)
  }, [])

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "api": return Globe
      case "function": return Code
      case "webhook": return Wrench
      case "database": return Database
      default: return Settings
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "api": return "API接口"
      case "function": return "函数工具"
      case "webhook": return "Webhook"
      case "database": return "数据库"
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "api": return "bg-blue-100 text-blue-700"
      case "function": return "bg-green-100 text-green-700"
      case "webhook": return "bg-orange-100 text-orange-700"
      case "database": return "bg-purple-100 text-purple-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  async function toggleToolStatus(id: string, status: boolean) {
    // 模拟API调用
    setTools(prev => prev.map(t => 
      t.id === id ? { ...t, status } : t
    ))
  }

  if (loading) {
    return <ToolsPageSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">工具管理</h1>
          <p className="text-sm text-muted-foreground">管理Agent可用的工具和函数</p>
        </div>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          添加工具
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {tools.map((tool) => {
          const IconComponent = getTypeIcon(tool.type)
          
          return (
            <Card key={tool.id}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <IconComponent className="w-5 h-5" />
                    <span>{tool.name}</span>
                    {tool.official && (
                      <Badge className="bg-blue-100 text-blue-700">官方</Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {tool.status ? "已启用" : "已禁用"}
                    </span>
                    <Switch
                      checked={tool.status}
                      onCheckedChange={(checked) => toggleToolStatus(tool.id, checked)}
                    />
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">{tool.description}</p>
                
                <div className="flex items-center gap-4">
                  <Badge className={getTypeColor(tool.type)}>
                    {getTypeLabel(tool.type)}
                  </Badge>
                  <span className="text-xs text-muted-foreground">v{tool.version}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-muted-foreground">使用次数</span>
                    <div className="font-medium">{tool.usageCount.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-muted-foreground">创建者</span>
                    <div className="font-medium">{tool.createdBy}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 pt-2">
                  <Button size="sm" variant="outline">
                    配置
                  </Button>
                  <Button size="sm" variant="outline">
                    测试
                  </Button>
                  <Button size="sm" variant="outline">
                    日志
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
