"use client"

import { Badge } from "@/components/ui/badge"
import {
  Clock,
  Play,
  CheckCircle,
  XCircle,
} from "lucide-react"
import { Task } from "./types"
import { cn } from "@/lib/utils"

const statusConfig = {
  pending: {
    icon: Clock,
    label: "待执行",
    color: "text-yellow-600",
    bgColor: "bg-yellow-100",
    borderColor: "border-yellow-200",
  },
  loading: {
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
  const config = statusConfig[task.status]
  const Icon = config.icon

  return (
    <div className={cn(
      "flex items-center gap-1.5 py-1 px-2 rounded transition-colors hover:bg-muted/50",
      config.bgColor + "/30"
    )}>
      <Icon className={cn("w-2.5 h-2.5", config.color)} />
      <span className="text-xs font-medium truncate flex-1 leading-none">{task.name}</span>
      <Badge
        variant="outline"
        className={cn(
          "text-[10px] px-1.5 py-0 h-4 border-current/20 leading-none",
          config.bgColor,
          config.color
        )}
      >
        {config.label}
      </Badge>

      {task.status === 'loading' && typeof task.progress === 'number' && (
        <div className="flex items-center gap-0.5 ml-1 min-w-[32px]">
          <div className="w-8 h-1 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-500 transition-all duration-300"
              style={{ width: `${task.progress}%` }}
            />
          </div>
          <span className="text-[10px] text-muted-foreground leading-none">{Math.round(task.progress)}%</span>
        </div>
      )}
    </div>
  )
}

interface TaskProgressProps {
  tasks: Task[]
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  const pendingTasks = tasks.filter((t) => t.status === 'pending')
  const loadingTasks = tasks.filter((t) => t.status === 'loading')
  const completedTasks = tasks.filter((t) => t.status === 'completed')
  const failedTasks = tasks.filter((t) => t.status === 'failed')

  if (tasks.length === 0) {
    return null
  }

  return (
    <div className="w-full bg-background border rounded-lg shadow-sm p-2 space-y-1.5 animate-in slide-in-from-top-2 duration-300">
      {/* 标题和统计信息 */}
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span className="font-medium text-foreground">任务 ({tasks.length})</span>
        <div className="flex items-center gap-2">
          {pendingTasks.length > 0 && (
            <span className="flex items-center gap-0.5">
              <Clock className="w-2 h-2 text-yellow-600" />
              {pendingTasks.length}
            </span>
          )}
          {loadingTasks.length > 0 && (
            <span className="flex items-center gap-0.5">
              <Play className="w-2 h-2 text-blue-600" />
              {loadingTasks.length}
            </span>
          )}
          {completedTasks.length > 0 && (
            <span className="flex items-center gap-0.5">
              <CheckCircle className="w-2 h-2 text-green-600" />
              {completedTasks.length}
            </span>
          )}
          {failedTasks.length > 0 && (
            <span className="flex items-center gap-0.5">
              <XCircle className="w-2 h-2 text-red-600" />
              {failedTasks.length}
            </span>
          )}
        </div>
      </div>

      {/* 任务列表 - 限制高度并滚动 */}
      <div className="max-h-32 overflow-y-auto space-y-0.5 pr-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {tasks
          .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0))
          .map((task, index) => (
            <div
              key={task.id}
              className="animate-in slide-in-from-top-1 duration-300"
              style={{ animationDelay: `${index * 50}ms` }}
            >
              <TaskItem task={task} />
            </div>
          ))}
      </div>
    </div>
  )
}