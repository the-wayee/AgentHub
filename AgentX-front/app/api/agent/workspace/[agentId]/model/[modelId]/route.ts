import { NextResponse } from "next/server"

export async function PUT(
  req: Request, 
  { params }: { params: Promise<{ agentId: string; modelId: string }> }
) {
  const { agentId, modelId } = await params
  const body = await req.json().catch(() => ({}))
  
  const backendUrl = `http://localhost:8080/api/agent/workspace/${encodeURIComponent(agentId)}/model/${encodeURIComponent(modelId)}`
  
  try {
    const response = await fetch(backendUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
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
      JSON.stringify({ ok: false, error: "Failed to connect to backend" }),
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
