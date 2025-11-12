"use client"

import { useMemo, useRef, useState } from "react"
import { useKbStore, KnowledgeBase } from "@/lib/knowledge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Send } from "lucide-react"

type Msg = { id: string; role: "user" | "assistant"; content: string }

export function KnowledgeChat() {
  const kbs = useKbStore((s) => s.kbs)
  const selectedKbId = useKbStore((s) => s.selectedKbId)
  const kb = useMemo(() => kbs.find((x) => x.id === selectedKbId), [kbs, selectedKbId])
  const [messages, setMessages] = useState<Msg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const endRef = useRef<HTMLDivElement | null>(null)

  const onSend = async () => {
    const q = input.trim()
    if (!q || !kb) return
    setInput("")
    const id = `${Date.now()}`
    setMessages((m) => [...m, { id: id + "u", role: "user", content: q }])
    setLoading(true)
    // naive retrieval over local chunks
    const reply = await mockRagAnswer(kb, q)
    setMessages((m) => [...m, { id, role: "assistant", content: reply }])
    setLoading(false)
    endRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  return (
    <Card className="h-[520px] flex flex-col">
      <CardHeader>
        <CardTitle>对话测试</CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col min-h-0">
        {!kb && <div className="text-sm text-muted-foreground">请选择左侧知识库后开始测试。</div>}
        {kb && (
          <>
            <ScrollArea className="flex-1 pr-2">
              <div className="space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[85%] rounded-md px-3 py-2 text-sm ${m.role === 'user' ? 'bg-primary/10 ml-auto' : 'bg-muted'}`}>
                    <pre className="whitespace-pre-wrap leading-relaxed">{m.content}</pre>
                  </div>
                ))}
                <div ref={endRef} />
              </div>
            </ScrollArea>
            <div className="mt-3 flex items-end gap-2">
              <Textarea value={input} onChange={(e) => setInput(e.target.value)} placeholder="在当前知识库中提问，测试理解效果…" rows={3} className="flex-1" />
              <Button onClick={onSend} disabled={!input.trim() || !kb || loading}>
                <Send className="w-4 h-4 mr-2" /> 发送
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )
}

async function mockRagAnswer(kb: KnowledgeBase, q: string): Promise<string> {
  // simple lexical scoring across chunks
  const terms = q.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  type Scored = { score: number; content: string }
  const pool: Scored[] = []
  for (const d of kb.docs) {
    for (const c of d.chunks) {
      const lc = c.content.toLowerCase()
      let s = 0
      for (const t of terms) {
        if (!t) continue
        const count = occurrences(lc, t)
        s += count * (t.length > 4 ? 2 : 1)
      }
      if (s > 0) pool.push({ score: s, content: c.content })
    }
  }
  pool.sort((a, b) => b.score - a.score)
  const top = pool.slice(0, 3)
  const answer = top.length
    ? `基于检索到的片段，给出简要回答：\n\n${summarize(top.map((x) => x.content).join("\n\n"), q)}\n\n参考片段：\n- ${top.map((x) => preview(x.content)).join("\n- ")}`
    : `没有在当前知识库中检索到相关内容。请尝试换个表述或添加更多文档。`
  // simulate latency
  await new Promise((r) => setTimeout(r, 400))
  return answer
}

function occurrences(text: string, term: string) {
  let i = 0, c = 0
  while ((i = text.indexOf(term, i)) !== -1) { c++; i += term.length }
  return c
}

function preview(s: string) {
  return s.replace(/\s+/g, " ").slice(0, 72) + (s.length > 72 ? "…" : "")
}

function summarize(context: string, q: string) {
  // naive extractive summary
  const lines = context.split(/\n+/).filter(Boolean)
  const rel = lines
    .map((ln) => ({ ln, score: scoreLine(ln, q) }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4)
    .map((x) => "• " + x.ln)
    .join("\n")
  return rel || context.slice(0, 200)
}

function scoreLine(ln: string, q: string) {
  const qTerms = q.toLowerCase().split(/[^\p{L}\p{N}]+/u).filter(Boolean)
  const l = ln.toLowerCase()
  return qTerms.reduce((acc, t) => acc + occurrences(l, t), 0)
}
