"use client"

import { WorkspaceSidebar } from "@/components/workspace-sidebar"
import { ChatShell } from "@/components/chat/chat-shell"
import { useAgentCatalog, useWorkspaceStore } from "@/lib/stores"
import { Skeleton } from "@/components/ui/skeleton"

export function ChatPageClient({ agentId }: { agentId: string }) {
  const { loading } = useAgentCatalog()
  // 获取动态的currentAgentId，如果没有则使用URL中的agentId作为fallback
  const currentAgentId = useWorkspaceStore((s) => s.currentAgentId)
  const activeAgentId = currentAgentId || agentId
  
  return (
    <div className="grid lg:grid-cols-[300px_1fr] h-[calc(100vh-56px)] overflow-hidden">
      <aside className="hidden lg:block border-r bg-muted/20 h-full overflow-hidden">
        {loading ? (
          <div className="p-3 space-y-3">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : (
          <WorkspaceSidebar defaultAgentId={agentId} currentAgentId={activeAgentId} />
        )}
      </aside>
      <section className="flex flex-col min-h-0 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <ChatShell agentId={activeAgentId} />
        )}
      </section>
    </div>
  )
}


