export type AgentType = "chat" | "function"

export type Workspace = {
  id: string
  name: string
}

export type ModelConfig = {
  provider: string
  model: string
  temperature?: number
  maxTokens?: number
}

export type Agent = {
  id: string
  name: string
  description?: string
  version: string
  visibility: "public" | "private"
  type?: AgentType
  tags?: string[]
  model?: ModelConfig
  tools?: { webSearch?: boolean; calculator?: boolean; http?: boolean }
  systemPrompt?: string
  welcomeMessage?: string
  enabled?: boolean
  publishStatus?: 1 | 2 | 3 | 4
  publishStatusLabel?: string
  updatedAt?: string
}

// 工具相关类型定义
export interface Tool {
  id: string
  name: string
  icon?: string
  subtitle?: string
  description?: string
  userId: string
  labels?: string[]
  toolType: string
  uploadType: string
  uploadUrl?: string
  installCommand?: any
  toolList?: any[]
  rejectReason?: string
  failedStepStatus?: string
  status: 'pending' | 'approved' | 'rejected' | 'draft'
  isOffice: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
  // 新增字段
  installCount?: number
  author?: {
    name: string
    avatar?: string
  }
  changelog?: string
  versions?: ToolVersionHistory[]
}

export interface ToolVersionHistory {
  version: string
  date: string
  changelog: string
}

export interface UserTool {
  id: string
  userId: string
  name: string
  description?: string
  icon?: string
  subtitle?: string
  toolId: string
  version: string
  currentVersion?: string  // 已安装工具的当前版本
  toolList?: any[]
  labels?: string[]
  isOffice: boolean
  publicState: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}

export interface ToolVersion {
  id: string
  name: string
  icon?: string
  subtitle?: string
  description?: string
  userId: string
  version: string
  toolId: string
  uploadType: string
  changeLog?: string
  uploadUrl?: string
  toolList?: any[]
  labels?: string[]
  isOffice: boolean
  publicStatus: boolean
  createdAt: string
  updatedAt: string
  deletedAt?: string
}
