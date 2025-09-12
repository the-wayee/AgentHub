import { NextRequest, NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const BACKEND_BASE = process.env.AGENTS_BASE || "http://localhost:8080/api"

// 安全的JSON解析函数
function safeJsonParse(text: string) {
  try {
    return text ? JSON.parse(text) : { success: false }
  } catch (error) {
    console.error("Failed to parse JSON response:", text)
    return { success: false, message: "Invalid response format", rawResponse: text }
  }
}

// 转换后端响应格式为前端期望的格式
function transformBackendResponse(backendResponse: any) {
  if (backendResponse && typeof backendResponse === 'object') {
    // 后端返回格式: { code: 200, message: "操作成功", data: [...] }
    // 前端期望格式: { success: true, data: [...] }
    const isSuccess = backendResponse.code === 200
    return {
      success: isSuccess,
      data: backendResponse.data,
      message: backendResponse.message,
      code: backendResponse.code
    }
  }
  return { success: false, message: "Invalid response" }
}

export async function GET(request: NextRequest) {
  try {
    const url = `${BACKEND_BASE}/admin/llm/providers`
    
    const response = await fetch(url, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // TODO: 添加认证头
      },
      cache: "no-store"
    })

    const data = await response.text()
    const parsedData = safeJsonParse(data)
    const result = transformBackendResponse(parsedData)

    return NextResponse.json(result, { 
      status: response.ok ? 200 : response.status,
      headers: { "x-backend-url": url }
    })
  } catch (error) {
    console.error("Admin providers API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const url = `${BACKEND_BASE}/admin/llm/providers`
    
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // TODO: 添加认证头
      },
      body: JSON.stringify(body),
      cache: "no-store"
    })

    const data = await response.text()
    const parsedData = safeJsonParse(data)
    const result = transformBackendResponse(parsedData)

    return NextResponse.json(result, { 
      status: response.ok ? 200 : response.status,
      headers: { "x-backend-url": url }
    })
  } catch (error) {
    console.error("Admin create provider API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const url = `${BACKEND_BASE}/admin/llm/providers`
    
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        // TODO: 添加认证头
      },
      body: JSON.stringify(body),
      cache: "no-store"
    })

    const data = await response.text()
    const parsedData = safeJsonParse(data)
    const result = transformBackendResponse(parsedData)

    return NextResponse.json(result, { 
      status: response.ok ? 200 : response.status,
      headers: { "x-backend-url": url }
    })
  } catch (error) {
    console.error("Admin update provider API error:", error)
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    )
  }
}