import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(req: Request, { params }: { params: { agentId: string } }) {
  const base = (process.env.MESSAGES_ENDPOINT_BASE || "http://localhost:8080/api/agent/session").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(params.agentId)}/message`
  const body = await req.json().catch(() => ({}))
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body: JSON.stringify(body),
    })
    // Pipe SSE stream back to client
    return new NextResponse(r.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "x-backend-url": url,
      },
    })
  } catch (e) {
    return new NextResponse("", {
      status: 502,
      headers: { "Content-Type": "text/event-stream", "x-backend-url": url },
    })
  }
}


