"use client"

import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"
import { Copy } from "lucide-react"
import type { KBDocument } from "@/lib/knowledge"
import { useToast } from "@/hooks/use-toast"

type Props = {
  open: boolean
  onOpenChange: (open: boolean) => void
  doc: KBDocument | null
}

export function ChunkDrawer({ open, onOpenChange, doc }: Props) {
  const { toast } = useToast()
  const handleCopy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast({ title: "已复制片段" })
    } catch {
      toast({ title: "复制失败", variant: "destructive" })
    }
  }

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle>
            {doc ? (
              <div className="flex items-center justify-between">
                <div>
                  文档片段 · {doc.name}
                  <div className="text-xs text-muted-foreground font-normal mt-1">共 {doc.chunkCount} 个片段</div>
                </div>
              </div>
            ) : (
              "文档片段"
            )}
          </DrawerTitle>
        </DrawerHeader>
        <Separator />
        <ScrollArea className="px-6 py-4 h-full">
          {!doc && <div className="text-sm text-muted-foreground">未选择文档</div>}
          {doc && doc.chunks.length === 0 && (
            <div className="text-sm text-muted-foreground">正在生成片段，请稍后…</div>
          )}
          {doc && doc.chunks.length > 0 && (
            <div className="grid gap-3">
              {doc.chunks.map((c) => (
                <div key={c.id} className="border rounded-md p-3">
                  <div className="flex items-center justify-between mb-1">
                    <div className="text-xs text-muted-foreground">片段 #{c.index + 1} · 预估 {c.tokens} tokens</div>
                    <Button size="icon" variant="ghost" onClick={() => handleCopy(c.content)}>
                      <Copy className="w-4 h-4" />
                    </Button>
                  </div>
                  <pre className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground max-h-52 overflow-auto">
                    {c.content}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </DrawerContent>
    </Drawer>
  )
}

