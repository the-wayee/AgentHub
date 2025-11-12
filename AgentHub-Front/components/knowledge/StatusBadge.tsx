"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, CloudUpload, Database, Scissors, Eye, XCircle } from "lucide-react"
import type { KBStatus } from "@/lib/knowledge"

export function StatusBadge({ status }: { status: KBStatus }) {
  const { label, variant, Icon } = map(status)
  return (
    <Badge variant={variant as any} className="inline-flex items-center gap-1">
      <Icon className="w-3.5 h-3.5" /> {label}
    </Badge>
  )
}

function map(status: KBStatus) {
  switch (status) {
    case "queued":
      return { label: "排队中", variant: "secondary", Icon: Clock }
    case "uploading":
      return { label: "上传中", variant: "outline", Icon: CloudUpload }
    case "reviewing":
      return { label: "审核中", variant: "secondary", Icon: Eye }
    case "splitting":
      return { label: "拆分中", variant: "secondary", Icon: Scissors }
    case "indexing":
      return { label: "索引中", variant: "secondary", Icon: Database }
    case "completed":
      return { label: "已完成", variant: "default", Icon: CheckCircle2 }
    case "failed":
      return { label: "失败", variant: "destructive", Icon: XCircle }
  }
}

