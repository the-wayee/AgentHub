export interface Message {
  id: string
  role: 'user' | 'assistant' | 'system'
  content: string
  createdAt: Date
  messageType?: MessageType
  taskId?: string
  taskName?: string
}

export enum MessageType {
  TEXT = 'TEXT',
  TOOL_CALL = 'TOOL_CALL',
  TASK_EXEC = 'TASK_EXEC',
  TASK_STATUS_TO_LOADING = 'TASK_STATUS_TO_LOADING',
  TASK_STATUS_TO_FINISH = 'TASK_STATUS_TO_FINISH',
  TASK_SPLIT = 'TASK_SPLIT',
  TASK_SPLIT_FINISH = 'TASK_SPLIT_FINISH'
}

export interface Task {
  id: string
  name: string
  status: 'pending' | 'loading' | 'completed' | 'failed'
  content?: string
  progress?: number
  error?: string
  result?: string
  createdAt?: Date
  updatedAt?: Date
}
