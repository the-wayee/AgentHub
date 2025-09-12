/**
 * 获取后端API基础URL
 * 优先使用环境变量，如果没有则使用默认值
 */
export function getApiBaseUrl(): string {
  if (typeof window !== 'undefined') {
    // 客户端环境
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
  }
  // 服务端环境
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080'
}

/**
 * 构建完整的后端API URL
 * @param path API路径，以/开头
 * @returns 完整的API URL
 */
export function buildApiUrl(path: string): string {
  const baseUrl = getApiBaseUrl()
  // 确保path以/开头
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${baseUrl}${normalizedPath}`
}
