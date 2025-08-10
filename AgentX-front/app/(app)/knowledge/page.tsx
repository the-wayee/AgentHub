"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useKnowledgeStore } from "@/lib/stores"
import { Trash2, Upload } from "lucide-react"

export default function KnowledgePage() {
  const { items, addItem, removeItem } = useKnowledgeStore()
  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">知识库</h1>
        <p className="text-muted-foreground text-sm">维护你的私有知识。支持文本片段与文件内容。</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>新增条目</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <form
            className="grid gap-3"
            onSubmit={(e) => {
              e.preventDefault()
              const fd = new FormData(e.currentTarget as HTMLFormElement)
              const title = String(fd.get("title") || "")
              const content = String(fd.get("content") || "")
              if (!title || !content) return
              addItem({ title, content })
              ;(e.currentTarget as HTMLFormElement).reset()
            }}
          >
            <Input name="title" placeholder="条目标题" />
            <Textarea name="content" placeholder="内容…" rows={6} />
            <div className="flex items-center gap-2">
              <label className="inline-flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
                <Upload className="w-4 h-4" />
                <input
                  type="file"
                  className="hidden"
                  accept=".txt,.md"
                  onChange={async (e) => {
                    const file = e.target.files?.[0]
                    if (!file) return
                    const text = await file.text()
                    addItem({ title: file.name, content: text })
                    e.currentTarget.value = ""
                  }}
                />
                上传 .txt/.md
              </label>
              <Button type="submit" className="ml-auto">
                保存
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2">
        {items.map((k) => (
          <Card key={k.id}>
            <CardHeader className="flex-row items-center justify-between">
              <CardTitle className="truncate">{k.title}</CardTitle>
              <Button size="icon" variant="ghost" onClick={() => removeItem(k.id)}>
                <Trash2 className="w-4 h-4" />
                <span className="sr-only">删除</span>
              </Button>
            </CardHeader>
            <CardContent>
              <pre className="text-sm whitespace-pre-wrap leading-relaxed text-muted-foreground">{k.content}</pre>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && <div className="text-sm text-muted-foreground">暂无条目，先创建一个或上传文件吧。</div>}
      </div>
    </div>
  )
}
