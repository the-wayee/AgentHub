import { NextResponse } from "next/server"

type SessionDTO = {
  id: string
  title?: string
  description?: string
  createdAt?: string
  updatedAt?: string
  isArchived?: boolean
  agentId: string
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: { agentId: string } }) {
  const base = (process.env.SESSIONS_ENDPOINT_BASE || "http://localhost:8080/api/agent/session").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(params.agentId)}`
  try {
    const r = await fetch(url, { cache: "no-store" })
    const j = await r.json()
    const list: SessionDTO[] = Array.isArray(j) ? j : j?.data ?? []
    return new NextResponse(JSON.stringify(list), {
      headers: {
        "content-type": "application/json",
        "x-backend-url": url,
      },
    })
  } catch {
    return new NextResponse(JSON.stringify([]), {
      headers: {
        "content-type": "application/json",
        "x-backend-url": url,
      },
    })
  }
}

export async function POST(req: Request, { params }: { params: { agentId: string } }) {
  const base = (process.env.SESSIONS_ENDPOINT_BASE || "http://localhost:8080/api/agent/session").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(params.agentId)}`
  try {
    const r = await fetch(url, { method: "POST" })
    const j = await r.json().catch(() => ({}))
    // accept either direct SessionDTO or {data: SessionDTO}
    const created = j?.data ?? j
    return new NextResponse(JSON.stringify(created), {
      headers: { "content-type": "application/json", "x-backend-url": url },
      status: r.ok ? 200 : r.status,
    })
  } catch {
    return new NextResponse(JSON.stringify({}), {
      headers: { "content-type": "application/json", "x-backend-url": url },
      status: 502,
    })
  }
}


