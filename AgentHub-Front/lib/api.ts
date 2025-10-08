// API工具函数，用于在容器环境中直接调用后端API
import { Tool } from './types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

// 401状态码处理函数
function handleUnauthorized() {
  // 清除本地存储的认证信息
  if (typeof window !== 'undefined') {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // 重定向到登录页面，并添加当前页面作为重定向参数
    const currentPath = window.location.pathname + window.location.search;
    const loginUrl = `/login${currentPath !== '/' ? `?redirect=${encodeURIComponent(currentPath)}` : ''}`;
    window.location.href = loginUrl;
  }
}

// 获取认证Token
function getAuthToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('token');
  }
  return null;
}

// 公共的响应处理函数
function handleApiResponse(result: any) {
  // 处理后端返回的数据格式
  // 后端格式: { code: 200, message: "操作成功", data: {...} }
  // 前端期望: { success: boolean, message: string, data: T }
  if (result && typeof result === 'object' && 'code' in result) {
    return {
      success: result.code === 200,
      message: result.message || (result.code === 200 ? '操作成功' : '操作失败'),
      data: result.data
    };
  }

  // 如果已经是前端期望的格式，直接返回
  return result;
}

// 不需要认证的API调用
export async function apiFetchPublic(path: string, options?: RequestInit) {
  const url = `${API_URL}${path}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const result = await res.json();

  // 即使状态码不是200，也尝试解析后端返回的错误信息
  if (!res.ok) {
    // 处理后端错误响应格式，将错误信息转换为前端期望的格式
    const errorResponse = handleApiResponse(result);
    throw new Error(errorResponse.message || `API error: ${res.status}`);
  }

  return handleApiResponse(result);
}

// 需要认证的API调用
export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_URL}${path}`;

  // 添加认证头
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  const result = await res.json();

  // 处理401状态码
  if (res.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('Unauthorized - redirecting to login'));
  }

  // 即使状态码不是200，也尝试解析后端返回的错误信息
  if (!res.ok) {
    // 处理后端错误响应格式，将错误信息转换为前端期望的格式
    const errorResponse = handleApiResponse(result);
    throw new Error(errorResponse.message || `API error: ${res.status}`);
  }

  return handleApiResponse(result);
}

// 专门用于SSE聊天的函数，不走JSON解析
export async function apiFetchSSE(path: string, options?: RequestInit) {
  const url = `${API_URL}${path}`;

  // 添加认证头
  const token = getAuthToken();
  const headers: Record<string, string> = {
    ...(options?.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    ...options,
    headers,
  });

  // 处理401状态码
  if (res.status === 401) {
    handleUnauthorized();
    return Promise.reject(new Error('Unauthorized - redirecting to login'));
  }

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API SSE error: ${res.status} - ${errorText}`);
  }

  return res;
}

// 便捷的API调用函数
export const api = {
  // 获取agents列表
  getAgents: (params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiFetch(`/api/agent/workspace/agents${query}`);
  },
  
  // 获取会话列表
  getSessions: (agentId: string) => {
    return apiFetch(`/api/agent/session/${agentId}`);
  },
  
  // 创建会话
  createSession: (agentId: string) => {
    return apiFetch(`/api/agent/session/${agentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  },
  
  // 创建新会话 (sessions接口)
  createNewSession: (agentId: string) => {
    return apiFetch(`/api/sessions/${agentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  },
  
  // 获取消息列表
  getMessages: (sessionId: string) => {
    return apiFetch(`/api/agent/session/${sessionId}/messages`);
  },
  
  // 聊天接口（SSE）
  chat: (message: string, sessionId: string, enableThink: boolean = false, signal?: AbortSignal) => {
    return apiFetchSSE(`/api/agent/session/chat`, {
      method: "POST",
      headers: { 
        "Content-Type": "application/json", 
        "Accept": "text/event-stream" 
      },
      body: JSON.stringify({ message, sessionId, enableThink }),
      signal,
    });
  },
  
  // 获取已发布的agents
  getPublishedAgents: (params?: URLSearchParams) => {
    const query = params ? `?${params.toString()}` : '';
    return apiFetch(`/api/agent/published${query}`);
  },
  
  // 获取agent详情
  getAgent: (agentId: string) => {
    return apiFetch(`/api/agent/${agentId}`);
  },
  
  // 获取agent版本
  getAgentVersions: (agentId: string) => {
    return apiFetch(`/api/agent/${agentId}/versions`);
  },
  
  // 获取最新版本
  getLatestVersion: (agentId: string) => {
    return apiFetch(`/api/agent/${agentId}/versions/latest`);
  },
  
  // 发布agent
  publishAgent: (agentId: string, versionNumber: string, changeLog: string) => {
    return apiFetch(`/api/agent/${agentId}/publish`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ versionNumber, changeLog }),
    });
  },
  
  // 删除agent
  deleteAgent: (agentId: string) => {
    return apiFetch(`/api/agent/${agentId}`, {
      method: "DELETE",
    });
  },
  
    
  // 获取LLM providers
  getProviders: () => {
    return apiFetch(`/api/llm/providers`);
  },
  
  // 创建LLM provider
  createProvider: (provider: any) => {
    return apiFetch(`/api/llm/providers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(provider),
    });
  },
  
  // 删除LLM provider
  deleteProvider: (providerId: string) => {
    return apiFetch(`/api/llm/providers/${providerId}`, {
      method: "DELETE",
    });
  },
  
  // 切换LLM provider状态
  toggleProviderStatus: (providerId: string) => {
    return apiFetch(`/api/llm/providers/${providerId}/toggle-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
  },

  // 切换模型状态
  toggleModelStatus: (modelId: string) => {
    return apiFetch(`/api/llm/models/${modelId}/toggle-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
  },

  // 切换Agent状态
  toggleAgentStatus: (agentId: string) => {
    return apiFetch(`/api/agent/${agentId}/toggle-status`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
    });
  },
  
  // 获取用户providers
  getUserProviders: () => {
    return apiFetch(`/api/llm/providers/user`);
  },
  
  // 获取provider protocols
  getProviderProtocols: () => {
    return apiFetch(`/api/llm/providers/protocols`);
  },
  
  // 获取provider types
  getProviderTypes: () => {
    return apiFetch(`/api/llm/providers/types`);
  },
  
  // 获取模型列表
  getModels: () => {
    return apiFetch(`/api/llm/models`);
  },
  
  // 获取活跃模型列表
  getActiveModels: () => {
    return apiFetch(`/api/llm/models/active`);
  },
  
  // 根据provider获取模型
  getModelsByProvider: (providerId: string) => {
    return apiFetch(`/api/llm/models/${providerId}`);
  },
  
  // 获取admin providers
  getAdminProviders: () => {
    return apiFetch(`/api/admin/llm/providers`);
  },
  
  // 创建admin provider
  createAdminProvider: (provider: any) => {
    return apiFetch(`/api/admin/llm/providers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(provider),
    });
  },
  
  // 更新admin provider
  updateAdminProvider: (providerId: string, provider: any) => {
    return apiFetch(`/api/admin/llm/providers`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: providerId, ...provider }),
    });
  },
  
  // 删除admin provider
  deleteAdminProvider: (providerId: string) => {
    return apiFetch(`/api/admin/llm/providers/${providerId}`, {
      method: "DELETE",
    });
  },
  
  // 获取admin agent versions
  getAdminAgentVersions: (status?: number) => {
    const params = status !== undefined ? `?status=${status}` : '';
    return apiFetch(`/api/admin/agent/versions${params}`);
  },
  
  // 更新admin agent version状态
  updateAdminAgentVersionStatus: (versionId: string, status: number, reason?: string) => {
    const params = new URLSearchParams({ status: String(status) });
    if (reason && reason.trim()) {
      params.set("reason", reason.trim());
    }
    return apiFetch(`/api/admin/agent/versions/${encodeURIComponent(versionId)}/status?${params.toString()}`, {
      method: "POST",
    });
  },
  
  // 获取agent配置
  getAgentConfig: (agentId: string) => {
    return apiFetch(`/api/agent/workspace/config/${agentId}`);
  },
  
  // 更新agent配置
  updateAgentConfig: (agentId: string, config: any) => {
    return apiFetch(`/api/agent/workspace/config/${agentId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
  },
  
  // 更新agent模型配置
  updateAgentModelConfig: (agentId: string, modelConfig: any) => {
    return apiFetch(`/api/agent/workspace/${agentId}/model/config`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelConfig),
    });
  },
  
  // 删除会话
  deleteSession: (sessionId: string) => {
    return apiFetch(`/api/agent/session/${sessionId}`, {
      method: "DELETE",
    });
  },

  // 工具相关 API
  tools: {
    // 获取用户创建的工具列表
    getUserTools: async () => {
      try {
        const result = await apiFetch('/api/tools/user');
        console.log('获取用户创建的工具成功:', result);
        
        return { 
          success: true, 
          message: '获取成功', 
          data: result.data || [] 
        };
      } catch (error) {
        console.error('获取用户创建的工具失败:', error);
        return { success: false, message: '获取用户创建的工具失败', data: [] };
      }
    },

    // 兼容性方法 - 默认获取用户创建的工具
    getCreatedTools: async () => {
      return api.tools.getUserTools();
    },

    // 获取用户已安装的工具列表
    getInstalledTools: async (params?: {
      current?: number;
      size?: number;
      toolName?: string;
    }) => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.current) queryParams.set('current', params.current.toString());
        if (params?.size) queryParams.set('size', params.size.toString());
        if (params?.toolName) queryParams.set('toolName', params.toolName);

        const query = queryParams.toString();
        const url = `/api/tools/installed${query ? `?${query}` : ''}`;
        
        const result = await apiFetch(url);
        console.log('获取已安装工具成功:', result);
        
        return { 
          success: true, 
          message: '获取成功', 
          data: result.data?.records || [],
          pagination: {
            total: result.data?.total || 0,
            current: result.data?.current || 1,
            size: result.data?.size || 10,
            pages: result.data?.pages || 0
          }
        };
      } catch (error) {
        console.error('获取已安装工具失败:', error);
        return { success: false, message: '获取已安装工具失败', data: [] };
      }
    },

    // 获取工具市场工具列表
    getMarketTools: async (params?: { 
      current?: number;
      size?: number;
      toolName?: string;
    }) => {
      try {
        const queryParams = new URLSearchParams();
        if (params?.current) queryParams.set('current', params.current.toString());
        if (params?.size) queryParams.set('size', params.size.toString());
        if (params?.toolName) queryParams.set('toolName', params.toolName);

        const query = queryParams.toString();
        const url = `/api/tools/market${query ? `?${query}` : ''}`;
        
        const result = await apiFetch(url);
        console.log('获取市场工具成功:', result);
        
        return { 
          success: true, 
          message: '获取成功', 
          data: result.data?.records || [],
          pagination: {
            total: result.data?.total || 0,
            current: result.data?.current || 1,
            size: result.data?.size || 10,
            pages: result.data?.pages || 0
          }
        };
      } catch (error) {
        console.error('获取市场工具失败:', error);
        return { success: false, message: '获取市场工具失败', data: [] };
      }
    },

    // 获取推荐工具列表
    getRecommendTools: async () => {
      try {
        const result = await apiFetch('/api/tools/recommend');
        console.log('获取推荐工具成功:', result);
        
        return { 
          success: true, 
          message: '获取成功', 
          data: result.data || [] 
        };
      } catch (error) {
        console.error('获取推荐工具失败:', error);
        return { success: false, message: '获取推荐工具失败', data: [] };
      }
    },

    // 获取工具详情
    getToolDetail: async (toolId: string) => {
      try {
        const result = await apiFetch(`/api/tools/${toolId}`);
        console.log('获取工具详情成功:', result);

        return {
          success: true,
          message: '获取成功',
          data: result.data
        };
      } catch (error) {
        console.error('获取工具详情失败:', error);
        throw error;
      }
    },

    // 创建工具
    createTool: async (toolData: {
      name: string;
      icon?: string;
      subtitle?: string;
      description?: string;
      labels?: string[];
      toolType?: string;
      uploadType?: string;
      uploadUrl?: string;
      toolList?: any[];
      installCommand?: string;
    }) => {
      try {
        const result = await apiFetch('/api/tools', {
          method: 'POST',
          body: JSON.stringify(toolData)
        });
        
        console.log('创建工具成功:', result);
        
        return {
          success: true,
          message: '工具创建成功',
          data: result.data
        };
      } catch (error) {
        console.error('创建工具失败:', error);
        return {
          success: false,
          message: '创建工具失败',
          data: null
        };
      }
    },

    // 兼容性方法 - 上传工具
    uploadTool: async (toolData: {
      name: string;
      icon?: string;
      subtitle: string;
      description: string;
      labels: string[];
      githubUrl: string;
      installCommand: any;
    }) => {
      return api.tools.createTool({
        name: toolData.name,
        icon: toolData.icon,
        subtitle: toolData.subtitle,
        description: toolData.description,
        labels: toolData.labels,
        uploadType: 'GITHUB',
        uploadUrl: toolData.githubUrl,
        installCommand: toolData.installCommand
      });
    },

    // 更新工具
    updateTool: async (toolId: string, toolData: {
      name?: string;
      icon?: string;
      subtitle?: string;
      description?: string;
      labels?: string[];
      uploadUrl?: string;
      toolList?: any[];
      installCommand?: string;
    }) => {
      try {
        const result = await apiFetch(`/api/tools/${toolId}`, {
          method: 'PUT',
          body: JSON.stringify(toolData)
        });
        
        console.log('更新工具成功:', result);
        
        return {
          success: true,
          message: '工具更新成功',
          data: result.data
        };
      } catch (error) {
        console.error('更新工具失败:', error);
        return {
          success: false,
          message: '更新工具失败',
          data: null
        };
      }
    },

    // 删除工具
    deleteTool: async (toolId: string) => {
      try {
        const result = await apiFetch(`/api/tools/${toolId}`, {
          method: 'DELETE'
        });
        
        console.log('删除工具成功:', result);
        
        return {
          success: true,
          message: '工具删除成功',
          data: null
        };
      } catch (error) {
        console.error('删除工具失败:', error);
        return {
          success: false,
          message: '删除工具失败',
          data: null
        };
      }
    },

    // 上架工具到市场
    marketTool: async (toolId: string, marketData: {
      version: string;
      changeLog?: string;
    }) => {
      try {
        const result = await apiFetch(`/api/tools/${toolId}/market`, {
          method: 'POST',
          body: JSON.stringify(marketData)
        });
        
        console.log('上架工具成功:', result);
        
        return {
          success: true,
          message: result.message || '工具上架成功',
          data: result.data
        };
      } catch (error) {
        console.error('上架工具失败:', error);
        return {
          success: false,
          message: '上架工具失败',
          data: null
        };
      }
    },

    // 安装工具
    installTool: async (toolId: string, version: string = '1.0.0') => {
      try {
        const result = await apiFetch(`/api/tools/install/${toolId}/${version}`);
        return { 
          success: true, 
          message: result.message || '安装成功', 
          data: { toolId, version }
        };
      } catch (error) {
        console.error('安装工具失败:', error);
        return { success: false, message: '安装工具失败', data: null };
      }
    },

    // 卸载工具
    uninstallTool: async (toolId: string) => {
      try {
        const result = await apiFetch(`/api/tools/uninstall/${toolId}`, {
          method: 'DELETE'
        });
        
        console.log('卸载工具成功:', result);
        
        return {
          success: true, 
          message: result.message || '卸载成功', 
          data: { toolId }
        };
      } catch (error) {
        console.error('卸载工具失败:', error);
        return { success: false, message: '卸载工具失败', data: null };
      }
    },

    // 获取工具的所有版本
    getToolVersions: async (toolId: string) => {
      try {
        const result = await apiFetch(`/api/tools/market/${toolId}/versions`);
        console.log('获取工具版本成功:', result);
        
        return { 
          success: true, 
          message: '获取成功', 
          data: result.data || [] 
        };
      } catch (error) {
        console.error('获取工具版本失败:', error);
        return { success: false, message: '获取工具版本失败', data: [] };
      }
    }
  }
};
