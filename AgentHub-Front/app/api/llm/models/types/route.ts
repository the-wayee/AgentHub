export async function GET() {
  try {
    const res = await fetch('http://localhost:8080/api/llm/models/types', {
      cache: 'no-store'
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
