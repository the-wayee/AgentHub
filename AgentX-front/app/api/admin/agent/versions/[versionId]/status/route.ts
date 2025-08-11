import { NextResponse } from "next/server"

export async function POST(req: Request, { params }: { params: Promise<{ versionId: string }> }) {
  const { versionId } = await params
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const reason = searchParams.get("reason")
  const base = (process.env.AGENTS_ADMIN_BASE || "http://localhost:8080/api/admin/agent").replace(/\/$/, "")
  const url = `${base}/versions/${encodeURIComponent(versionId)}/status${status ? `?status=${encodeURIComponent(status)}${reason ? `&reason=${encodeURIComponent(reason)}` : ""}` : ""}`
  try {
    const r = await fetch(url, { method: "POST" })
    const j = await r.json().catch(() => ({}))
    return new NextResponse(JSON.stringify(j?.data ?? j ?? {}), {
      headers: { "content-type": "application/json", "x-backend-url": url },
      status: r.ok ? 200 : r.status,
    })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}


