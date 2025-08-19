"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Bot, Boxes, Home, Library, Settings2, Telescope, Menu, Shield, Server } from "lucide-react"
import { cn } from "@/lib/utils"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel } from "@/components/ui/dropdown-menu"
import { User } from "lucide-react"

import * as React from "react"

const links = [
  { href: "/chat/demo", label: "主页", icon: Home },
  { href: "/explore", label: "探索", icon: Telescope },
  { href: "/studio", label: "工作室", icon: Settings2 },
  { href: "/knowledge", label: "知识库", icon: Library },
  { href: "/providers", label: "服务商", icon: Server },
  { href: "/tools", label: "工具", icon: Boxes },
]

export function TopNav() {
  const pathname = usePathname()

  return (
    <header className="h-14 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-7xl mx-auto h-full px-4 flex items-center justify-between gap-4">
        <Link href="/chat/demo" className="flex items-center gap-2 font-semibold" prefetch={false}>
          <Bot className="w-5 h-5 text-primary" />
          <span>AgentHub</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              prefetch={false}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-muted",
                pathname.startsWith(href) && "bg-muted text-foreground",
              )}
            >
              <span className="inline-flex items-center gap-2">
                <Icon className="w-4 h-4" />
                {label}
              </span>
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3" style={{ marginRight: '120px' }}>
          <div className="hidden sm:block text-xs text-muted-foreground">构建你的 AI 社区</div>
          <div className="md:hidden">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  aria-label="打开菜单"
                  className="inline-flex items-center justify-center w-9 h-9 rounded-md border bg-background hover:bg-muted"
                >
                  <Menu className="w-5 h-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem asChild>
                  <Link href="/chat/demo" prefetch={false}>主页</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/explore" prefetch={false}>探索</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/studio" prefetch={false}>工作室</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/knowledge" prefetch={false}>知识库</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/providers" prefetch={false}>服务商</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/tools" prefetch={false}>工具</Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          {/* User menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="inline-flex items-center gap-2 px-2 h-9 rounded-md border bg-background hover:bg-muted">
                <User className="w-4 h-4" />
                <span className="text-sm">个人</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>账户</DropdownMenuLabel>
              <DropdownMenuItem asChild>
                <a href="#">个人设置</a>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuLabel>平台</DropdownMenuLabel>

              <DropdownMenuItem asChild>
                <Link href="/admin" prefetch={false}>
                  <Shield className="w-4 h-4 mr-2" /> 后台管理
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
