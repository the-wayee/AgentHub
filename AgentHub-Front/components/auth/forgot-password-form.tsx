"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { authApi, type SendResetPasswordCodeRequest, type ResetPasswordRequest } from "@/lib/auth-api"
import { cn } from "@/lib/utils"
import { RefreshCw, Mail, Lock, ArrowLeft, ArrowRight } from "lucide-react"

// 步骤1的表单验证模式
const step1Schema = z.object({
  email: z.string().min(1, "请输入邮箱").email("请输入有效的邮箱地址"),
  captchaUuid: z.string().min(1, "验证码UUID不能为空"),
  captchaCode: z.string().min(1, "请输入图形验证码"),
})

// 步骤2的表单验证模式
const step2Schema = z.object({
  emailCode: z.string().min(1, "请输入邮箱验证码"),
  newPassword: z.string().min(6, "密码至少6位").max(20, "密码最多20位"),
  confirmPassword: z.string().min(1, "请确认密码"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

type Step1FormData = z.infer<typeof step1Schema>
type Step2FormData = z.infer<typeof step2Schema>

interface ForgotPasswordFormProps {
  onSuccess?: () => void
  className?: string
}

export function ForgotPasswordForm({ onSuccess, className }: ForgotPasswordFormProps) {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<1 | 2>(1)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captcha, setCaptcha] = useState<{ uuid: string; imageBase64: string } | null>(null)
  const [email, setEmail] = useState("")

  // 步骤1的表单控制
  const step1Form = useForm<Step1FormData>({
    resolver: zodResolver(step1Schema),
  })

  // 步骤2的表单控制
  const step2Form = useForm<Step2FormData>()

  // 加载图形验证码
  const loadCaptcha = async () => {
    try {
      const result = await authApi.getCaptcha()
      if (result.success && result.data) {
        setCaptcha(result.data)
        step1Form.setValue("captchaUuid", result.data.uuid)
      } else {
        setError("加载验证码失败，请重试")
      }
    } catch (err) {
      setError("加载验证码失败，请重试")
    }
  }

  // 初始化时加载验证码
  useEffect(() => {
    loadCaptcha()
  }, [])

  // 处理步骤1：发送验证码
  const handleStep1Submit = async (data: Step1FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const requestData: SendResetPasswordCodeRequest = {
        email: data.email,
        captchaUuid: data.captchaUuid,
        captchaCode: data.captchaCode,
      }

      const result = await authApi.sendResetPasswordCode(requestData)

      if (result.success) {
        setEmail(data.email)
        setCurrentStep(2)
      } else {
        setError(result.message || "发送验证码失败，请重试")
        // 刷新验证码
        await loadCaptcha()
      }
    } catch (err: any) {
      setError(err.message || "发送验证码失败，请重试")
      // 刷新验证码
      await loadCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  // 处理步骤2：重置密码
  const handleStep2Submit = async (data: Step2FormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const requestData: ResetPasswordRequest = {
        email: email,
        newPassword: data.newPassword,
        code: data.emailCode,
      }

      const result = await authApi.resetPassword(requestData)

      if (result.success) {
        onSuccess?.()
        // 延迟跳转到登录页面
        setTimeout(() => {
          router.push("/login?message=密码重置成功，请使用新密码登录")
        }, 1500)
      } else {
        setError(result.message || "重置密码失败，请重试")
      }
    } catch (err: any) {
      setError(err.message || "重置密码失败，请重试")
    } finally {
      setIsLoading(false)
    }
  }

  // 返回步骤1
  const handleBackToStep1 = () => {
    setCurrentStep(1)
    step2Form.reset()
    setError(null)
  }

  return (
    <div className={cn("space-y-6", className)}>
      {/* 步骤指示器 */}
      <div className="flex items-center justify-center space-x-2 mb-6">
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          currentStep === 1 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          1
        </div>
        <div className={cn(
          "w-12 h-0.5",
          currentStep === 2 ? "bg-primary" : "bg-muted"
        )} />
        <div className={cn(
          "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium",
          currentStep === 2 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        )}>
          2
        </div>
      </div>

      {/* 错误提示 */}
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {currentStep === 1 ? (
        // 步骤1：邮箱验证
        <form onSubmit={step1Form.handleSubmit(handleStep1Submit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">邮箱地址</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="请输入您的邮箱地址"
                className="pl-10"
                {...step1Form.register("email")}
              />
            </div>
            {step1Form.formState.errors.email && (
              <p className="text-sm text-destructive">{step1Form.formState.errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="captchaCode">图形验证码</Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <Input
                  id="captchaCode"
                  type="text"
                  placeholder="请输入验证码"
                  className="pr-10"
                  {...step1Form.register("captchaCode")}
                />
              </div>
              <div className="flex items-center space-x-2">
                {captcha && (
                  <img
                    src={`data:image/png;base64,${captcha.imageBase64}`}
                    alt="验证码"
                    className="h-10 border rounded"
                  />
                )}
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={loadCaptcha}
                  disabled={isLoading}
                  className="h-10 w-10"
                >
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {step1Form.formState.errors.captchaCode && (
              <p className="text-sm text-destructive">{step1Form.formState.errors.captchaCode.message}</p>
            )}
          </div>

          <Input type="hidden" {...step1Form.register("captchaUuid")} />

          <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
            {isLoading ? "发送中..." : "发送验证码"}
            {!isLoading && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </form>
      ) : (
        // 步骤2：重置密码
        <form onSubmit={step2Form.handleSubmit(handleStep2Submit)} className="space-y-4">
          <div className="mb-4 p-3 bg-muted/50 rounded-lg">
            <p className="text-sm text-muted-foreground">
              验证码已发送至: <span className="font-medium text-foreground">{email}</span>
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="emailCode">邮箱验证码</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="emailCode"
                type="text"
                placeholder="请输入邮箱验证码"
                className="pl-10"
                {...step2Form.register("emailCode")}
              />
            </div>
            {step2Form.formState.errors.emailCode && (
              <p className="text-sm text-destructive">{step2Form.formState.errors.emailCode.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="newPassword"
                type="password"
                placeholder="请输入新密码（6-20位）"
                className="pl-10"
                {...step2Form.register("newPassword")}
              />
            </div>
            {step2Form.formState.errors.newPassword && (
              <p className="text-sm text-destructive">{step2Form.formState.errors.newPassword.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">确认密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                id="confirmPassword"
                type="password"
                placeholder="请再次输入新密码"
                className="pl-10"
                {...step2Form.register("confirmPassword")}
              />
            </div>
            {step2Form.formState.errors.confirmPassword && (
              <p className="text-sm text-destructive">{step2Form.formState.errors.confirmPassword.message}</p>
            )}
          </div>

          <div className="flex space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleBackToStep1}
              disabled={isLoading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回上一步
            </Button>
            <Button type="submit" className="flex-1 cursor-pointer" disabled={isLoading}>
              {isLoading ? "重置中..." : "重置密码"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}