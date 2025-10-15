// HTTP客户端，提供拦截器功能
import { handleUnauthorized } from './auth-utils';

export interface RequestConfig extends RequestInit {
  skipAuth?: boolean;
  skipErrorHandler?: boolean;
}

class HttpClient {
  private baseURL: string;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
  }

  // 获取认证Token
  private getAuthToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  }

  // 请求拦截器
  private requestInterceptor(config: RequestConfig): RequestConfig {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(config.headers as Record<string, string> || {}),
    };

    // 添加认证头
    if (!config.skipAuth) {
      const token = this.getAuthToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return {
      ...config,
      headers,
    };
  }

  // 响应拦截器
  private async responseInterceptor<T>(response: Response, config: RequestConfig): Promise<T> {
    // 处理401状态码
    if (response.status === 401 && !config.skipErrorHandler) {
      handleUnauthorized();
      // 返回一个永远不会resolve的Promise，确保后续代码不会执行
      return new Promise(() => {}) as Promise<T>;
    }

    // 处理其他错误状态码
    if (!response.ok && !config.skipErrorHandler) {
      const errorText = await response.text();
      let errorMessage = `API error: ${response.status}`;

      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.message || errorMessage;
      } catch {
        // 如果不是JSON格式，使用原始错误信息
      }

      throw new Error(errorMessage);
    }

    // 解析响应数据
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return response.json();
    } else {
      return response.text() as Promise<T>;
    }
  }

  // 核心请求方法
  private async request<T>(path: string, config: RequestConfig = {}): Promise<T> {
    const url = `${this.baseURL}${path}`;

    // 应用请求拦截器
    const finalConfig = this.requestInterceptor(config);

    const response = await fetch(url, finalConfig);

    // 应用响应拦截器
    return this.responseInterceptor<T>(response, finalConfig);
  }

  // GET请求
  async get<T>(path: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, { ...config, method: 'GET' });
  }

  // POST请求
  async post<T>(path: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT请求
  async put<T>(path: string, data?: any, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, {
      ...config,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE请求
  async delete<T>(path: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(path, { ...config, method: 'DELETE' });
  }

  // SSE请求（不处理JSON响应）
  async sse(path: string, config: RequestConfig = {}): Promise<Response> {
    const url = `${this.baseURL}${path}`;

    const finalConfig = this.requestInterceptor({
      ...config,
      method: 'POST',
      headers: {
        'Accept': 'text/event-stream',
        ...config.headers,
      }
    });

    const response = await fetch(url, finalConfig);

    // 处理401状态码
    if (response.status === 401 && !config.skipErrorHandler) {
      handleUnauthorized();
      return new Promise(() => {}) as Promise<Response>;
    }

    if (!response.ok && !config.skipErrorHandler) {
      const errorText = await response.text();
      throw new Error(`API SSE error: ${response.status} - ${errorText}`);
    }

    return response;
  }
}

// 创建HTTP客户端实例
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
export const httpClient = new HttpClient(API_URL);