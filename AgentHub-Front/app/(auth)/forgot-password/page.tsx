"use client"

import React from "react"
import Link from "next/link"
import { AuthLayout } from "@/components/auth/auth-layout"
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const { toast } = useToast()

  const handleResetSuccess = () => {
    toast({
      title: "密码重置成功",
      description: "您的密码已成功重置，请使用新密码登录",
    })
  }

  return (
    <AuthLayout
      title="忘记密码"
      subtitle="输入您的邮箱地址来重置密码"
      footer={
        <div className="text-center">
          <p className="text-sm text-muted-foreground">
            记起密码了？{" "}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              返回登录
            </Link>
          </p>
        </div>
      }
    >
      <ForgotPasswordForm onSuccess={handleResetSuccess} />
    </AuthLayout>
  )
}