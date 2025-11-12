"use client"

import { useState } from "react"
import { useKbStore } from "@/lib/knowledge"
import { useToast } from "@/hooks/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, Download, Users } from "lucide-react"

type MarketKB = {
  id: string
  name: string
  description: string
  chunkCount: number
  installCount: number
  tags: string[]
}

const seeded: MarketKB[] = [
  { id: "kb-oss-1", name: "开源许可证合集", description: "常见开源协议条款对比与解读。", chunkCount: 190, installCount: 2350, tags: ["法律", "工程"] },
  { id: "kb-ml-101", name: "机器学习 101", description: "经典算法与公式速查。", chunkCount: 520, installCount: 4890, tags: ["AI", "教育"] },
  { id: "kb-web-sec", name: "Web 安全手册", description: "OWASP Top 10 与应对策略。", chunkCount: 260, installCount: 1750, tags: ["安全", "Web"] },
]

export default function KnowledgeMarketPage() {
  const [q, setQ] = useState("")
  const [cat, setCat] = useState("all")
  const [list, setList] = useState(seeded)
  const installKb = useKbStore((s) => s.installKb)
  const { toast } = useToast()

  const filtered = list.filter((x) =>
    (cat === "all" || x.tags.includes(cat)) && (q.trim() ? `${x.name} ${x.description}`.includes(q.trim()) : true),
  )

  return (
    <div className="container mx-auto p-6 space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl font-semibold">知识库市场</h1>
        <p className="text-sm text-muted-foreground">发现、安装与复用他人的高质量知识库。</p>
      </div>

      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-3">
            <div className="relative flex-1">
              <Input placeholder="搜索知识库" value={q} onChange={(e) => setQ(e.target.value)} className="pl-8" />
              <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
            </div>
            <Select value={cat} onValueChange={setCat}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="分类" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">全部</SelectItem>
                <SelectItem value="AI">AI</SelectItem>
                <SelectItem value="教育">教育</SelectItem>
                <SelectItem value="安全">安全</SelectItem>
                <SelectItem value="Web">Web</SelectItem>
                <SelectItem value="法律">法律</SelectItem>
                <SelectItem value="工程">工程</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((kb) => (
          <Card key={kb.id}>
            <CardHeader>
              <CardTitle className="truncate">{kb.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-2 mb-2">{kb.description}</p>
              <div className="flex items-center gap-2 mb-2">
                {kb.tags.map((t) => (
                  <Badge key={t} variant="secondary">{t}</Badge>
                ))}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mb-3">
                <span>片段 {kb.chunkCount}</span>
                <span className="inline-flex items-center gap-1"><Users className="w-3.5 h-3.5" /> {kb.installCount}</span>
              </div>
              <div className="flex items-center gap-2">
                <Button className="flex-1" onClick={() => {
                  const k = installKb({ marketId: kb.id, name: kb.name, description: kb.description })
                  toast({ title: "安装完成", description: `已安装「${k.name}」` })
                }}>
                  <Download className="w-4 h-4 mr-2" /> 安装
                </Button>
                <Button variant="outline" className="flex-1">详情</Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {filtered.length === 0 && (
          <div className="col-span-full text-sm text-muted-foreground">没有匹配的知识库</div>
        )}
      </div>
    </div>
  )
}
