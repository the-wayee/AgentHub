"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Input } from "@/components/ui/input"
import { UploadCloud, RefreshCw, Search, Package, ExternalLink } from "lucide-react"
import { KnowledgePageSkeleton } from "@/components/ui/page-skeleton"
import { UploadDropzone } from "@/components/knowledge/UploadDropzone"
import { useKbStore } from "@/lib/knowledge"
import { StatusBadge } from "@/components/knowledge/StatusBadge"
import { ChunkDrawer } from "@/components/knowledge/ChunkDrawer"
import { PublishDialog } from "@/components/knowledge/PublishDialog"
import { KnowledgeSidebar } from "@/components/knowledge/KnowledgeSidebar"
import { KnowledgeChat } from "@/components/knowledge/KnowledgeChat"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

export default function KnowledgePage() {
  const [loading, setLoading] = useState(true)
  const { kbs, selectedKbId, refreshSimulated } = useKbStore()
  const [drawerDocId, setDrawerDocId] = useState<string | null>(null)
  const [publishDocId, setPublishDocId] = useState<string | null>(null)
  const selectedKb = useMemo(() => kbs.find((k) => k.id === selectedKbId) || null, [kbs, selectedKbId])
  const docs = selectedKb?.docs || []
  const activeDoc = useMemo(() => docs.find((d) => d.id === drawerDocId), [docs, drawerDocId])

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 300)
    return () => clearTimeout(timer)
  }, [])

  if (loading) return <KnowledgePageSkeleton />

  return (
    <div className="mx-auto max-w-6xl p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">知识库</h1>
          <p className="text-muted-foreground text-sm">上传文档、跟踪处理进度、预览拆分片段，并可发布到市场。</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refreshSimulated}>
            <RefreshCw className="w-4 h-4 mr-2" /> 刷新状态
          </Button>
          <Link href="/knowledge/market" prefetch={false}>
            <Button>
              <Package className="w-4 h-4 mr-2" /> 知识库市场
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 lg:col-span-4">
          <KnowledgeSidebar />
        </div>
        <div className="col-span-12 lg:col-span-8">
      <Tabs defaultValue="docs">
        <TabsList>
          <TabsTrigger value="docs">文档</TabsTrigger>
          <TabsTrigger value="chat">对话测试</TabsTrigger>
          <TabsTrigger value="market">市场（精选）</TabsTrigger>
        </TabsList>

        <TabsContent value="docs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5" /> 上传文档
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedKb ? (
                <UploadDropzone />
              ) : (
                <div className="text-sm text-muted-foreground">请先在左侧创建或选择一个知识库。</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-col gap-1">
              <CardTitle>处理队列与历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3 mb-3">
                <div className="relative flex-1">
                  <Input placeholder="搜索文件名、状态、类型…" className="pl-8" />
                  <Search className="w-4 h-4 absolute left-2.5 top-2.5 text-muted-foreground" />
                </div>
              </div>
              <div className="rounded-md border overflow-hidden">
                <div className="overflow-x-auto">
                  <div className="min-w-[760px]">
                    <div className="grid grid-cols-12 bg-muted/40 px-4 py-2 text-sm text-muted-foreground">
                      <div className="col-span-4">文件</div>
                      <div className="col-span-3">状态</div>
                      <div className="col-span-5 text-left pl-4">操作</div>
                    </div>
                    <Separator />
                    <div>
                      {docs.length === 0 && (
                        <div className="p-8 text-center text-sm text-muted-foreground">还没有文档，上传文件开始构建知识库。</div>
                      )}
                      {docs.map((d) => (
                        <div key={d.id} className="px-4 py-4 hover:bg-muted/30 space-y-3">
                          <div className="grid grid-cols-12 items-center gap-3">
                            <div className="col-span-4">
                              <div className="font-medium truncate">{d.name}</div>
                              <div className="text-xs text-muted-foreground">{d.type} · {(d.size / 1024).toFixed(1)} KB</div>
                            </div>
                            <div className="col-span-3 flex items-center gap-2 text-sm pl-2">
                              <StatusBadge status={d.status} />
                            </div>
                            <div className="col-span-5 flex flex-wrap items-center gap-2 justify-start pl-4">
                              <Button size="sm" variant="outline" className="min-w-[96px]" onClick={() => setDrawerDocId(d.id)} disabled={!d.chunkReady}>
                                查看片段
                              </Button>
                              <Button size="sm" variant="outline" className="min-w-[72px]" disabled={d.status !== "completed"} onClick={() => setPublishDocId(d.id)}>
                                发布
                              </Button>
                              <Button size="sm" variant="ghost" className="min-w-[80px]" asChild>
                                <Link href={`/knowledge/detail/${d.id}`} prefetch={false}>
                                  详情 <ExternalLink className="w-3 h-3 ml-1" />
                                </Link>
                              </Button>
                            </div>
                          </div>
                      <div className="flex items-center gap-3">
                        <div className="flex-1 h-2 bg-muted rounded">
                          <div
                            className="h-2 bg-primary rounded"
                            style={{ width: `${d.progress}%`, transition: "width 200ms" }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right">{d.progress}%</span>
                      </div>
                    </div>
                  ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="chat">
          {selectedKb ? <KnowledgeChat /> : <div className="text-sm text-muted-foreground">请先在左侧选择知识库。</div>}
        </TabsContent>

        <TabsContent value="market">
          <Card>
            <CardHeader>
              <CardTitle>知识库精选</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground mb-3">更多请前往「知识库市场」。</div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {sampleMarket.map((kb) => (
                  <div key={kb.id} className="border rounded-lg p-4">
                    <div className="font-medium mb-1 truncate">{kb.name}</div>
                    <div className="text-xs text-muted-foreground mb-2 line-clamp-2">{kb.description}</div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>片段 {kb.chunkCount}</span>
                      <span>安装 {kb.installCount}</span>
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      <InstallFromSample kb={kb} />
                      <Button size="sm" variant="outline" asChild>
                        <Link href={`/knowledge/market`} prefetch={false}>查看市场</Link>
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <ChunkDrawer open={!!activeDoc} onOpenChange={(o) => !o && setDrawerDocId(null)} doc={activeDoc ?? null} />
      <PublishDialog
        open={!!publishDocId}
        onOpenChange={(o) => !o && setPublishDocId(null)}
        doc={docs.find((d) => d.id === publishDocId) ?? null}
      />
        </div>
      </div>
    </div>
  )
}

const sampleMarket = [
  { id: "kb-1", name: "Python 标准库指南", description: "覆盖常用模块与用法示例，便于离线检索。", chunkCount: 420, installCount: 1280 },
  { id: "kb-2", name: "前端工程化手册", description: "从构建到部署的最佳实践合集。", chunkCount: 310, installCount: 980 },
  { id: "kb-3", name: "数据库调优笔记", description: "索引、锁与查询优化的系统整理。", chunkCount: 260, installCount: 640 },
]

function InstallFromSample({ kb }: { kb: { id: string; name: string; description: string } }) {
  const { installKb } = useKbStore()
  const { toast } = useToast()
  return (
    <Button size="sm" onClick={() => {
      const k = installKb({ marketId: kb.id, name: kb.name, description: kb.description })
      toast({ title: "安装完成", description: `已安装「${k.name}」` })
    }}>安装</Button>
  )
}
