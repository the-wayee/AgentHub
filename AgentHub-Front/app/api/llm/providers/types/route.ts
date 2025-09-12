import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BACKEND_BASE = process.env.BACKEND_URL || "http://localhost:8080"

export async function GET() {
  const backendUrl = `${BACKEND_BASE}/api/llm/providers/types`
  try {
    const res = await fetch(backendUrl, { 
      method: "GET", 
      cache: "no-store",
      headers: {
        "Content-Type": "application/json"
      }
    })
    const text = await res.text()
    return new NextResponse(text, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json; charset=utf-8",
        "x-backend-url": backendUrl,
      },
    })
  } catch (e: any) {
    return NextResponse.json(
      { code: 500, message: "proxy_failed", error: e?.message },
      { status: 500, headers: { "x-backend-url": backendUrl } }
    )
  }
}