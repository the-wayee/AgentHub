"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import type { KBDocument } from "@/lib/knowledge"
import { useState } from "react"

type Props = { open: boolean; onOpenChange: (v: boolean) => void; doc: KBDocument | null }

export function PublishDialog({ open, onOpenChange, doc }: Props) {
  const { toast } = useToast()
  const [visibility, setVisibility] = useState("public")

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onOpenChange(false)
    toast({ title: "已提交发布审核", description: `「${doc?.name}」将进入审核流程` })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>发布知识库</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-3">
          <div>
            <Label htmlFor="title">标题</Label>
            <Input id="title" defaultValue={doc?.name.replace(/\.[^.]+$/, "") || ""} required />
          </div>
          <div>
            <Label htmlFor="desc">描述</Label>
            <Textarea id="desc" placeholder="为你的知识库写个简介…" rows={4} />
          </div>
          <div>
            <Label>可见性</Label>
            <Select value={visibility} onValueChange={setVisibility}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="public">公开（可被安装）</SelectItem>
                <SelectItem value="private">私有（仅自己可见）</SelectItem>
                <SelectItem value="unlisted">隐藏（持有链接可见）</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button type="submit">提交审核</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

