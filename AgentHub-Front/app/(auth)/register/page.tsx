"use client"

import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { RegisterForm } from "@/components/auth/register-form"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"

export default function RegisterPage() {
  const router = useRouter()
  const { toast } = useToast()

  const handleRegisterSuccess = () => {
    toast({
      title: "注册成功",
      description: "正在跳转到登录页面...",
    })
  }

  return (
    <AuthLayout
      title="注册"
      subtitle="创建您的 AgentHub 账户"
      footer={
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            已有账户？{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              立即登录
            </Link>
          </p>
        </div>
      }
    >
      <RegisterForm onSuccess={handleRegisterSuccess} />
    </AuthLayout>
  )
}