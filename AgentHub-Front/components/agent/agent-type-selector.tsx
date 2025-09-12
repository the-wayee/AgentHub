"use client"

import { Card } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import { MessageSquare, Puzzle } from "lucide-react"
import type { AgentType } from "@/lib/types"

export function AgentTypeSelector({
  value,
  onChange,
}: {
  value: AgentType
  onChange: (v: AgentType) => void
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <button type="button" onClick={() => onChange("chat")} className="text-left" aria-pressed={value === "chat"}>
        <Card
          className={cn(
            "p-4 h-full transition border-dashed hover:border-foreground/30",
            value === "chat" ? "border-primary ring-2 ring-primary/20" : "",
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-medium">聊天助理</div>
              <div className="text-xs text-muted-foreground">可使用工具和知识库的对话机器人，具有记忆功能</div>
            </div>
          </div>
        </Card>
      </button>

      <button
        type="button"
        onClick={() => onChange("function")}
        className="text-left"
        aria-pressed={value === "function"}
      >
        <Card
          className={cn(
            "p-4 h-full transition border-dashed hover:border-foreground/30",
            value === "function" ? "border-primary ring-2 ring-primary/20" : "",
          )}
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center">
              <Puzzle className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="font-medium">功能性助理</div>
              <div className="text-xs text-muted-foreground">专注于使用工具处理复杂任务的智能助理，无记忆功能</div>
            </div>
          </div>
        </Card>
      </button>
    </div>
  )
}
