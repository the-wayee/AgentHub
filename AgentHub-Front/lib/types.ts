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

// 工具相关类型定义（基于后端DTO）

// 工具定义配置
export interface ToolDefinition {
  [key: string]: any
}

// 工具状态枚举
export type ToolStatus = 'DRAFT' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'PUBLISHED'

// 工具类型枚举
export type ToolType = 'FUNCTION' | 'PLUGIN' | 'CUSTOM'

// 上传类型枚举
export type UploadType = 'GITHUB' | 'FILE' | 'CODE'

// ToolDTO - 用户创建的工具
export interface Tool {
  id: string
  name: string
  icon?: string
  subtitle?: string
  description?: string
  userId: string
  userName?: string // 作者名称
  labels?: string[]
  toolType?: ToolType
  uploadType?: UploadType
  uploadUrl?: string
  toolList?: ToolDefinition[]
  status?: ToolStatus
  office?: boolean // 匹配后端返回的字段名
  installCount?: number // 安装数量
  version?: string // 版本号
  currentVersion?: string // 当前版本号
  installCommand?: string
  createdAt?: string
  updatedAt?: string
  rejectReason?: string
  failedStepStatus?: ToolStatus
}

// ToolVersionDTO - 工具版本（用于市场和已安装工具）
export interface ToolVersion {
  id: string
  name: string
  icon?: string
  subtitle?: string
  description?: string
  userId: string
  version: string
  toolId: string
  uploadType?: string
  uploadUrl?: string
  toolList?: ToolDefinition[]
  labels?: string[]
  office?: boolean // 匹配后端返回的字段名
  publicStatus?: boolean
  changeLog?: string
  createdAt?: string
  updatedAt?: string
  userName?: string
  versions?: ToolVersion[]
  installCount?: number // 安装次数
}

// 用户已安装的工具（基于ToolVersionDTO）
export interface UserTool extends ToolVersion {
  // 继承ToolVersion的所有属性
}

// 分页结果
export interface PageResult<T> {
  records: T[]
  total: number
  size: number
  current: number
  pages: number
}

// API查询参数
export interface QueryToolsRequest {
  current?: number
  size?: number
  toolName?: string
}

// 创建工具请求
export interface CreateToolRequest {
  name: string
  icon?: string
  subtitle?: string
  description?: string
  labels?: string[]
  toolType?: ToolType
  uploadType?: UploadType
  uploadUrl?: string
  toolList?: ToolDefinition[]
  installCommand?: string
}

// 更新工具请求
export interface UpdateToolRequest {
  name?: string
  icon?: string
  subtitle?: string
  description?: string
  labels?: string[]
  uploadUrl?: string
  toolList?: ToolDefinition[]
  installCommand?: string
}

// 上架工具请求
export interface MarketToolRequest {
  version: string
  changeLog?: string
}
