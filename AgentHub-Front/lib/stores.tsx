"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { Agent, Workspace } from "./types"
import { api } from "./api"

/* Conversations */
type Msg = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  ts: number
  kind?: "normal" | "reasoning"
  messageType?: string
  taskId?: string
  taskName?: string
}
type Conversation = { id: string; agentId: string; title: string; createdAt: number; messages: Msg[] }

type ConvoState = {
  conversations: Conversation[]
  activeId?: string
  rehydrated?: boolean
  createConversation: (opts: { agentId: string }) => Promise<Conversation>
  addConversation: (c: { id: string; agentId: string; title?: string; createdAt?: string | number }) => Conversation
  setActive: (id: string) => void
  appendMessage: (convoId: string, m: { role: "user" | "assistant" | "system"; content: string }) => void
  ensureActiveForAgent: (agentId: string) => Promise<Conversation | null>
  replaceConversationsForAgent: (agentId: string, sessions: { id: string; title?: string; createdAt?: string | number }[]) => void
  replaceMessages: (
    convoId: string,
    messages: { id: string; role: "user" | "assistant" | "system"; content: string; messageType?: string; taskId?: string; taskName?: string; createdAt?: string | number }[],
  ) => void
  appendAssistantMessage: (convoId: string, initialContent?: string, kind?: "normal" | "reasoning", messageType?: string, taskId?: string, taskName?: string) => string
  setMessageContent: (convoId: string, messageId: string, content: string) => void
  appendMessageDelta: (convoId: string, messageId: string, delta: string) => void
  removeMessage: (convoId: string, messageId: string) => void
  renameConversation: (convoId: string, title: string) => void
  deleteConversation: (convoId: string) => void
}

export const useConvoStore = create<ConvoState>()(
  persist(
    (set, get) => ({
      conversations: [],
      activeId: undefined,
      rehydrated: false,
      createConversation: async ({ agentId }) => {
        try {
          // 调用后端API创建真实的会话
          const data = await api.createSession(agentId)
          
          // 处理Result<SessionDTO>响应格式
          const sessionId = data?.data?.id || data?.id || data?.sessionId
          const title = data?.data?.title || data?.title || "新会话"
          const createdAt = data?.data?.createdAt || data?.createdAt || Date.now()
          
          if (sessionId) {
            // 使用后端返回的真实sessionId
            const c: Conversation = {
              id: sessionId,
              agentId,
              title: title,
              createdAt: typeof createdAt === "string" ? Date.parse(createdAt) : createdAt,
              messages: [],
            }
            set((s) => ({ conversations: [c, ...s.conversations] }))
            return c
          } else {
            // 后端创建成功但没有返回sessionId
            throw new Error(`Session created but no ID returned: ${JSON.stringify(data)}`)
          }
        } catch (error) {
          // 网络错误或其他错误
          throw error
        }
      },
      addConversation: (c0) => {
        const c: Conversation = {
          id: c0.id,
          agentId: c0.agentId,
          title: c0.title || "新会话",
          createdAt: typeof c0.createdAt === "string" ? Date.parse(c0.createdAt) : c0.createdAt || Date.now(),
          messages: [],
        }
        set((s) => ({ conversations: [c, ...s.conversations] }))
        return c
      },
      setActive: (id) => set({ activeId: id }),
      appendMessage: (convoId, m) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convoId
              ? {
                  ...c,
                  title: c.title === "新会话" && m.role === "user" ? m.content.slice(0, 20) : c.title,
                  messages: [...c.messages, { ...m, id: nanoid(), ts: Date.now() }],
                }
              : c,
          ),
        })),
      ensureActiveForAgent: async (agentId) => {
        const s = get()
        const active = s.conversations.find((c) => c.id === s.activeId && c.agentId === agentId)
        if (active) return active
        const existing = s.conversations.find((c) => c.agentId === agentId)
        if (existing) {
          set({ activeId: existing.id })
          return existing
        }
        
        // 先尝试从后端获取现有会话
        try {
          const data = await api.getSessions(agentId)

          if (data && Array.isArray(data.data) && data.data.length > 0) {
            // 使用第一个现有会话
            const existingSession = data.data[0]
            const c: Conversation = {
              id: existingSession.id,
              agentId,
              title: existingSession.title || "新会话",
              createdAt: typeof existingSession.createdAt === "string" ? Date.parse(existingSession.createdAt) : existingSession.createdAt || Date.now(),
              messages: [],
            }
            set((s) => ({ conversations: [c, ...s.conversations], activeId: c.id }))
            return c
          }
        } catch (error) {
          // 忽略错误，继续执行
        }
        
        // 如果没有现有会话，返回null而不是创建新的
        return null
      },
      replaceConversationsForAgent: (agentId, sessions) =>
        set((s) => {
          const others = s.conversations.filter((c) => c.agentId !== agentId)
          const mapped: Conversation[] = sessions.map((sess) => {
            // 查找现有会话，保留其消息
            const existing = s.conversations.find((c) => c.id === sess.id)
            return {
              id: sess.id,
              agentId,
              title: sess.title || "新会话",
              createdAt: typeof sess.createdAt === "string" ? Date.parse(sess.createdAt) : sess.createdAt || Date.now(),
              messages: existing?.messages || [], // 保留现有消息，避免重复加载
            }
          })
          const next = [...mapped, ...others]
          const activeStillExists = next.some((c) => c.id === s.activeId)
          return { conversations: next, activeId: activeStillExists ? s.activeId : mapped[0]?.id }
        }),
      replaceMessages: (convoId, messages) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convoId
              ? {
                  ...c,
                  messages: messages.map((m) => ({
                    id: m.id,
                    role: m.role,
                    content: m.content,
                    messageType: m.messageType,
                    taskId: m.taskId,
                    taskName: m.taskName,
                    ts: typeof m.createdAt === "string" ? Date.parse(m.createdAt) : m.createdAt || Date.now(),
                  })),
                }
              : c,
          ),
        })),
      appendAssistantMessage: (convoId, initialContent = "", kind = "normal", messageType?: string, taskId?: string, taskName?: string) => {
        const id = nanoid()
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convoId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { id, role: "assistant", content: initialContent, ts: Date.now(), kind, messageType, taskId, taskName },
                  ],
                }
              : c,
          ),
        }))
        return id
      },
      setMessageContent: (convoId, messageId, content) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convoId
              ? {
                  ...c,
                  messages: c.messages.map((m) => (m.id === messageId ? { ...m, content } : m)),
                }
              : c,
          ),
        })),
      appendMessageDelta: (convoId, messageId, delta) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convoId
              ? {
                  ...c,
                  messages: c.messages.map((m) =>
                    m.id === messageId ? { ...m, content: (m.content || "") + delta } : m,
                  ),
                }
              : c,
          ),
        })),
      renameConversation: (convoId, title) =>
        set((s) => ({
          conversations: s.conversations.map((c) => (c.id === convoId ? { ...c, title } : c)),
        })),
      deleteConversation: (convoId) =>
        set((s) => ({
          conversations: s.conversations.filter((c) => c.id !== convoId),
          activeId: s.activeId === convoId ? undefined : s.activeId,
        })),
      removeMessage: (convoId, messageId) =>
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convoId ? { ...c, messages: c.messages.filter((m) => m.id !== messageId) } : c,
          ),
        })),
    }),
    { name: "agenthub_conversations_v2" },
  ),
)

/* Agent Catalog */
type CatalogState = {
  agents: Agent[]
  rehydrated?: boolean
  loading: boolean
  upsertAgent: (a: Agent) => void
  find: (id: string) => Agent | undefined
  setAll: (list: Agent[]) => void
  setLoading: (v: boolean) => void
}

export const useAgentCatalog = create<CatalogState>()(
  persist(
    (set, get) => ({
      agents: [],
      rehydrated: false,
      loading: true,
      upsertAgent: (a: Agent) =>
        set((s) => {
          const exists = s.agents.some((x) => x.id === a.id)
          return { agents: exists ? s.agents.map((x) => (x.id === a.id ? a : x)) : [a, ...s.agents] }
        }),
      find: (id) => get().agents.find((a) => a.id === id),
      setAll: (list) => set({ agents: list }),
      setLoading: (v) => set({ loading: v }),
    }),
    {
      name: "agenthub_catalog_v2",
      onRehydrateStorage: () => (state) => {
        if (state) {
          state.rehydrated = true
        }
      },
    },
  ),
)

/* Knowledge */
type KnowledgeItem = { id: string; title: string; content: string }
type KnowledgeState = {
  items: KnowledgeItem[]
  addItem: (k: { title: string; content: string }) => void
  removeItem: (id: string) => void
}

export const useKnowledgeStore = create<KnowledgeState>()(
  persist(
    (set) => ({
      items: [],
      addItem: (k) => set((s) => ({ items: [{ id: nanoid(), title: k.title, content: k.content }, ...s.items] })),
      removeItem: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
    }),
    { name: "agenthub_knowledge_v2" },
  ),
)

/* Workspaces */
type WorkspaceState = {
  workspaces: Workspace[]
  selectedId: string
  setSelected: (id: string) => void
  currentAgentId?: string
  setCurrentAgentId: (id?: string) => void
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      selectedId: "personal",
      setSelected: (id) => set({ selectedId: id }),
      currentAgentId: undefined,
      setCurrentAgentId: (id) => set({ currentAgentId: id }),
    }),
    { name: "agenthub_workspace_v2" },
  ),
)

/* Provider Configurations */
export type ProviderKind = "openai" | "qwen" | "zhipu" | "groq" | "xai" | "azure-openai" | "custom"
export type ProviderModel = { id: string; modelName: string; displayName?: string; enabled: boolean }
export type ProviderConfig = {
  id: string
  name: string
  kind: ProviderKind
  apiKey?: string
  baseUrl?: string
  description?: string
  enabled: boolean
  models: ProviderModel[]
}

type ProviderState = {
  providers: ProviderConfig[]
  selectedProviderId?: string
  upsertProvider: (p: ProviderConfig) => void
  removeProvider: (id: string) => void
  setSelectedProvider: (id: string) => void
  addModel: (providerId: string, m: { modelName: string; displayName?: string }) => void
  toggleModel: (providerId: string, modelId: string, enabled: boolean) => void
  setAllProviders: (list: ProviderConfig[]) => void
}

const defaultProviders: ProviderConfig[] = []

export const useProviderStore = create<ProviderState>()((set, get) => ({
  providers: defaultProviders,
  selectedProviderId: undefined,
  upsertProvider: (p) =>
    set((s) => {
      const exists = s.providers.some((x) => x.id === p.id)
      return { providers: exists ? s.providers.map((x) => (x.id === p.id ? p : x)) : [p, ...s.providers] }
    }),
  removeProvider: (id) => set((s) => ({ providers: s.providers.filter((p) => p.id !== id) })),
  setSelectedProvider: (id) => set({ selectedProviderId: id }),
  addModel: (providerId, m) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === providerId
          ? { ...p, models: [{ id: nanoid(), modelName: m.modelName, displayName: m.displayName, enabled: true }, ...p.models] }
          : p,
      ),
    })),
  toggleModel: (providerId, modelId, enabled) =>
    set((s) => ({
      providers: s.providers.map((p) =>
        p.id === providerId
          ? { ...p, models: p.models.map((mm) => (mm.id === modelId ? { ...mm, enabled } : mm)) }
          : p,
      ),
    })),
  setAllProviders: (list) => set({ providers: list }),
}))
