import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BASE = (process.env.SESSIONS_ITEM_ENDPOINT_BASE || "http://localhost:8080/api/agent/session").replace(/\/$/, "")

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  try {
    const { title } = await req.json().catch(() => ({}))
    const url = `${BASE}/${encodeURIComponent(params.id)}?title=${encodeURIComponent(title || "")}`
    const r = await fetch(url, { method: "PUT" })
    const ok = r.ok
    return NextResponse.json({ ok }, { status: ok ? 200 : r.status })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}

export async function DELETE(_: Request, { params }: { params: { id: string } }) {
  try {
    const url = `${BASE}/${encodeURIComponent(params.id)}`
    const r = await fetch(url, { method: "DELETE" })
    const ok = r.ok
    return NextResponse.json({ ok }, { status: ok ? 200 : r.status })
  } catch (e) {
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


