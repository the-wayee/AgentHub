"use client"

import { create } from "zustand"
import { nanoid } from "nanoid"

export type KBStatus =
  | "queued"
  | "uploading"
  | "reviewing"
  | "splitting"
  | "indexing"
  | "completed"
  | "failed"

export type KBChunk = {
  id: string
  index: number
  content: string
  tokens: number
  metadata?: Record<string, string | number>
}

export type KBDocument = {
  id: string
  name: string
  size: number
  type: string
  createdAt: number
  status: KBStatus
  progress: number
  error?: string
  chunkReady: boolean
  chunkCount: number
  chunks: KBChunk[]
}

export type KnowledgeBase = {
  id: string
  name: string
  description?: string
  kind: "mine" | "installed"
  createdAt: number
  updatedAt: number
  docs: KBDocument[]
  installSource?: { marketId: string }
}

type KbState = {
  kbs: KnowledgeBase[]
  selectedKbId?: string | null

  // KB CRUD
  createKb: (name: string, description?: string) => KnowledgeBase
  selectKb: (id: string | null) => void
  removeKb: (id: string) => void

  // Files / pipeline
  uploadFiles: (files: File[] | FileList, kbId?: string) => Promise<void>
  setStatus: (docId: string, status: KBStatus, progress?: number) => void
  setError: (docId: string, error: string) => void
  refreshSimulated: () => void

  // Market install
  installKb: (payload: { marketId: string; name: string; description?: string }) => KnowledgeBase
  uninstallKb: (kbId: string) => void
}

function estimateTokens(s: string) {
  return Math.max(1, Math.ceil(s.length / 4))
}

function splitTextIntoChunks(text: string, maxLen = 800) {
  const chunks: KBChunk[] = []
  let idx = 0
  for (let i = 0; i < text.length; i += maxLen) {
    const piece = text.slice(i, i + maxLen)
    chunks.push({ id: nanoid(), index: idx++, content: piece, tokens: estimateTokens(piece) })
  }
  return chunks
}

export const useKbStore = create<KbState>((set, get) => ({
  kbs: [
    {
      id: "kb-default",
      name: "我的第一个知识库",
      description: "用于测试 RAG 与上传流程",
      kind: "mine",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      docs: [],
    },
  ],
  selectedKbId: "kb-default",

  createKb: (name, description) => {
    const kb: KnowledgeBase = {
      id: nanoid(),
      name,
      description,
      kind: "mine",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      docs: [],
    }
    set((s) => ({ kbs: [kb, ...s.kbs], selectedKbId: kb.id }))
    return kb
  },

  selectKb: (id) => set({ selectedKbId: id }),

  removeKb: (id) => set((s) => ({ kbs: s.kbs.filter((kb) => kb.id !== id), selectedKbId: s.selectedKbId === id ? null : s.selectedKbId })),

  uploadFiles: async (files, kbId) => {
    const targetId = kbId ?? get().selectedKbId
    if (!targetId) return
    const list = Array.from(files as File[])

    for (const f of list) {
      const id = nanoid()
      const now = Date.now()
      const doc: KBDocument = {
        id,
        name: f.name,
        size: f.size,
        type: f.type || inferTypeFromName(f.name),
        createdAt: now,
        status: "uploading",
        progress: 2,
        chunkReady: false,
        chunkCount: 0,
        chunks: [],
      }
      set((s) => ({
        kbs: s.kbs.map((kb) => (kb.id === targetId ? { ...kb, updatedAt: now, docs: [doc, ...kb.docs] } : kb)),
      }))

      let text: string | null = null
      if (/(text|json|markdown)/i.test(doc.type) || /\.(txt|md|csv|json)$/i.test(doc.name)) {
        try {
          text = await f.text()
        } catch {
          text = null
        }
      }

      simulatePipeline(targetId, id, text)
    }
  },

  setStatus: (docId, status, progress) =>
    set((s) => ({
      kbs: s.kbs.map((kb) => ({
        ...kb,
        docs: kb.docs.map((d) => (d.id === docId ? { ...d, status, progress: progress ?? d.progress } : d)),
      })),
    })),

  setError: (docId, error) =>
    set((s) => ({
      kbs: s.kbs.map((kb) => ({
        ...kb,
        docs: kb.docs.map((d) => (d.id === docId ? { ...d, status: "failed", error, progress: d.progress || 0 } : d)),
      })),
    })),

  refreshSimulated: () => {
    set((s) => ({
      kbs: s.kbs.map((kb) => ({
        ...kb,
        docs: kb.docs.map((d) => {
          if (["uploading", "reviewing", "splitting", "indexing"].includes(d.status)) {
            const add = Math.max(1, Math.round(Math.random() * 12))
            const next = Math.min(99, d.progress + add)
            return { ...d, progress: next }
          }
          return d
        }),
      })),
    }))
  },

  installKb: (payload) => {
    const kb: KnowledgeBase = {
      id: nanoid(),
      name: payload.name,
      description: payload.description,
      kind: "installed",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      docs: [],
      installSource: { marketId: payload.marketId },
    }
    set((s) => ({ kbs: [kb, ...s.kbs] }))
    return kb
  },

  uninstallKb: (kbId) => set((s) => ({ kbs: s.kbs.filter((kb) => !(kb.id === kbId && kb.kind === "installed")) })),
}))

function inferTypeFromName(name: string) {
  const m = name.split(".").pop()?.toLowerCase()
  switch (m) {
    case "md":
      return "text/markdown"
    case "txt":
      return "text/plain"
    case "json":
      return "application/json"
    case "csv":
      return "text/csv"
    case "pdf":
      return "application/pdf"
    case "docx":
      return "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    default:
      return "application/octet-stream"
  }
}

function simulatePipeline(kbId: string, docId: string, text: string | null) {
  const { setStatus } = useKbStore.getState()
  let progress = 2
  let status: KBStatus = "uploading"

  const timer = setInterval(() => {
    const step = Math.max(1, Math.round(Math.random() * 8))
    progress = Math.min(100, progress + step)

    if (status === "uploading" && progress >= 20) status = "reviewing"
    if (status === "reviewing" && progress >= 40) status = "splitting"
    if (status === "splitting" && progress >= 70) status = "indexing"

    setStatus(docId, status, progress)

    if (progress >= 100) {
      clearInterval(timer)
      const chunks = buildChunks(text)
      useKbStore.setState((s) => ({
        kbs: s.kbs.map((kb) =>
          kb.id === kbId
            ? {
                ...kb,
                docs: kb.docs.map((d) =>
                  d.id === docId
                    ? { ...d, chunks, chunkCount: chunks.length, chunkReady: true, status: "completed", progress: 100 }
                    : d,
                ),
              }
            : kb,
        ),
      }))
    }
  }, 350)
}

function buildChunks(text: string | null): KBChunk[] {
  if (text && text.trim()) {
    const parts = text.split(/\n\n+/)
    const merged: string[] = []
    let buf = ""
    for (const p of parts) {
      if ((buf + p).length > 800) {
        if (buf) merged.push(buf)
        buf = p
      } else {
        buf = buf ? `${buf}\n\n${p}` : p
      }
    }
    if (buf) merged.push(buf)
    return merged.flatMap((m) => splitTextIntoChunks(m, 800))
  }
  const fake = Array.from({ length: 6 + Math.round(Math.random() * 6) }).map((_, i) => ({
    id: nanoid(),
    index: i,
    content: `片段 ${i + 1}（二进制预览不可用）`,
    tokens: 50 + Math.round(Math.random() * 80),
  }))
  return fake
}
