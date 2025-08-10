"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import type { Agent, Workspace } from "./types"

/* Conversations */
type Msg = {
  id: string
  role: "user" | "assistant" | "system"
  content: string
  ts: number
  kind?: "normal" | "reasoning"
}
type Conversation = { id: string; agentId: string; title: string; createdAt: number; messages: Msg[] }

type ConvoState = {
  conversations: Conversation[]
  activeId?: string
  createConversation: (opts: { agentId: string }) => Conversation
  addConversation: (c: { id: string; agentId: string; title?: string; createdAt?: string | number }) => Conversation
  setActive: (id: string) => void
  appendMessage: (convoId: string, m: { role: "user" | "assistant" | "system"; content: string }) => void
  ensureActiveForAgent: (agentId: string) => Conversation
  replaceConversationsForAgent: (agentId: string, sessions: { id: string; title?: string; createdAt?: string | number }[]) => void
  replaceMessages: (
    convoId: string,
    messages: { id: string; role: "user" | "assistant" | "system"; content: string; createdAt?: string | number }[],
  ) => void
  appendAssistantMessage: (convoId: string, initialContent?: string, kind?: "normal" | "reasoning") => string
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
      createConversation: ({ agentId }) => {
        const c: Conversation = {
          id: nanoid(),
          agentId,
          title: "新会话",
          createdAt: Date.now(),
          messages: [],
        }
        set((s) => ({ conversations: [c, ...s.conversations] }))
        return c
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
      ensureActiveForAgent: (agentId) => {
        const s = get()
        const active = s.conversations.find((c) => c.id === s.activeId && c.agentId === agentId)
        if (active) return active
        const existing = s.conversations.find((c) => c.agentId === agentId)
        if (existing) {
          set({ activeId: existing.id })
          return existing
        }
        const created = s.createConversation({ agentId })
        set({ activeId: created.id })
        return created
      },
      replaceConversationsForAgent: (agentId, sessions) =>
        set((s) => {
          const others = s.conversations.filter((c) => c.agentId !== agentId)
          const mapped: Conversation[] = sessions.map((sess) => ({
            id: sess.id,
            agentId,
            title: sess.title || "新会话",
            createdAt: typeof sess.createdAt === "string" ? Date.parse(sess.createdAt) : sess.createdAt || Date.now(),
            messages: [],
          }))
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
                    ts: typeof m.createdAt === "string" ? Date.parse(m.createdAt) : m.createdAt || Date.now(),
                  })),
                }
              : c,
          ),
        })),
      appendAssistantMessage: (convoId, initialContent = "", kind = "normal") => {
        const id = nanoid()
        set((s) => ({
          conversations: s.conversations.map((c) =>
            c.id === convoId
              ? {
                  ...c,
                  messages: [
                    ...c.messages,
                    { id, role: "assistant", content: initialContent, ts: Date.now(), kind },
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
  upsertAgent: (a: Agent) => void
  find: (id: string) => Agent | undefined
  setAll: (list: Agent[]) => void
}

export const useAgentCatalog = create<CatalogState>()(
  persist(
    (set, get) => ({
      agents: [],
      upsertAgent: (a: Agent) =>
        set((s) => {
          const exists = s.agents.some((x) => x.id === a.id)
          return { agents: exists ? s.agents.map((x) => (x.id === a.id ? a : x)) : [a, ...s.agents] }
        }),
      find: (id) => get().agents.find((a) => a.id === id),
      setAll: (list) => set({ agents: list }),
    }),
    { name: "agenthub_catalog_v2" },
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
}

export const useWorkspaceStore = create<WorkspaceState>()(
  persist(
    (set, get) => ({
      workspaces: [],
      selectedId: "personal",
      setSelected: (id) => set({ selectedId: id }),
    }),
    { name: "agenthub_workspace_v2" },
  ),
)
