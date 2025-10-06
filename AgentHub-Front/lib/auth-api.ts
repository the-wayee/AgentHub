import { apiFetch, apiFetchPublic } from "./api"

// 认证相关的类型定义
export interface LoginRequest {
  account: string
  password: string
}

export interface RegisterRequest {
  email: string
  phone?: string
  password: string
  code: string
}

export interface SendEmailCodeRequest {
  email: string
  captchaUuid: string
  captchaCode: string
}

export interface SendResetPasswordCodeRequest {
  email: string
  captchaUuid: string
  captchaCode: string
}

export interface ResetPasswordRequest {
  email: string
  newPassword: string
  code: string
}

export interface CaptchaResponse {
  uuid: string
  imageBase64: string
}

export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

// 认证相关的API调用
export const authApi = {
  // 获取图形验证码（不需要认证）
  getCaptcha: (): Promise<ApiResponse<CaptchaResponse>> => {
    return apiFetchPublic("/api/get-captcha")
  },

  // 发送邮箱验证码（不需要认证）
  sendEmailCode: (data: SendEmailCodeRequest): Promise<ApiResponse> => {
    return apiFetchPublic("/api/send-email-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  // 检查账号可用性（不需要认证）
  checkAccountAvailable: (account: string): Promise<ApiResponse<boolean>> => {
    return apiFetchPublic(`/api/account-available?account=${encodeURIComponent(account)}`)
  },

  // 登录（不需要认证）
  login: (data: LoginRequest): Promise<ApiResponse<{ token: string }>> => {
    return apiFetchPublic("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  // 注册（不需要认证）
  register: (data: RegisterRequest): Promise<ApiResponse> => {
    return apiFetchPublic("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  // 发送重置密码验证码（不需要认证）
  sendResetPasswordCode: (data: SendResetPasswordCodeRequest): Promise<ApiResponse> => {
    return apiFetchPublic("/api/send-reset-password-code", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  // 重置密码（不需要认证）
  resetPassword: (data: ResetPasswordRequest): Promise<ApiResponse> => {
    return apiFetchPublic("/api/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    })
  },

  // 需要认证的API（携带Token）
  // 这里可以添加需要登录后才能访问的认证相关API
  // 例如：修改密码、更新用户信息等
}

// 获取当前用户信息（需要认证）
export const getCurrentUser = async () => {
  return apiFetch("/api/user/current")
}