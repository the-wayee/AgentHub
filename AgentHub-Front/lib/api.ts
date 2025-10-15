// API工具函数，用于在容器环境中直接调用后端API
import { Tool } from './types';
import { httpClient } from './http-client';

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
  try {
    const { method = 'GET', body, ...restOptions } = options || {};

    let result;
    switch (method.toUpperCase()) {
      case 'POST':
        result = await httpClient.post(path, body ? JSON.parse(body) : undefined, {
          ...restOptions,
          skipAuth: true
        });
        break;
      case 'PUT':
        result = await httpClient.put(path, body ? JSON.parse(body) : undefined, {
          ...restOptions,
          skipAuth: true
        });
        break;
      case 'DELETE':
        result = await httpClient.delete(path, { ...restOptions, skipAuth: true });
        break;
      default:
        result = await httpClient.get(path, { ...restOptions, skipAuth: true });
    }

    return handleApiResponse(result);
  } catch (error) {
    // 错误已经在http-client中处理
    throw error;
  }
}

// 需要认证的API调用
export async function apiFetch(path: string, options?: RequestInit) {
  try {
    const { method = 'GET', body, ...restOptions } = options || {};

    let result;
    switch (method.toUpperCase()) {
      case 'POST':
        result = await httpClient.post(path, body ? JSON.parse(body) : undefined, restOptions);
        break;
      case 'PUT':
        result = await httpClient.put(path, body ? JSON.parse(body) : undefined, restOptions);
        break;
      case 'DELETE':
        result = await httpClient.delete(path, restOptions);
        break;
      default:
        result = await httpClient.get(path, restOptions);
    }

    return handleApiResponse(result);
  } catch (error) {
    // 错误已经在http-client中处理
    throw error;
  }
}

// 专门用于SSE聊天的函数，不走JSON解析
export async function apiFetchSSE(path: string, options?: RequestInit) {
  try {
    return await httpClient.sse(path, {
      ...options,
      skipAuth: false,
      skipErrorHandler: false
    });
  } catch (error) {
    // 错误已经在http-client中处理
    throw error;
  }
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
    return httpClient.post(`/api/agent/session/${agentId}`);
  },
  
  // 创建新会话 (sessions接口)
  createNewSession: (agentId: string) => {
    return apiFetch(`/api/sessions/${agentId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    });
  },

  // 创建Agent
  createAgent: (payload: any) => {
    return apiFetch(`/api/agent`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },

  // 更新Agent
  updateAgent: (agentId: string, payload: any) => {
    return apiFetch(`/api/agent/${encodeURIComponent(agentId)}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  },
  
  // 获取消息列表
  getMessages: (sessionId: string) => {
    return apiFetch(`/api/agent/session/${sessionId}/messages`);
  },
  
  // 聊天接口（SSE）
  chat: (message: string, sessionId: string, enableThink: boolean = false, signal?: AbortSignal) => {
    return apiFetchSSE(`/api/agent/session/chat`, {
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
  
  // 获取模型类型
  getModelTypes: () => {
    return apiFetch(`/api/llm/models/types`);
  },

  // 创建模型
  createModel: (modelData: any) => {
    return apiFetch(`/api/llm/models`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(modelData),
    });
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

  // 更新会话标题
  updateSessionTitle: (sessionId: string, title: string) => {
    return apiFetch(`/api/session/${sessionId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title }),
    });
  },

  // 管理员模型相关 API
  adminModels: {
    // 获取管理员模型列表
    getModelsByProvider: (providerId: string) => {
      return apiFetch(`/api/admin/llm/models/${providerId}`, { cache: "no-store" });
    },

    // 创建管理员模型
    createModel: (payload: any) => {
      return apiFetch('/api/admin/llm/models', {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },

    // 更新管理员模型
    updateModel: (payload: any) => {
      return apiFetch('/api/admin/llm/models', {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
    },

    // 删除管理员模型
    deleteModel: (modelId: string) => {
      return apiFetch(`/api/admin/llm/models/delete/${modelId}`, {
        method: "DELETE",
      });
    },
  },

  // 工具相关 API
  tools: {
    // 获取用户创建的工具列表
    getUserTools: async () => {
      try {
        const result = await apiFetch('/api/tools/user');

        return {
          success: true,
          message: '获取成功',
          data: result.data || []
        };
      } catch (error) {
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
        return { success: false, message: '获取市场工具失败', data: [] };
      }
    },

    // 获取推荐工具列表
    getRecommendTools: async () => {
      try {
        const result = await apiFetch('/api/tools/recommend');
        
        return { 
          success: true, 
          message: '获取成功', 
          data: result.data || [] 
        };
      } catch (error) {
        return { success: false, message: '获取推荐工具失败', data: [] };
      }
    },

    // 获取工具详情
    getToolDetail: async (toolId: string) => {
      try {
        const result = await apiFetch(`/api/tools/${toolId}`);

        return {
          success: true,
          message: '获取成功',
          data: result.data
        };
      } catch (error) {
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
        
        
        return {
          success: true,
          message: '工具创建成功',
          data: result.data
        };
      } catch (error) {
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
        
        
        return {
          success: true,
          message: '工具更新成功',
          data: result.data
        };
      } catch (error) {
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
        
        
        return {
          success: true,
          message: '工具删除成功',
          data: null
        };
      } catch (error) {
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
        
        
        return {
          success: true,
          message: result.message || '工具上架成功',
          data: result.data
        };
      } catch (error) {
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
        return { success: false, message: '安装工具失败', data: null };
      }
    },

    // 卸载工具
    uninstallTool: async (toolId: string) => {
      try {
        const result = await apiFetch(`/api/tools/uninstall/${toolId}`, {
          method: 'DELETE'
        });
        
        
        return {
          success: true, 
          message: result.message || '卸载成功', 
          data: { toolId }
        };
      } catch (error) {
        return { success: false, message: '卸载工具失败', data: null };
      }
    },

    // 获取工具的所有版本
    getToolVersions: async (toolId: string) => {
      try {
        const result = await apiFetch(`/api/tools/market/${toolId}/versions`);
        
        return { 
          success: true, 
          message: '获取成功', 
          data: result.data || [] 
        };
      } catch (error) {
        return { success: false, message: '获取工具版本失败', data: [] };
      }
    }
  }
};
