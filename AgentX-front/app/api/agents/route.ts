import { NextResponse } from "next/server"

type AgentDTO = {
  id: string
  name: string
  avatar?: string | null
  description?: string | null
  systemPrompt?: string | null
  welcomeMessage?: string | null
  modelConfig?: {
    modelName?: string
    temperature?: number
    maxTokens?: number
  } | null
  tools?: any[]
  knowledgeBaseIds?: string[]
  publishedVersion?: string | null
  enabled?: boolean
  agentType?: number
  userId?: string
  createdAt?: string
  updatedAt?: string
}

function mapDto(dto: AgentDTO) {
  return {
    id: dto.id,
    workspaceId: "personal",
    name: dto.name?.trim() || "未命名 Agent",
    description: dto.description || undefined,
    version: dto.publishedVersion || "1.0.0",
    visibility: "public" as const,
    type: dto.agentType === 2 ? ("function" as const) : ("chat" as const),
    tags: [] as string[],
    model: {
      provider: "openai",
      model: dto.modelConfig?.modelName || "gpt-4o",
      temperature: dto.modelConfig?.temperature,
      maxTokens: dto.modelConfig?.maxTokens,
    },
    tools: undefined,
    systemPrompt: dto.systemPrompt || undefined,
  }
}

export async function GET() {
  const backend = process.env.AGENTS_ENDPOINT || "http://localhost:8080/api/agent/user"
  try {
    const r = await fetch(backend, { cache: "no-store" })
    const j = await r.json()
    const list: AgentDTO[] = Array.isArray(j) ? j : j?.data ?? []
    return NextResponse.json(list.map(mapDto))
  } catch {
    return NextResponse.json([])
  }
}


