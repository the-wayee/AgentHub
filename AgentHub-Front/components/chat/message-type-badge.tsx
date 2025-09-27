"use client"

import { Badge } from "@/components/ui/badge"
import { MessageType } from "./types"

interface MessageTypeBadgeProps {
  messageType: MessageType
}

export function MessageTypeBadge({ messageType }: MessageTypeBadgeProps) {
  const getMessageTypeText = (type: MessageType) => {
    switch (type) {
      case MessageType.TEXT:
        return '文本消息'
      case MessageType.TOOL_CALL:
        return '工具调用'
      case MessageType.TASK_EXEC:
        return '任务执行'
      case MessageType.TASK_STATUS_TO_LOADING:
        return '任务进行中'
      case MessageType.TASK_STATUS_TO_FINISH:
        return '任务完成'
      case MessageType.TASK_SPLIT:
        return '任务拆分'
      case MessageType.TASK_SPLIT_FINISH:
        return '任务拆分完成'
      default:
        return '未知类型'
    }
  }

  const getMessageTypeVariant = (type: MessageType) => {
    switch (type) {
      case MessageType.TEXT:
        return 'default'
      case MessageType.TOOL_CALL:
        return 'secondary'
      case MessageType.TASK_EXEC:
        return 'default'
      case MessageType.TASK_STATUS_TO_LOADING:
        return 'secondary'
      case MessageType.TASK_STATUS_TO_FINISH:
        return 'default'
      case MessageType.TASK_SPLIT:
        return 'secondary'
      case MessageType.TASK_SPLIT_FINISH:
        return 'outline'
      default:
        return 'outline'
    }
  }

  const getMessageTypeColor = (type: MessageType) => {
    switch (type) {
      case MessageType.TEXT:
        return 'bg-blue-100 text-blue-800'
      case MessageType.TOOL_CALL:
        return 'bg-purple-100 text-purple-800'
      case MessageType.TASK_EXEC:
        return 'bg-green-100 text-green-800'
      case MessageType.TASK_STATUS_TO_LOADING:
        return 'bg-yellow-100 text-yellow-800'
      case MessageType.TASK_STATUS_TO_FINISH:
        return 'bg-green-100 text-green-800'
      case MessageType.TASK_SPLIT:
        return 'bg-orange-100 text-orange-800'
      case MessageType.TASK_SPLIT_FINISH:
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Badge
      variant={getMessageTypeVariant(messageType)}
      className={`text-xs px-2 py-1 ${getMessageTypeColor(messageType)}`}
    >
      {getMessageTypeText(messageType)}
    </Badge>
  )
}