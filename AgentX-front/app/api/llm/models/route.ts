export async function POST(request: Request) {
  try {
    const body = await request.json()
    
    // 代理到后端
    const res = await fetch('http://localhost:8080/api/llm/models', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body)
    })
    
    const result = await res.json()
    
    return Response.json(result)
  } catch (error) {
    return Response.json(
      { 
        code: 500, 
        message: '服务器内部错误', 
        data: null 
      }, 
      { status: 500 }
    )
  }
}
