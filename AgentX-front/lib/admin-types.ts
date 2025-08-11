export type PublishStatusCode = 1 | 2 | 3 | 4

export const PublishStatusLabel: Record<PublishStatusCode, string> = {
  1: "审核中",
  2: "已发布",
  3: "拒绝",
  4: "已下架",
}

export type AgentVersion = {
  id: string
  agentId: string
  name?: string
  description?: string
  versionNumber?: string
  systemPrompt?: string
  welcomeMessage?: string
  modelConfig?: {
    modelName?: string
    temperature?: number
    maxTokens?: number
    provider?: string
  } | null
  changeLog?: string
  publishStatus?: PublishStatusCode
  rejectReason?: string
  publishedAt?: string
  createdAt?: string
  updatedAt?: string
}


