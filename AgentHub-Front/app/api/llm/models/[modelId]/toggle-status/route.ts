import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BACKEND_BASE = process.env.AGENTS_BASE || "http://localhost:8080/api"

function safeJsonParse(text: string) {
	try {
		return text ? JSON.parse(text) : { success: false }
	} catch (error) {
		console.error("Failed to parse response:", text)
		return { success: false, message: "Invalid response format", rawResponse: text }
	}
}

function transformBackendResponse(backend: any) {
	if (backend && typeof backend === "object") {
		const ok = backend.code === 200
		return { success: ok, data: backend.data, message: backend.message, code: backend.code }
	}
	return { success: false, message: "Invalid response" }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ modelId: string }> }
) {
  try {
    const { modelId } = await params
    const url = `${BACKEND_BASE}/llm/models/${encodeURIComponent(modelId)}/toggle-status`
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // TODO: 添加认证头
      },
      cache: "no-store"
    })

    const text = await response.text()
    const parsed = safeJsonParse(text)
    const result = transformBackendResponse(parsed)

    console.log('Model toggle status API:', {
      url,
      responseStatus: response.status,
      responseOk: response.ok,
      responseText: text,
      parsed,
      result
    })

    return NextResponse.json(result, { 
      status: response.ok ? 200 : response.status,
      headers: { "x-backend-url": url }
    })
  } catch (error) {
    console.error("Model toggle status API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}
