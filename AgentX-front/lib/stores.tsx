"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { nanoid } from "nanoid"
import { seedAgents, seedWorkspaces } from "./seed"
import type { Agent, Workspace } from "./types"

/* Conversations */
type Msg = { id: string; role: "user" | "assistant" | "system"; content: string; ts: number }
type Conversation = { id: string; agentId: string; title: string; createdAt: number; messages: Msg[] }

type ConvoState = {
  conversations: Conversation[]
  activeId?: string
  createConversation: (opts: { agentId: string }) => Conversation
  setActive: (id: string) => void
  appendMessage: (convoId: string, m: { role: "user" | "assistant" | "system"; content: string }) => void
  ensureActiveForAgent: (agentId: string) => Conversation
}

export const useConvoStore = create<ConvoState>()(
  persist(
    (set, get) => ({
      conversations: [
        {
          id: nanoid(),
          agentId: "demo",
          title: "欢迎使用 AgentHub",
          createdAt: Date.now(),
          messages: [
            {
              id: nanoid(),
              role: "assistant",
              content: "你好！我是你的 AI 助手，有什么可以帮你的吗？",
              ts: Date.now(),
            },
          ],
        },
      ],
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
    }),
    { name: "agenthub_conversations" },
  ),
)

/* Agent Catalog */
type CatalogState = {
  agents: Agent[]
  upsertAgent: (a: Agent) => void
  find: (id: string) => Agent | undefined
}

export const useAgentCatalog = create<CatalogState>()(
  persist(
    (set, get) => ({
      agents: seedAgents(),
      upsertAgent: (a: Agent) =>
        set((s) => {
          const exists = s.agents.some((x) => x.id === a.id)
          return { agents: exists ? s.agents.map((x) => (x.id === a.id ? a : x)) : [a, ...s.agents] }
        }),
      find: (id) => get().agents.find((a) => a.id === id),
    }),
    { name: "agenthub_catalog" },
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
    { name: "agenthub_knowledge" },
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
      workspaces: seedWorkspaces(),
      selectedId: "personal",
      setSelected: (id) => set({ selectedId: id }),
    }),
    { name: "agenthub_workspace" },
  ),
)
