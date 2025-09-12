import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BACKEND = (process.env.LLM_PROVIDERS_ENDPOINT || "http://localhost:8080/api/llm/providers").replace(/\/$/, "")

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const queryString = searchParams.toString()
  const backendUrl = `${BACKEND}${queryString ? `?${queryString}` : ""}`
  
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

export async function POST(req: Request) {
  const backendUrl = BACKEND
  try {
    const body = await req.text()
    const res = await fetch(backendUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body,
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



