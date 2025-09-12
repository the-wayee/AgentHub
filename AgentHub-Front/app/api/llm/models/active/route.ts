import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  const backendUrl = "http://localhost:8080/api/llm/models/active"
  try {
    const res = await fetch(backendUrl, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
      cache: "no-store",
    })
    const body = await res.text()
    const resp = new NextResponse(body, {
      status: res.status,
      headers: {
        "content-type": res.headers.get("content-type") || "application/json; charset=utf-8",
        "x-backend-url": backendUrl,
      },
    })
    return resp
  } catch (e: any) {
    return NextResponse.json(
      { code: 500, message: "proxy_failed", error: e?.message },
      { status: 500, headers: { "x-backend-url": backendUrl } }
    )
  }
}


