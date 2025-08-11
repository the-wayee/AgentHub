import { NextResponse } from "next/server"

// Deprecated: use /toggle-status
export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const base = (process.env.AGENTS_BASE || "http://localhost:8080/api/agent").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(id)}/toggle-status`
  try {
    const r = await fetch(url, { method: "GET", cache: "no-store" })
    const j = await r.json().catch(() => ({}))
    return new NextResponse(JSON.stringify(j?.data ?? j ?? {}), {
      headers: { "content-type": "application/json", "x-backend-url": url },
      status: r.ok ? 200 : r.status,
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}


