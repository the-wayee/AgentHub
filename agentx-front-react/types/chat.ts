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
