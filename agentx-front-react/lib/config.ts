export const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api'
} as const

export const API_ENDPOINTS = {
  SESSION: {
    LIST: '/conversation/session',
    MESSAGES: (sessionId: string) => `/conversation/session/${sessionId}/messages`,
    CREATE: '/conversation/session',
    CHAT: (sessionId: string) => `/conversation/chat/${sessionId}`
  }
} as const

// 添加重试和超时配置
export const API_REQUEST_CONFIG = {
  credentials: 'include' as const,
  timeout: 10000, // 10 seconds
  retries: 3,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json'
  }
} as const
