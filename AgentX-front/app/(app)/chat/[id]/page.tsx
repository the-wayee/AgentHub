import { ChatShell } from "@/components/chat/chat-shell"
import { WorkspaceSidebar } from "@/components/workspace-sidebar"

export default function ChatPage({ params }: { params: { id: string } }) {
  const agentId = params.id || "demo"
  return (
    <div className="grid lg:grid-cols-[300px_1fr] h-[calc(100vh-56px)] overflow-hidden">
      <aside className="hidden lg:block border-r bg-muted/20 h-full overflow-hidden">
        <WorkspaceSidebar defaultAgentId={agentId} currentAgentId={agentId} />
      </aside>
      <section className="flex flex-col min-h-0 overflow-hidden">
        <ChatShell agentId={agentId} />
      </section>
    </div>
  )
}
