"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"
import { Task } from "./types"

interface TaskProgressProps {
  tasks: Task[]
}

export function TaskProgress({ tasks }: TaskProgressProps) {
  const getStatusIcon = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'loading':
        return <Clock className="w-4 h-4 text-blue-500 animate-pulse" />
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-500" />
      default:
        return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusText = (status: Task['status']) => {
    switch (status) {
      case 'completed':
        return '已完成'
      case 'loading':
        return '执行中'
      case 'failed':
        return '失败'
      default:
        return '待执行'
    }
  }

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700 mb-3">任务进度</div>
      {tasks.length === 0 ? (
        <div className="text-sm text-gray-500 italic">暂无任务</div>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-white rounded-lg border">
              {getStatusIcon(task.status)}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-gray-900 truncate">
                  {task.name}
                </div>
                {task.content && (
                  <div className="text-xs text-gray-500 truncate mt-1">
                    {task.content}
                  </div>
                )}
              </div>
              <Badge variant={
                task.status === 'completed' ? 'default' :
                task.status === 'loading' ? 'secondary' :
                task.status === 'failed' ? 'destructive' : 'outline'
              } className="text-xs">
                {getStatusText(task.status)}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}