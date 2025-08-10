"use client"

import { useEffect } from "react"
import { useAgentCatalog } from "@/lib/stores"
import type { Agent } from "@/lib/types"

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
    workspaceId: "personal",
    name: dto.name,
    description: dto.description,
    version: dto.publishedVersion || "1.0.0",
    visibility: "public",
    type: dto.agentType === 2 ? "function" : "chat",
    tags: [],
    model: {
      provider: dto.modelConfig?.provider || "openai",
      model: dto.modelConfig?.model || "gpt-4o-mini",
      temperature: dto.modelConfig?.temperature,
      maxTokens: dto.modelConfig?.maxTokens,
    },
    tools: undefined,
    systemPrompt: dto.systemPrompt,
  }
}

export function AgentsLoader() {
  const { setAll } = useAgentCatalog()

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        // Call our local API route, which proxies/massages backend response
        const res = await fetch("/api/agents", { cache: "no-store" })
        const json = await res.json()
        const list: AgentDTO[] = Array.isArray(json) ? json : json?.data ?? []
        if (!cancelled && Array.isArray(list)) {
          const mapped = list.map(mapDtoToAgent)
          setAll(mapped as any)
        }
      } catch {
        // swallow errors; fallback to seeded data
      }
    })()
    return () => {
      cancelled = true
    }
  }, [setAll])

  return null
}


