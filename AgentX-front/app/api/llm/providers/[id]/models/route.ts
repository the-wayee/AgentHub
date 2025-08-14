import { NextRequest, NextResponse } from "next/server"

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: providerId } = await params
  
  try {
    const backendUrl = `http://localhost:8080/api/llm/models/${providerId}`
    const res = await fetch(backendUrl, { 
      cache: 'no-store',
      headers: {
        'Content-Type': 'application/json',
      }
    })
    
    const result = await res.json()
    
    return NextResponse.json(result, { 
      status: res.status,
      headers: { 
        "x-backend-url": backendUrl 
      } 
    })
  } catch (error) {
    console.error('Failed to fetch models:', error)
    return NextResponse.json(
      { 
        code: 500, 
        message: "获取模型列表失败", 
        data: [] 
      }, 
      { status: 500 }
    )
  }
}
