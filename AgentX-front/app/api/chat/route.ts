import { type NextRequest, NextResponse } from "next/server"
import { generateText } from "ai"
import { xai } from "@ai-sdk/xai"
import { openai } from "@ai-sdk/openai"
import { groq } from "@ai-sdk/groq"

type ReqBody = {
  agent: any
  knowledge: { id: string; title: string; content: string }[]
  messages: { role: "user" | "assistant" | "system"; content: string }[]
}

function mockRespond(input: string, knowledge: ReqBody["knowledge"]) {
  // Simple mock: resolve some tools, do lightweight "RAG"
  const kb = knowledge
    .slice(0, 5)
    .map((k) => `- ${k.title}: ${k.content.slice(0, 120)}…`)
    .join("\n")
  let out = `（演示模式）我理解你的问题：“${input}”。我已参考你的私有知识库摘要：\n${kb || "（暂无知识）"}\n\n`
  // calculator like calc(1+2*3)
  const calcMatch = input.match(/calc$$([^)]+)$$/i)
  if (calcMatch) {
    try {
      // eslint-disable-next-line no-eval
      const val = Function(`"use strict"; return (${calcMatch[1]})`)()
      out += `计算结果：${val}\n`
    } catch {
      out += "无法计算该表达式。\n"
    }
  }
  out += "这是一个可扩展的占位回复。配置 API Key 后将由真实模型生成结果。"
  return out
}

export async function POST(req: NextRequest) {
  const body = (await req.json()) as ReqBody
  const last = body.messages[body.messages.length - 1]
  const userInput = last?.content || ""

  const hasXAI = !!process.env.XAI_API_KEY
  const hasOpenAI = !!process.env.OPENAI_API_KEY
  const hasGroq = !!process.env.GROQ_API_KEY

  try {
    if (hasXAI || hasOpenAI || hasGroq) {
      const provider = (body.agent?.model?.provider || "xai") as string
      const modelName = (body.agent?.model?.model || (provider === "xai" ? "grok-3" : "gpt-4o-mini")) as string

      const model = provider === "xai" ? xai(modelName) : provider === "groq" ? groq(modelName) : openai(modelName)

      const context =
        "You are an assistant for the AgentHub platform. Use the following private knowledge when relevant:\n" +
        body.knowledge.map((k) => `# ${k.title}\n${k.content}`).join("\n\n")

      const { text } = await generateText({
        model,
        prompt: `${context}\n\nUser: ${userInput}\nAssistant:`,
        temperature: body.agent?.model?.temperature ?? 0.6,
      })
      return NextResponse.json({ reply: text })
    }
    // Fallback mock
    const reply = mockRespond(userInput, body.knowledge)
    return NextResponse.json({ reply })
  } catch (e: any) {
    return NextResponse.json({ reply: "服务暂不可用，请稍后再试。" }, { status: 200 })
  }
}
