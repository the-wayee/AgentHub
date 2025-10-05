// API工具函数，用于在容器环境中直接调用后端API
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

export async function apiFetch(path: string, options?: RequestInit) {
  const url = `${API_URL}${path}`;
  
  const res = await fetch(url, options);
  
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`API error: ${res.status} - ${errorText}`);
  }
  
  return res.json();
}

// 专门用于SSE聊天的函数，不走JSON解析
export async function apiFetchSSE(path: string, options?: RequestInit) {
  const url = `${API_URL}${path}`;
  
  const res = await fetch(url, options);
  
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
};
