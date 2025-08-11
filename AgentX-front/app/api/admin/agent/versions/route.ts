import { NextResponse } from "next/server"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const status = searchParams.get("status")
  const base = (process.env.AGENTS_ADMIN_BASE || "http://localhost:8080/api/admin/agent").replace(/\/$/, "")
  const url = `${base}/versions${status ? `?status=${encodeURIComponent(status)}` : ""}`
  try {
    const r = await fetch(url, { cache: "no-store" })
    const j = await r.json().catch(() => ({}))
    return new NextResponse(JSON.stringify(j?.data ?? j ?? []), {
      headers: { "content-type": "application/json", "x-backend-url": url },
      status: 200,
    })
  } catch {
    return new NextResponse(JSON.stringify([]), { headers: { "content-type": "application/json", "x-backend-url": url } })
  }
}


