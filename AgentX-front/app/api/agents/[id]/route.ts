import { NextResponse } from "next/server"

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const base = (process.env.AGENTS_BASE || "http://localhost:8080/api/agent").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(id)}`
  const body = await req.json().catch(() => ({}))
  try {
    const r = await fetch(url, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    })
    const text = await r.text().catch(() => "")
    // 有些后端返回空体会导致浏览器显示“无法加载数据”，这里统一返回 JSON
    const payload = text ? (() => { try { return JSON.parse(text) } catch { return { ok: r.ok } } })() : { ok: r.ok }
    return NextResponse.json(payload, { status: r.ok ? 200 : r.status, headers: { "x-backend-url": url } })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}

export async function DELETE(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const base = (process.env.AGENTS_BASE || "http://localhost:8080/api/agent").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(id)}`
  try {
    const r = await fetch(url, { method: "DELETE" })
    return new NextResponse(null, { status: r.ok ? 200 : r.status, headers: { "x-backend-url": url } })
  } catch {
    return NextResponse.json({ ok: false }, { status: 502 })
  }
}


