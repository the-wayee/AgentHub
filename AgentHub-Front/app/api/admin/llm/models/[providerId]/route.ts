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

function transform(backend: any) {
	if (backend && typeof backend === "object") {
		const ok = backend.code === 200
		return { success: ok, data: backend.data, message: backend.message, code: backend.code }
	}
	return { success: false, message: "Invalid response" }
}

export async function GET(
	_request: NextRequest,
	{ params }: { params: Promise<{ providerId: string }> }
) {
	try {
		const { providerId } = await params
		const url = `${BACKEND_BASE}/admin/llm/models/${encodeURIComponent(providerId)}`
		const resp = await fetch(url, { method: "GET", cache: "no-store" })
		const text = await resp.text()
		const parsed = safeJsonParse(text)
		const result = transform(parsed)
		return NextResponse.json(result, { status: resp.ok ? 200 : resp.status, headers: { "x-backend-url": url } })
	} catch (err) {
		return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 })
	}
}
