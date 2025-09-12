import type { ReactNode } from "react"
import { TopNav } from "@/components/top-nav"
import { AgentsLoader } from "@/components/agents-loader"
import { Toaster } from "@/components/ui/toaster"
import { AppLoadingOverlay } from "@/components/app-loading-overlay"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      {/* Load real agents from backend on app load */}
      <AgentsLoader />
      <AppLoadingOverlay />
      <main className="flex-1">{children}</main>
      <Toaster />
    </div>
  )
}
