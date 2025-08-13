import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const backend = (process.env.LLM_PROTOCOLS_ENDPOINT || "http://localhost:8080/api/llm/providers/protocols").replace(/\/$/, "")
  try {
    const r = await fetch(backend, { cache: "no-store" })
    const j = await r.json()
    const list: string[] = Array.isArray(j) ? j : j?.data ?? []
    return NextResponse.json(list, { headers: { "x-backend-url": backend } })
  } catch {
    return NextResponse.json([])
  }
}


