import type { Agent, Workspace } from "./types"

export function seedWorkspaces(): Workspace[] {
  return [
    { id: "personal", name: "个人工作区" },
    { id: "team", name: "团队工作区" },
  ]
}

export function seedAgents(): Agent[] {
  return [
    {
      id: "demo",
      workspaceId: "personal",
      name: "Alpha 助手",
      description: "友好的聊天与问答助手，支持简单工具调用与私有知识。",
      version: "1.0.0",
      visibility: "public",
      type: "chat",
      tags: ["chat", "q&a"],
      model: { provider: "xai", model: "grok-3", temperature: 0.6, maxTokens: 1024 },
      tools: { calculator: true, webSearch: false, http: false },
    },
    {
      id: "writer",
      workspaceId: "personal",
      name: "文案写作助手",
      description: "营销文案、标题创意与润色。",
      version: "0.9.2",
      visibility: "public",
      type: "chat",
      tags: ["writing", "marketing"],
      model: { provider: "openai", model: "gpt-4o-mini", temperature: 0.8, maxTokens: 1024 },
      tools: { calculator: false, webSearch: false, http: false },
    },
    {
      id: "analyst",
      workspaceId: "team",
      name: "数据分析助手",
      description: "表格、指标与简单可视化推荐。",
      version: "0.6.0",
      visibility: "public",
      type: "function",
      tags: ["analysis", "data"],
      model: { provider: "groq", model: "llama-3.1-70b", temperature: 0.3, maxTokens: 2048 },
      tools: { calculator: true, webSearch: true, http: true },
    },
  ]
}
