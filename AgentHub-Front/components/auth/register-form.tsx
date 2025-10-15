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
import { Badge } from "@/components/ui/badge"
import { authApi, type RegisterRequest, type CaptchaResponse } from "@/lib/auth-api"
import { cn } from "@/lib/utils"
import { Loader2, CheckCircle, XCircle, RefreshCw } from "lucide-react"

// 表单验证模式
const registerSchema = z.object({
  email: z.string().email("请输入有效的邮箱地址"),
  phone: z.string().optional(),
  password: z.string().min(6, "密码至少6位").max(20, "密码最多20位"),
  confirmPassword: z.string(),
  captchaCode: z.string().min(1, "请输入图形验证码"),
  emailCode: z.string().min(1, "请输入邮箱验证码"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "两次输入的密码不一致",
  path: ["confirmPassword"],
})

type RegisterFormData = z.infer<typeof registerSchema>

interface RegisterFormProps {
  onSuccess?: () => void
  className?: string
}

export function RegisterForm({ onSuccess, className }: RegisterFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [captcha, setCaptcha] = useState<CaptchaResponse | null>(null)
  const [isEmailChecking, setIsEmailChecking] = useState(false)
  const [emailCheckResult, setEmailCheckResult] = useState<{
    available: boolean | null
    message: string
  }>({ available: null, message: "" })
  const [emailCodeCountdown, setEmailCodeCountdown] = useState(0)

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
    trigger,
    getValues,
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  })

  const watchedEmail = watch("email")
  const watchedCaptchaCode = watch("captchaCode")

  // 加载图形验证码
  const loadCaptcha = async () => {
    try {
      const response = await authApi.getCaptcha()
      if (response.success && response.data) {
        setCaptcha(response.data)
        setValue("captchaCode", "")
      }
    } catch (err) {
    }
  }

  // 初始化加载验证码
  useEffect(() => {
    loadCaptcha()
  }, [])

  // 检查邮箱可用性
  const checkEmailAvailability = async (email: string) => {
    if (!email || !email.includes("@")) {
      setEmailCheckResult({ available: null, message: "" })
      return
    }

    setIsEmailChecking(true)
    try {
      const response = await authApi.checkAccountAvailable(email)
      if (response.success && response.data !== undefined) {
        setEmailCheckResult({
          available: response.data,
          message: response.message
        })
      }
    } catch (err) {
      setEmailCheckResult({
        available: null,
        message: "检查失败，请稍后重试"
      })
    } finally {
      setIsEmailChecking(false)
    }
  }

  // 邮箱失焦检查
  const handleEmailBlur = (email: string) => {
    checkEmailAvailability(email)
  }

  // 发送邮箱验证码
  const sendEmailCode = async () => {
    const email = getValues("email")
    const captchaCode = getValues("captchaCode")

    if (!email || !captchaCode || !captcha?.uuid) {
      setError("请先填写邮箱和图形验证码")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.sendEmailCode({
        email,
        captchaUuid: captcha.uuid,
        captchaCode,
      })

      if (response.success) {
        // 开始倒计时
        setEmailCodeCountdown(60)
        const timer = setInterval(() => {
          setEmailCodeCountdown((prev) => {
            if (prev <= 1) {
              clearInterval(timer)
              return 0
            }
            return prev - 1
          })
        }, 1000)
      } else {
        setError(response.message || "发送验证码失败")
        // 重新加载验证码
        loadCaptcha()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误，请稍后重试")
      loadCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmit = async (data: RegisterFormData) => {
    if (emailCheckResult.available === false) {
      setError("该邮箱已被占用")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const response = await authApi.register({
        email: data.email,
        phone: data.phone || undefined,
        password: data.password,
        code: data.emailCode,
      })

      if (response.success) {
        // 注册成功，跳转到登录页
        onSuccess?.()
        router.push("/login?message=注册成功，请登录")
      } else {
        setError(response.message || "注册失败")
        loadCaptcha()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "网络错误，请稍后重试")
      loadCaptcha()
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn("space-y-4", className)}>
      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* 邮箱输入 */}
      <div className="space-y-2">
        <Label htmlFor="email">邮箱</Label>
        <div className="relative">
          <Input
            id="email"
            type="email"
            placeholder="请输入邮箱地址"
            {...register("email")}
            onBlur={(e) => handleEmailBlur(e.target.value)}
            className={cn(
              "pr-10",
              errors.email && "border-destructive focus-visible:ring-destructive/20"
            )}
          />
          {/* 邮箱状态图标 */}
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            {isEmailChecking && (
              <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
            )}
            {!isEmailChecking && emailCheckResult.available !== null && (
              emailCheckResult.available ? (
                <CheckCircle className="w-4 h-4 text-green-500" />
              ) : (
                <XCircle className="w-4 h-4 text-destructive" />
              )
            )}
          </div>
        </div>
        {errors.email && (
          <p className="text-sm text-destructive">{errors.email.message}</p>
        )}
        {emailCheckResult.message && !errors.email && (
          <p className={cn(
            "text-sm",
            emailCheckResult.available ? "text-green-600" : "text-destructive"
          )}>
            {emailCheckResult.message}
          </p>
        )}
      </div>

      {/* 手机号输入 */}
      <div className="space-y-2">
        <Label htmlFor="phone">手机号（可选）</Label>
        <Input
          id="phone"
          type="tel"
          placeholder="请输入手机号"
          {...register("phone")}
          className={cn(
            errors.phone && "border-destructive focus-visible:ring-destructive/20"
          )}
        />
        {errors.phone && (
          <p className="text-sm text-destructive">{errors.phone.message}</p>
        )}
      </div>

      {/* 密码输入 */}
      <div className="space-y-2">
        <Label htmlFor="password">密码</Label>
        <Input
          id="password"
          type="password"
          placeholder="请输入密码（6-20位）"
          {...register("password")}
          className={cn(
            errors.password && "border-destructive focus-visible:ring-destructive/20"
          )}
        />
        {errors.password && (
          <p className="text-sm text-destructive">{errors.password.message}</p>
        )}
      </div>

      {/* 确认密码 */}
      <div className="space-y-2">
        <Label htmlFor="confirmPassword">确认密码</Label>
        <Input
          id="confirmPassword"
          type="password"
          placeholder="请再次输入密码"
          {...register("confirmPassword")}
          className={cn(
            errors.confirmPassword && "border-destructive focus-visible:ring-destructive/20"
          )}
        />
        {errors.confirmPassword && (
          <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>
        )}
      </div>

      {/* 图形验证码 */}
      <div className="space-y-2">
        <Label htmlFor="captchaCode">图形验证码</Label>
        <div className="flex gap-2">
          <Input
            id="captchaCode"
            type="text"
            placeholder="请输入验证码"
            {...register("captchaCode")}
            className={cn(
              "flex-1",
              errors.captchaCode && "border-destructive focus-visible:ring-destructive/20"
            )}
          />
          <Button
            type="button"
            variant="outline"
            onClick={loadCaptcha}
            disabled={!captcha}
            className="shrink-0 h-9 px-3 min-w-[120px]"
          >
            {captcha ? (
              <img
                src={`data:image/png;base64,${captcha.imageBase64}`}
                alt="验证码"
                className="h-6 w-auto object-contain"
              />
            ) : (
              <div className="flex items-center gap-1">
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span className="text-xs">加载中</span>
              </div>
            )}
          </Button>
        </div>
        {errors.captchaCode && (
          <p className="text-sm text-destructive">{errors.captchaCode.message}</p>
        )}
      </div>

      {/* 邮箱验证码 */}
      <div className="space-y-2">
        <Label htmlFor="emailCode">邮箱验证码</Label>
        <div className="flex gap-2">
          <Input
            id="emailCode"
            type="text"
            placeholder="请输入邮箱验证码"
            {...register("emailCode")}
            className={cn(
              "flex-1",
              errors.emailCode && "border-destructive focus-visible:ring-destructive/20"
            )}
          />
          <Button
            type="button"
            variant="outline"
            onClick={sendEmailCode}
            disabled={
              emailCodeCountdown > 0 ||
              !watchedEmail ||
              !watchedCaptchaCode ||
              !captcha ||
              emailCheckResult.available === false ||
              isLoading
            }
            className="shrink-0"
          >
            {emailCodeCountdown > 0 ? (
              <Badge variant="secondary">{emailCodeCountdown}s</Badge>
            ) : (
              "发送验证码"
            )}
          </Button>
        </div>
        {errors.emailCode && (
          <p className="text-sm text-destructive">{errors.emailCode.message}</p>
        )}
      </div>

      {/* 注册按钮 */}
      <Button
        type="submit"
        className="w-full"
        disabled={
          isLoading ||
          emailCheckResult.available === false ||
          !watchedEmail ||
          !watchedCaptchaCode
        }
      >
        {isLoading ? "注册中..." : "注册"}
      </Button>
    </form>
  )
}