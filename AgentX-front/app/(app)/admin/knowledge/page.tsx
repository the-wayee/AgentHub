"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { KnowledgePageSkeleton } from "@/components/ui/page-skeleton"
import { Database, FileText, Users, Trash2, Download } from "lucide-react"

interface KnowledgeItem {
  id: string
  name: string
  type: "document" | "qa" | "api"
  size: string
  owner: string
  shared: boolean
  createdAt: string
  usageCount: number
}

export default function AdminKnowledgePage() {
  const [knowledge, setKnowledge] = useState<KnowledgeItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      // 模拟数据加载
      setKnowledge([
        {
          id: "1",
          name: "产品文档库",
          type: "document",
          size: "15.2 MB",
          owner: "张三",
          shared: true,
          createdAt: "2024-01-15",
          usageCount: 128
        },
        {
          id: "2", 
          name: "客服FAQ",
          type: "qa",
          size: "2.8 MB",
          owner: "李四",
          shared: true,
          createdAt: "2024-01-20",
          usageCount: 89
        },
        {
          id: "3",
          name: "API接口文档",
          type: "api",
          size: "5.1 MB",
          owner: "王五",
          shared: false,
          createdAt: "2024-01-25",
          usageCount: 45
        }
      ])
      setLoading(false)
    }, 600)
    
    return () => clearTimeout(timer)
  }, [])

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "document": return "文档"
      case "qa": return "问答"
      case "api": return "接口"
      default: return type
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "document": return "bg-blue-100 text-blue-700"
      case "qa": return "bg-green-100 text-green-700"
      case "api": return "bg-purple-100 text-purple-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return <KnowledgePageSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">知识库管理</h1>
          <p className="text-sm text-muted-foreground">管理用户上传的知识库内容</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline">
            <Download className="w-4 h-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {knowledge.map((item) => (
          <Card key={item.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Database className="w-5 h-5" />
                  <span>{item.name}</span>
                  <Badge className={getTypeColor(item.type)}>
                    {getTypeLabel(item.type)}
                  </Badge>
                  {item.shared && (
                    <Badge variant="outline">
                      <Users className="w-3 h-3 mr-1" />
                      共享
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline">
                    <FileText className="w-4 h-4 mr-1" />
                    查看
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="w-4 h-4 mr-1" />
                    下载
                  </Button>
                  <Button size="sm" variant="destructive">
                    <Trash2 className="w-4 h-4 mr-1" />
                    删除
                  </Button>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">文件大小</span>
                  <div className="font-medium">{item.size}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">创建者</span>
                  <div className="font-medium">{item.owner}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">创建时间</span>
                  <div className="font-medium">{item.createdAt}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">使用次数</span>
                  <div className="font-medium">{item.usageCount}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
