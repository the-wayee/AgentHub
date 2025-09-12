"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Shield, Server, Database, Wrench, Activity, CheckCircle } from "lucide-react"

const adminLinks = [
  { href: "/admin", label: "Agent审核", icon: CheckCircle, exact: true },
  { href: "/admin/providers", label: "服务商", icon: Server },
  { href: "/admin/knowledge", label: "知识库", icon: Database },
  { href: "/admin/tools", label: "工具", icon: Wrench },
  { href: "/admin/monitoring", label: "监控", icon: Activity },
]

export function AdminSidebar() {
  const pathname = usePathname()

  return (
    <div className="w-64 border-r bg-muted/20 h-full overflow-hidden flex flex-col">
      <div className="p-4 border-b">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          <span className="font-semibold">后台管理</span>
        </div>
        <p className="text-xs text-muted-foreground mt-1">超级管理员控制台</p>
      </div>
      
      <nav className="flex-1 p-2 space-y-1">
        {adminLinks.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href)
          
          return (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive 
                  ? "bg-primary text-primary-foreground" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </Link>
          )
        })}
      </nav>
      
      <div className="p-4 border-t text-xs text-muted-foreground">
        <div>当前用户: 超级管理员</div>
        <div className="mt-1">权限级别: 最高</div>
      </div>
    </div>
  )
}
