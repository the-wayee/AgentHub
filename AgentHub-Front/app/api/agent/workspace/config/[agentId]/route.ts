import { NextResponse } from "next/server"

export async function GET(
  req: Request, 
  { params }: { params: Promise<{ agentId: string }> }
) {
  const { agentId } = await params
  
  const backendUrl = `http://localhost:8080/api/agent/workspace/config/${encodeURIComponent(agentId)}`
  
  try {
    const response = await fetch(backendUrl, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
    })

    const result = await response.json().catch(() => ({}))

    return new NextResponse(JSON.stringify(result), {
      status: response.ok ? 200 : response.status,
      headers: {
        "Content-Type": "application/json",
        "x-backend-url": backendUrl,
      },
    })
  } catch (error) {
    return new NextResponse(
      JSON.stringify({ 
        code: 500, 
        message: "Failed to connect to backend",
        data: null 
      }),
      {
        status: 502,
        headers: {
          "Content-Type": "application/json",
          "x-backend-url": backendUrl,
        },
      }
    )
  }
}
