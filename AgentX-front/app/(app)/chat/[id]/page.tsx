import { ChatPageClient } from "@/components/chat/chat-page-client"
import { useWorkspaceStore } from "@/lib/stores"

export default async function ChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const agentId = id || "demo"
  
  return <ChatPageClient agentId={agentId} />
}
