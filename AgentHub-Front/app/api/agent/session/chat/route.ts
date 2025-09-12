import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

// Proxy to backend chat endpoint with SSE streaming
export async function POST(req: Request) {
  const backend = (process.env.CHAT_ENDPOINT || "http://localhost:8080/api/agent/session/chat").replace(/\/$/, "")
  const body = await req.text()
  try {
    const r = await fetch(backend, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "text/event-stream",
      },
      body,
    })
    return new NextResponse(r.body, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        Connection: "keep-alive",
        "x-backend-url": backend,
      },
      status: r.status,
    })
  } catch (e) {
    return new NextResponse("", {
      status: 502,
      headers: { "Content-Type": "text/event-stream", "x-backend-url": backend },
    })
  }
}


