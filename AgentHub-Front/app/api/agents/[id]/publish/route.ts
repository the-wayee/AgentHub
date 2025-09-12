import { NextResponse } from "next/server"

type PublishBody = {
  versionNumber: string
  changeLog?: string
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const base = (process.env.AGENT_PUBLISH_ENDPOINT_BASE || "http://localhost:8080/api/agent").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(id)}/publish`
  const body = (await req.json().catch(() => ({}))) as PublishBody
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
    return new NextResponse(JSON.stringify({ ok: false }), {
      headers: { "content-type": "application/json", "x-backend-url": url },
      status: 502,
    })
  }
}


