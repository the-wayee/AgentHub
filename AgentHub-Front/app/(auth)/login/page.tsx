"use client"

import React from "react"
import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { LoginForm } from "@/components/auth/login-form"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const message = searchParams.get("message")
  const { toast } = useToast()

  // 显示成功消息
  if (message) {
    // 使用useEffect来避免hydration问题
    React.useEffect(() => {
      toast({
        title: "成功",
        description: message,
      })
    }, [message, toast])
  }

  const handleLoginSuccess = () => {
    toast({
      title: "登录成功",
      description: "欢迎回到 AgentHub",
    })
  }

  return (
    <AuthLayout
      title="登录"
      subtitle="登录您的 AgentHub 账户"
      footer={
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            还没有账户？{" "}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              立即注册
            </Link>
          </p>
          <p className="text-xs text-muted-foreground">
            <Link
              href="/forgot-password"
              className="hover:underline"
            >
              忘记密码？
            </Link>
          </p>
        </div>
      }
    >
      <LoginForm onSuccess={handleLoginSuccess} />
    </AuthLayout>
  )
}