import { NextResponse } from "next/server"

type AgentDTO = {
  id: string
  agentId?: string
  name: string
  avatar?: string | null
  description?: string | null
  systemPrompt?: string | null
  welcomeMessage?: string | null
  modelConfig?: {
    modelName?: string
    temperature?: number
    maxTokens?: number
    provider?: string
    model?: string
  } | null
  tools?: any[]
  knowledgeBaseIds?: string[]
  versionNumber?: string | null
  enabled?: boolean
  agentType?: number
  userId?: string
  publishStatus?: number | null
  createdAt?: string
  updatedAt?: string
}

function mapDto(dto: AgentDTO) {
  return {
    id: dto.agentId || dto.id,
    workspaceId: "personal",
    name: dto.name?.trim() || "未命名 Agent",
    description: dto.description || undefined,
    version: dto.versionNumber || "1.0.0",
    visibility: "public" as const,
    type: dto.agentType === 2 ? ("function" as const) : ("chat" as const),
    tags: [] as string[],
    model: {
      provider: dto.modelConfig?.provider || "openai",
      model: (dto.modelConfig as any)?.model || dto.modelConfig?.modelName || "gpt-4o",
      temperature: dto.modelConfig?.temperature,
      maxTokens: dto.modelConfig?.maxTokens,
    },
    tools: undefined,
    systemPrompt: dto.systemPrompt || undefined,
    publishStatus: (dto.publishStatus || undefined) as any,
    publishStatusLabel:
      dto.publishStatus === 1
        ? "审核中"
        : dto.publishStatus === 2
          ? "已发布"
          : dto.publishStatus === 3
            ? "拒绝"
            : dto.publishStatus === 4
              ? "已下架"
              : undefined,
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const name = url.searchParams.get("name")
  const base = process.env.PUBLISHED_AGENTS_ENDPOINT || "http://localhost:8080/api/agent/published"
  const endpoint = new URL(base)
  if (name) endpoint.searchParams.set("name", name)
  try {
    const r = await fetch(endpoint.toString(), { cache: "no-store" })
    const j = await r.json()
    const list: AgentDTO[] = Array.isArray(j) ? j : j?.data ?? []
    return NextResponse.json(list.map(mapDto))
  } catch {
    return NextResponse.json([])
  }
}


