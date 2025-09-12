"use client"

import { useEffect } from "react"
import { useAgentCatalog } from "@/lib/stores"
import type { Agent } from "@/lib/types"
import { usePathname } from "next/navigation"

type AgentDTO = {
  id: string
  name: string
  avatar?: string
  description?: string
  systemPrompt?: string
  welcomeMessage?: string
  modelConfig?: {
    provider?: string
    model?: string
    temperature?: number
    maxTokens?: number
  }
  tools?: any[]
  knowledgeBaseIds?: string[]
  publishedVersion?: string
  enabled?: boolean
  agentType?: number // 1-聊天助手, 2-功能性Agent
  userId?: string
  createdAt?: string
  updatedAt?: string
}

function mapDtoToAgent(dto: AgentDTO): Agent {
  return {
    id: dto.id,
    name: dto.name,
    description: dto.description,
    version: dto.publishedVersion || "-Beta",
    visibility: dto.publishedVersion ? "public" : "private",
    type: dto.agentType === 2 ? "function" : "chat",
    tags: [],
    model: {
      provider: dto.modelConfig?.provider || "openai",
      model: (dto.modelConfig as any)?.model || dto.modelConfig?.model || "gpt-4o",
      temperature: dto.modelConfig?.temperature,
      maxTokens: dto.modelConfig?.maxTokens,
    },
    tools: undefined,
    systemPrompt: dto.systemPrompt,
    welcomeMessage: dto.welcomeMessage,
    enabled: dto.enabled ?? true,
    updatedAt: dto.updatedAt,
  }
}

export function AgentsLoader() {
  const { setAll, setLoading } = useAgentCatalog()
  const pathname = usePathname()

  useEffect(() => {
    // 在后台管理页面不加载Agent列表
    if (pathname.startsWith('/admin')) {
      return
    }
    
    let cancelled = false
    ;(async () => {
      try {
        setLoading(true)
        // always refetch on mount to restore home data
        const res = await fetch("/api/agents", { cache: "no-store" })
        const json = await res.json()
        const list: AgentDTO[] = Array.isArray(json) ? json : json?.data ?? []
        if (!cancelled && Array.isArray(list)) {
          const mapped = list.map(mapDtoToAgent)
          setAll(mapped as any)
        }
      } catch {
        // swallow errors; fallback to seeded data
      } finally { setLoading(false) }
    })()
    return () => {
      cancelled = true
    }
  }, [setAll, pathname])

  return null
}


