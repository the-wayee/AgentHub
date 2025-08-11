"use client"

import { useAgentCatalog } from "@/lib/stores"

export function AppLoadingOverlay() {
  const { loading } = useAgentCatalog()
  if (!loading) return null
  return (
    <div className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
        <div className="text-xs text-muted-foreground">正在加载…</div>
      </div>
    </div>
  )
}


