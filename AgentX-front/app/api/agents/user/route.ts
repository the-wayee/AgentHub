import { NextResponse } from "next/server"

type AgentDTO = {
  id: string
  name: string
  description?: string
  publishedVersion?: string
  agentType?: number
  modelConfig?: { modelName?: string; temperature?: number; maxTokens?: number }
  enabled?: boolean
}

function mapDto(dto: AgentDTO) {
  return {
    id: dto.id,
    name: dto.name?.trim() || "未命名 Agent",
    description: dto.description || undefined,
    version: dto.publishedVersion || "-Beta",
    visibility: dto.publishedVersion ? ("public" as const) : ("private" as const),
    type: dto.agentType === 2 ? ("function" as const) : ("chat" as const),
    tags: [] as string[],
    model: {
      provider: "openai",
      model: dto.modelConfig?.modelName || "gpt-4o",
      temperature: dto.modelConfig?.temperature,
      maxTokens: dto.modelConfig?.maxTokens,
    },
    tools: undefined,
    enabled: dto.enabled ?? true,
  }
}

export async function GET(req: Request) {
  const url = new URL(req.url)
  const name = url.searchParams.get("name")
  const enable = url.searchParams.get("enable")
  const backendBase = process.env.AGENTS_USER_ENDPOINT || "http://localhost:8080/api/agent/user"
  const backendUrl = new URL(backendBase)
  if (name) backendUrl.searchParams.set("name", name)
  if (enable != null && enable !== "all") backendUrl.searchParams.set("enable", enable)
  try {
    const r = await fetch(backendUrl.toString(), { cache: "no-store" })
    const j = await r.json()
    const list: AgentDTO[] = Array.isArray(j) ? j : j?.data ?? []
    return NextResponse.json(list.map(mapDto), { headers: { "x-backend-url": backendUrl.toString() } })
  } catch {
    return NextResponse.json([])
  }
}


