import { NextResponse } from "next/server"

export async function GET(_: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const base = (process.env.AGENTS_BASE || "http://localhost:8080/api/agent").replace(/\/$/, "")
  const url = `${base}/${encodeURIComponent(id)}/versions`
  try {
    const r = await fetch(url, { method: "GET", cache: "no-store" })
    const j = await r.json().catch(() => ({}))
    const list = Array.isArray(j) ? j : j?.data ?? []
    return new NextResponse(JSON.stringify(list), { headers: { "content-type": "application/json", "x-backend-url": url } })
  } catch {
    return new NextResponse(JSON.stringify([]), { headers: { "content-type": "application/json", "x-backend-url": url } })
  }
}


