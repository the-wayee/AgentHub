"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  AlertTriangle,
} from "lucide-react"
import { useTaskStore } from "@/lib/stores"
import type { Task } from "@/lib/types"
import { cn } from "@/lib/utils"

const statusConfig = {
  pending: {
    icon: Clock,
    label: "等待中",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
  },
  running: {
    icon: Play,
    label: "执行中",
    color: "text-blue-600",
    bgColor: "bg-blue-100",
    borderColor: "border-blue-200",
  },
  completed: {
    icon: CheckCircle,
    label: "已完成",
    color: "text-green-600",
    bgColor: "bg-green-100",
    borderColor: "border-green-200",
  },
  failed: {
    icon: XCircle,
    label: "失败",
    color: "text-red-600",
    bgColor: "bg-red-100",
    borderColor: "border-red-200",
  },
}

interface TaskItemProps {
  task: Task
}

function TaskItem({ task }: TaskItemProps) {
  const { updateTask, removeTask } = useTaskStore()
  const [expanded, setExpanded] = useState(false)

  const config = statusConfig[task.status]
  const Icon = config.icon

  const handleRetry = () => {
    updateTask(task.id, { status: "pending", error: undefined, progress: undefined })
  }

  return (
    <div className={cn("border rounded-lg p-3 transition-all", config.borderColor, config.bgColor + "/20")}>
      <div className="flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Icon className={cn("w-4 h-4", config.color)} />
            <span className="font-medium text-sm">{task.title}</span>
            <Badge className={cn("text-xs", config.bgColor, config.color)}>{config.label}</Badge>
          </div>

          {task.description && <p className="text-xs text-muted-foreground pl-6">{task.description}</p>}

          {task.status === "running" && typeof task.progress === "number" && (
            <div className="pl-6 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">进度</span>
                <span className="font-medium">{Math.round(task.progress)}%</span>
              </div>
              <Progress value={task.progress} className="h-1.5" />
            </div>
          )}

          {expanded && (
            <div className="pl-6 space-y-2 text-xs">
              <div className="text-muted-foreground">
                <div>创建: {new Date(task.createdAt).toLocaleString()}</div>
                <div>更新: {new Date(task.updatedAt).toLocaleString()}</div>
              </div>

              {task.error && (
                <div className="p-2 bg-red-50 border border-red-200 rounded text-red-700">
                  <div className="flex items-center gap-1 font-medium">
                    <AlertTriangle className="w-3 h-3" />
                    错误信息:
                  </div>
                  <div className="mt-1">{task.error}</div>
                </div>
              )}

              {task.result && task.status === "completed" && (
                <div className="p-2 bg-green-50 border border-green-200 rounded">
                  <div className="font-medium text-green-700">执行结果:</div>
                  <pre className="mt-1 whitespace-pre-wrap text-green-600 text-xs">
                    {typeof task.result === "string" ? task.result : JSON.stringify(task.result, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 ml-2">
          {task.status === "failed" && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleRetry}
              className="w-6 h-6 text-blue-600 hover:text-blue-700"
              title="重试"
            >
              <RotateCcw className="w-3 h-3" />
            </Button>
          )}
          <Button
            size="icon"
            variant="ghost"
            onClick={() => removeTask(task.id)}
            className="w-6 h-6 text-red-600 hover:text-red-700"
            title="删除"
          >
            <Trash2 className="w-3 h-3" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            onClick={() => setExpanded(!expanded)}
            className="w-6 h-6"
            title={expanded ? "收起" : "展开"}
          >
            {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
          </Button>
        </div>
      </div>
    </div>
  )
}

interface TaskListProps {
  conversationId?: string
  className?: string
}

export function TaskList({ conversationId, className }: TaskListProps) {
  const { tasks, clearCompleted } = useTaskStore()
  const [collapsed, setCollapsed] = useState(false)

  const filteredTasks = useMemo(() => {
    if (!conversationId) return tasks
    return tasks.filter((task) => task.conversationId === conversationId)
  }, [tasks, conversationId])

  const pendingTasks = filteredTasks.filter((t) => t.status === "pending")
  const runningTasks = filteredTasks.filter((t) => t.status === "running")
  const completedTasks = filteredTasks.filter((t) => t.status === "completed")
  const failedTasks = filteredTasks.filter((t) => t.status === "failed")

  if (filteredTasks.length === 0) {
    return null
  }

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <span>任务列表</span>
            <Badge variant="secondary" className="text-xs">
              {filteredTasks.length}
            </Badge>
          </CardTitle>
          <div className="flex items-center gap-2">
            {completedTasks.length > 0 && (
              <Button size="sm" variant="outline" onClick={clearCompleted} className="text-xs h-7 bg-transparent">
                <Trash2 className="w-3 h-3 mr-1" />
                清除已完成
              </Button>
            )}
            <Button size="icon" variant="ghost" onClick={() => setCollapsed(!collapsed)} className="w-7 h-7">
              {collapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {!collapsed && (
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {pendingTasks.length > 0 && (
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3 text-yellow-600" />
                等待 {pendingTasks.length}
              </span>
            )}
            {runningTasks.length > 0 && (
              <span className="flex items-center gap-1">
                <Play className="w-3 h-3 text-blue-600" />
                执行 {runningTasks.length}
              </span>
            )}
            {completedTasks.length > 0 && (
              <span className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-green-600" />
                完成 {completedTasks.length}
              </span>
            )}
            {failedTasks.length > 0 && (
              <span className="flex items-center gap-1">
                <XCircle className="w-3 h-3 text-red-600" />
                失败 {failedTasks.length}
              </span>
            )}
          </div>
        )}
      </CardHeader>

      {!collapsed && (
        <CardContent className="pt-0">
          <ScrollArea className="max-h-80">
            <div className="space-y-3">
              {filteredTasks
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((task) => (
                  <TaskItem key={task.id} task={task} />
                ))}
            </div>
          </ScrollArea>
        </CardContent>
      )}
    </Card>
  )
}
