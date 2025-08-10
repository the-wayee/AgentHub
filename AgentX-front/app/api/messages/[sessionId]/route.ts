import { NextResponse } from "next/server"

type MessageDTO = {
  id: string
  role: string
  content: string
  createdAt?: string
  provider?: string
  model?: string
}

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(_: Request, { params }: { params: { sessionId: string } }) {
  const base = (process.env.MESSAGES_ENDPOINT_BASE || "http://localhost:8080/api/agent/session").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(params.sessionId)}/messages`
  try {
    const r = await fetch(url, { cache: "no-store" })
    const j = await r.json()
    const list: MessageDTO[] = Array.isArray(j) ? j : j?.data ?? []
    return new NextResponse(JSON.stringify(list), {
      headers: { "content-type": "application/json", "x-backend-url": url },
    })
  } catch {
    return new NextResponse(JSON.stringify([]), {
      headers: { "content-type": "application/json", "x-backend-url": url },
    })
  }
}


