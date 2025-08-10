import type { ReactNode } from "react"
import { TopNav } from "@/components/top-nav"

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopNav />
      <main className="flex-1">{children}</main>
    </div>
  )
}
