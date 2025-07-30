export interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  messages: Message[]
  createdAt: Date
  updatedAt: Date
}

export interface Model {
  id: string
  name: string
  provider: string
}

export interface Tool {
  id: string
  name: string
  description: string
}

export interface KnowledgeBase {
  id: string
  name: string
  description: string
}

export interface SessionDTO {
  id: string
  title: string
  description?: string
  createdAt: string
  updatedAt: string
}

export interface MessageDTO {
  id: string
  role: string
  content: string
  createdAt: string
}

export interface CreateSessionRequest {
  title: string
  description?: string
}

export interface SendMessageRequest {
  content: string
  model: string
  tool: string
  knowledgeBase: string
}

export interface StreamResponse {
  content?: string
  done: boolean
}
