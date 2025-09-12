import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const backend = (process.env.LLM_PROVIDERS_USER_ENDPOINT || "http://localhost:8080/api/llm/providers/user").replace(/\/$/, "")
  try {
    const r = await fetch(backend, { cache: "no-store" })
    const j = await r.json().catch(() => ({}))
    return new NextResponse(JSON.stringify(j?.data ?? j ?? {}), {
      headers: { "content-type": "application/json", "x-backend-url": backend },
      status: r.ok ? 200 : r.status,
    })
  } catch {
    return NextResponse.json([], { status: 502 })
  }
}

export async function POST(req: Request) {
  const backend = (process.env.LLM_PROVIDERS_USER_ENDPOINT || "http://localhost:8080/api/llm/providers/user").replace(/\/$/, "")
  const bodyText = await req.text()
  try {
    const r = await fetch(backend, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: bodyText,
    })
    const j = await r.json().catch(() => ({}))
    return new NextResponse(JSON.stringify(j?.data ?? j ?? {}), {
      headers: { "content-type": "application/json", "x-backend-url": backend },
      status: r.ok ? 200 : r.status,
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}


