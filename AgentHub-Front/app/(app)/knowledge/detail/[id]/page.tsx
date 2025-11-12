"use client"

import { useMemo, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useKbStore } from "@/lib/knowledge"
import { StatusBadge } from "@/components/knowledge/StatusBadge"
import { ChunkDrawer } from "@/components/knowledge/ChunkDrawer"

export default function KbDetailPage() {
  const router = useRouter()
  const params = useParams<{ id: string }>()
  const { kbs } = useKbStore()
  const [open, setOpen] = useState(false)
  const doc = useMemo(() => {
    for (const kb of kbs) {
      const found = kb.docs.find((d) => d.id === params.id)
      if (found) return found
    }
    return undefined
  }, [kbs, params.id])

  return (
    <div className="mx-auto max-w-3xl p-6 space-y-6">
      <Button variant="ghost" onClick={() => router.back()}>返回</Button>
      <Card>
        <CardHeader>
          <CardTitle>文档详情</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {!doc && <div className="text-sm text-muted-foreground">未找到文档，可能已删除。</div>}
          {doc && (
            <>
              <div className="flex items-center justify-between">
                <div className="font-medium truncate">{doc.name}</div>
                <StatusBadge status={doc.status} />
              </div>
              <Separator />
              <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
                <div>类型：{doc.type}</div>
                <div>大小：{(doc.size / 1024).toFixed(1)} KB</div>
                <div>进度：{doc.progress}%</div>
                <div>片段：{doc.chunkCount}</div>
              </div>
              <div className="pt-2">
                <Button onClick={() => setOpen(true)} disabled={!doc.chunkReady}>查看拆分片段</Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      <ChunkDrawer open={open} onOpenChange={setOpen} doc={doc ?? null} />
    </div>
  )
}
