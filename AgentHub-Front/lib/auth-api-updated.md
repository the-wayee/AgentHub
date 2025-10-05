# 认证API路径更新说明

所有认证相关的API调用现在都已添加了正确的 `/api` 前缀。

## 更新的API路径

### 1. 认证相关接口 (不需要Token)
- `GET /api/get-captcha` - 获取图形验证码
- `POST /api/send-email-code` - 发送邮箱验证码
- `GET /api/account-available?account=xxx` - 检查账号可用性
- `POST /api/login` - 用户登录
- `POST /api/register` - 用户注册
- `POST /api/send-reset-password-code` - 发送重置密码验证码

### 2. 需要认证的接口 (自动携带Token)
- `GET /api/user/current` - 获取当前用户信息

## 特性说明

### 401状态码处理
- 所有API调用都会自动检测401状态码
- 当收到401时，自动重定向到登录页面
- 自动保存当前页面路径，登录成功后重定向回去

### Token管理
- 登录成功后自动保存Token到localStorage
- 除登录/注册接口外，所有API请求都会自动携带Bearer Token
- 401时自动清除本地存储的认证信息

### 实时验证
- 注册页面邮箱输入框失焦时自动检查账号可用性
- 使用 `checkAccountAvailable` API
- 显示实时验证状态反馈

## 测试方法

1. 开发服务器运行在: http://localhost:3001
2. 登录页面: http://localhost:3001/login
3. 注册页面: http://localhost:3001/register

所有API调用现在都会正确访问 `http://localhost:8080/api/*` 端点。