"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreVertical, Power, Trash2, Clock } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useEffect, useState } from "react"
import type { Agent } from "@/lib/types"
import { api } from "@/lib/api"

export function MyAgentCard({
  agent,
  onPublish,
  onEdit,
  onDelete,
  onToggle,
}: {
  agent: Agent
  onPublish?: () => void
  onEdit?: () => void
  onDelete?: () => void
  onToggle?: () => void
}) {
  const typeLabel = agent.type === "function" ? "功能" : "聊天"
  const isPublished = agent.publishStatus === 2
  const canPublish = agent.publishStatus == null || agent.publishStatus === 4
  const status = agent.publishStatusLabel ?? "未发布"
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [openVersions, setOpenVersions] = useState(false)
  const [versions, setVersions] = useState<any[]>([])
  const [latest, setLatest] = useState<any | null>(null)
  async function loadVersions() {
    try {
      const result = await api.getAgentVersions(agent.id)
      setVersions(Array.isArray(result) ? result : result?.data ?? [])
    } catch {
      setVersions([])
    }
  }
  async function loadLatest() {
    try {
      const result = await api.getLatestVersion(agent.id)
      setLatest(result?.data ?? result ?? null)
    } catch {
      setLatest(null)
    }
  }
  useEffect(() => {
    loadLatest()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [agent.id])
  return (
    <Card className="h-full flex flex-col">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="truncate flex items-center gap-2">
            {agent.enabled !== undefined && (
              <Badge
                className={
                  agent.enabled
                    ? "rounded-full bg-blue-100 text-blue-700 border-transparent"
                    : "rounded-full bg-muted text-muted-foreground border-transparent"
                }
              >
                {agent.enabled ? "已启用" : "未启用"}
              </Badge>
            )}
            <span className="truncate">{agent.name}</span>
          </span>
          <div className="flex items-center gap-2">
            <Badge variant="outline">{typeLabel}</Badge>
            {latest?.versionNumber && (
              <Badge className="bg-zinc-100 text-zinc-700" title="最新版本">v{latest.versionNumber}</Badge>
            )}
            {status && (
              <Badge className={isPublished ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}>{status}</Badge>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="w-8 h-8 inline-flex items-center justify-center rounded-md hover:bg-muted transition-colors cursor-pointer">
                  <MoreVertical className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer" onClick={onEdit}>编辑</DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={async () => {
                    try {
                      await api.toggleAgentStatus(agent.id)
                    } finally {
                      onToggle?.()
                    }
                  }}
                >
                  <Power className="w-4 h-4 mr-2" />{agent.enabled ? "禁用" : "启用"}
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={() => { setOpenVersions(true); loadVersions() }}>
                  查看版本
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive cursor-pointer" onClick={() => setConfirmOpen(true)}>
                  <Trash2 className="w-4 h-4 mr-2" />删除
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardTitle>
        <div className="text-xs text-muted-foreground truncate">{agent.description}</div>
        {agent.updatedAt && (
          <div className="text-xs text-muted-foreground inline-flex items-center gap-1">
            <Clock className="w-3 h-3" />更新于 {new Date(agent.updatedAt).toLocaleString()}
          </div>
        )}
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground line-clamp-3">
        {agent.tags?.map((t) => (
          <Badge key={t} className="mr-1 mb-1" variant="outline">
            {t}
          </Badge>
        ))}
      </CardContent>
      <CardFooter className="mt-auto flex gap-2">
        <Button variant="secondary" className="flex-1 hover:brightness-95 transition cursor-pointer" onClick={onPublish}>
          发布新版本
        </Button>
        <Button className="flex-1 bg-black text-white hover:bg-black/90 cursor-pointer" onClick={onEdit}>
          编辑
        </Button>
        <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>确认删除</AlertDialogTitle>
              <AlertDialogDescription>此操作不可撤销，确认删除该 Agent 吗？</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>取消</AlertDialogCancel>
              <AlertDialogAction onClick={onDelete}>删除</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardFooter>

      {/* 版本对话框 */}
      <Dialog open={openVersions} onOpenChange={setOpenVersions}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>版本信息</DialogTitle>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            {/* 左侧：当前 Agent 信息 */}
            <div className="space-y-2 text-sm">
              <div className="text-base font-medium flex items-center gap-2">
                {agent.enabled !== undefined && (
                  <Badge className={agent.enabled ? "bg-blue-100 text-blue-700" : "bg-muted text-muted-foreground"}>{agent.enabled ? "已启用" : "未启用"}</Badge>
                )}
                <span className="truncate">{agent.name}</span>
              </div>
              <div className="text-muted-foreground">{agent.description || "无描述"}</div>
              <div className="text-xs text-muted-foreground">当前版本：{latest?.versionNumber ? `v${latest.versionNumber}` : agent.version}</div>
              <div className="text-xs text-muted-foreground">可见性：{agent.visibility === 'public' ? '公开' : '私有'}</div>
              <div className="text-xs text-muted-foreground">模型：{agent.model?.model || '-' }（温度：{agent.model?.temperature ?? '-'}）</div>
            </div>

            {/* 右侧：历史版本列表 */}
            <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
              {versions.map((v, i) => (
                <div key={v.id || i} className="rounded-md border p-3">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">v{v.versionNumber || '-'}</div>
                    <div className="text-xs text-muted-foreground">
                      {v.publishedAt ? new Date(v.publishedAt).toLocaleString() : v.createdAt ? new Date(v.createdAt).toLocaleString() : ''}
                    </div>
                  </div>
                  <div className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {v.changeLog || '无版本日志'}
                  </div>
                </div>
              ))}
              {versions.length === 0 && (
                <div className="text-sm text-muted-foreground">暂无历史版本</div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  )
}


