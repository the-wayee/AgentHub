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
  updatedAt?: string
  createdAt?: string
}

  function mapDto(dto: AgentDTO) {
    return {
        id: dto.id,
        name: dto.name?.trim() || "未命名 Agent",
        description: dto.description || undefined,
        version: dto.publishedVersion || "-Beta",
        visibility: dto.publishedVersion ? "public" as const : "private" as const,
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
        welcomeMessage: dto.welcomeMessage || undefined,
        enabled: dto.enabled ?? true,
        updatedAt: dto.updatedAt || undefined,
        publishStatus: dto.publishedVersion ? (2 as const) : (undefined as any),
        publishStatusLabel: dto.publishedVersion ? "已发布" : "未发布",
      }
  }

export async function GET() {
  const backendBase = process.env.AGENTS_ENDPOINT || "http://localhost:8080/api/agent/workspace/agents"
  const backendUrl = new URL(backendBase)
  try {
    const r = await fetch(backendUrl.toString(), { cache: "no-store" })
      const j = await r.json()
      const list: AgentDTO[] = Array.isArray(j) ? j : j?.data ?? []
    return NextResponse.json(list.map(mapDto), { headers: { "x-backend-url": backendUrl.toString() } })
      } catch {
        return NextResponse.json([])
      }
    }
  // Create Agent
  export async function POST(req: Request) {
  const base = (process.env.AGENTS_BASE || "http://localhost:8080/api/agent").replace(/\/$/, "")
  const url = `${base}`
  const body = await req.json().catch(() => ({}))
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const j = await r.json().catch(() => ({}))
    return new NextResponse(JSON.stringify(j?.data ?? j ?? {}), {
      headers: { "content-type": "application/json", "x-backend-url": url },
      status: r.ok ? 200 : r.status,
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}


