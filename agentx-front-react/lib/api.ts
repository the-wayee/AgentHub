import { API_CONFIG, API_REQUEST_CONFIG } from './config'

interface APIError extends Error {
  status?: number;
  data?: any;
}

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries: number = API_REQUEST_CONFIG.retries
): Promise<Response> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_REQUEST_CONFIG.timeout);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      const error = new Error(`HTTP error! status: ${response.status}`) as APIError;
      error.status = response.status;
      try {
        error.data = await response.json();
      } catch {
        error.data = await response.text();
      }
      throw error;
    }
    
    return response;
  } catch (error) {
    if (retries > 0 && error instanceof Error && error.name !== 'AbortError') {
      console.log(`请求失败，剩余重试次数: ${retries - 1}`);
      await delay(1000); // 等待1秒后重试
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

export async function apiClient<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = new URL(endpoint, API_CONFIG.BASE_URL);
  
  const fetchOptions: RequestInit = {
    ...API_REQUEST_CONFIG,
    ...options,
    headers: {
      ...API_REQUEST_CONFIG.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetchWithRetry(url.toString(), fetchOptions);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('API 请求失败:', error);
    // 在这里可以添加全局错误处理，比如显示通知
    throw error;
  }
}
