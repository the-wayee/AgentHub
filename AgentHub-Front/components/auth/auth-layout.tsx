"use client"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface AuthLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  footer?: React.ReactNode
  className?: string
}

export function AuthLayout({
  children,
  title,
  subtitle,
  footer,
  className
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-muted/20 p-4">
      {/* 背景装饰 */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-secondary/5 rounded-full blur-3xl" />
      </div>

      {/* 主要内容 */}
      <div className="relative w-full max-w-md">
        <div className="bg-background/80 backdrop-blur-sm border border-border/50 rounded-2xl shadow-xl shadow-primary/5 p-8">
          {/* Logo和标题 */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex items-center gap-2 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">A</span>
              </div>
              <span className="text-xl font-semibold">AgentHub</span>
            </Link>

            <h1 className="text-2xl font-bold tracking-tight mb-2">{title}</h1>
            {subtitle && (
              <p className="text-muted-foreground text-sm">{subtitle}</p>
            )}
          </div>

          {/* 表单内容 */}
          <div className="space-y-6">
            {children}
          </div>

          {/* 底部内容 */}
          {footer && (
            <div className="mt-8 pt-6 border-t border-border/50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}