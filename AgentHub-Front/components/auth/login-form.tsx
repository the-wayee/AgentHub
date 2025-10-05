"use client"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authApi, type LoginRequest } from "@/lib/auth-api"
import { cn } from "@/lib/utils"

// 表单验证模式
const loginSchema = z.object({
  account: z.string().min(1, "请输入账号"),
  password: z.string().min(6, "密码至少6位"),
  rememberMe: z.boolean().default(false),
})

type LoginFormData = z.infer<typeof loginSchema>

interface LoginFormProps {
  onSuccess?: () => void
  className?: string
}

export function LoginForm({ onSuccess, className }: LoginFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 获取重定向URL
  const redirectTo = searchParams.get('redirect') || '/'

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      rememberMe: false,
    },
  })

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.login({
        account: data.account,
        password: data.password,
      })

      if (response.success && response.data?.token) {
        // 保存token到localStorage
        localStorage.setItem("token", response.data.token)

        // 如果选择了记住我，保存账号信息
        if (data.rememberMe) {
          localStorage.setItem("rememberedAccount", data.account)
        } else {
          localStorage.removeItem("rememberedAccount")
        }

        // 登录成功回调
        onSuccess?.()

        // 跳转到重定向页面或主页
        router.push(redirectTo)
      } else {
        setError(response.message || "登录失败")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误，请稍后重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 获取记住的账号
  const rememberedAccount = typeof window !== "undefined"
    ? localStorage.getItem("rememberedAccount")
    : null

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 账号输入 */}
      <div className="space-y-2">
        <Label htmlFor="account">账号</Label>
        <Input
          id="account"
          type="text"
          placeholder="请输入邮箱或手机号"
          defaultValue={rememberedAccount || ""}
          {...register("account")}
          className={cn(
            errors.account && "border-destructive focus-visible:ring-destructive/20"
          )}
        />
        {errors.account && (
          <p className="text-sm text-destructive">{errors.account.message}</p>
        )}
      </div>

      {/* 密码输入 */}
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          placeholder="请输入密码"
          {...register("password")}
          className={cn(
            errors.password && "border-destructive focus-visible:ring-destructive/20"
          )}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* 记住我 */}
      <div className="flex items-center space-x-2">
        <Checkbox
          id="rememberMe"
          {...register("rememberMe")}
          defaultChecked={!!rememberedAccount}
        />
        <Label htmlFor="rememberMe" className="text-sm font-normal">
          记住账号
        </Label>
      </div>

      {/* 登录按钮 */}
      <Button
        type="submit"
        className="w-full"
        disabled={isLoading}
      >
        {isLoading ? "登录中..." : "登录"}
      </Button>
    </form>
  )
}