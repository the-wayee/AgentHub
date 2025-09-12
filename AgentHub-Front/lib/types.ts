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
