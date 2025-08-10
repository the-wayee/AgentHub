"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { SendHorizonal, Settings2 } from "lucide-react"
import type { Agent } from "@/lib/types"

export function AgentPreview({
  agent,
  knowledgeCount,
  toolCount,
}: {
  agent: Agent
  knowledgeCount: number
  toolCount: number
}) {
  return (
    <div className="space-y-4">
      <div className="sticky top-4 space-y-4">
        <Card>
          <CardHeader className="py-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Avatar className="w-6 h-6">
                <AvatarFallback className="text-[10px]">A</AvatarFallback>
              </Avatar>
              <span className="truncate">{agent.name || "新建助理"}</span>
              <Badge variant="secondary" className="ml-auto">
                默认模型
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>{agent.type === "function" ? <FunctionPreview /> : <ChatPreview />}</CardContent>
        </Card>

        <Card>
          <CardHeader className="py-3">
            <CardTitle className="text-base">配置摘要</CardTitle>
          </CardHeader>
          <CardContent className="text-sm grid gap-2">
            <Row label="类型" value={agent.type === "function" ? "功能性助理" : "聊天助理"} />
            <Row label="工具数量" value={String(toolCount)} />
            <Row label="知识库数量" value={String(knowledgeCount)} />
            <Row label="状态" value={agent.visibility === "public" ? "公开" : "私有"} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground">{label}</div>
      <div>{value}</div>
    </div>
  )
}

function ChatPreview() {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2">
        <Avatar className="w-6 h-6">
          <AvatarFallback className="text-[10px]">A</AvatarFallback>
        </Avatar>
        <div className="rounded-2xl bg-muted px-3 py-2 text-sm max-w-[80%]">
          你好！我是你的 AI 助手，有什么可以帮助你的吗？
        </div>
      </div>
      <div className="flex items-end gap-2 justify-end">
        <div className="rounded-2xl bg-primary text-primary-foreground px-3 py-2 text-sm max-w-[80%]">你能做什么？</div>
        <Avatar className="w-6 h-6">
          <AvatarFallback className="text-[10px]">U</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex items-start gap-2">
        <Avatar className="w-6 h-6">
          <AvatarFallback className="text-[10px]">A</AvatarFallback>
        </Avatar>
        <div className="rounded-2xl bg-muted px-3 py-2 text-sm max-w-[80%]">
          我可以帮助你完成以下任务：
          <ul className="list-disc ml-5 mt-1">
            <li>回答问题和提供信息</li>
            <li>协助写作与内容创作</li>
            <li>结合工具与知识库进行检索</li>
          </ul>
          有什么具体问题我可以帮你解答吗？
        </div>
      </div>
      <div className="flex items-center gap-2 border rounded-xl px-3 py-2 text-muted-foreground">
        <span className="text-xs">输入消息…</span>
        <div className="ml-auto opacity-60">
          <SendHorizonal className="w-4 h-4" />
        </div>
      </div>
    </div>
  )
}

function FunctionPreview() {
  return (
    <div className="space-y-3">
      <Card className="border-dashed">
        <CardContent className="py-3 text-sm text-muted-foreground">
          任务描述：请分析上传的销售数据并生成报告。
        </CardContent>
      </Card>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <div className="font-medium">任务执行中</div>
          <Badge variant="secondary">进行中</Badge>
        </div>
        <Step label="分析数据" value={100} />
        <Step label="生成报告" value={60} />
        <Step label="格式化输出" value={20} />
      </div>
      <Card className="border-dashed">
        <CardHeader className="py-3">
          <CardTitle className="text-sm">工具使用记录</CardTitle>
        </CardHeader>
        <CardContent className="text-xs space-y-2">
          <Log label="calculator" desc="计算同比与环比" />
          <Log label="http" desc="拉取指标基准线" />
          <Log label="webSearch" desc="搜索行业报告摘要" />
        </CardContent>
      </Card>
      <button className="w-full h-9 rounded-md border bg-secondary/30 text-sm inline-flex items-center justify-center gap-2">
        <Settings2 className="w-4 h-4" />
        查看结果
      </button>
    </div>
  )
}

function Step({ label, value }: { label: string; value: number }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <div>{label}</div>
        <div>{value}%</div>
      </div>
      <Progress value={value} className="h-2" />
    </div>
  )
}

function Log({ label, desc }: { label: string; desc: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="text-muted-foreground">{label}</div>
      <div>{desc}</div>
    </div>
  )
}
