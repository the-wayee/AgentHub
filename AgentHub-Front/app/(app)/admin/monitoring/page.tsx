"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AdminPageSkeleton } from "@/components/ui/page-skeleton"
import { Activity, Users, MessageSquare, Zap, TrendingUp, AlertCircle, CheckCircle, Clock } from "lucide-react"

interface SystemMetrics {
  activeUsers: number
  totalSessions: number
  messagesPerHour: number
  systemLoad: number
  responseTime: number
  errorRate: number
}

interface SystemStatus {
  database: "healthy" | "warning" | "error"
  redis: "healthy" | "warning" | "error"
  api: "healthy" | "warning" | "error"
  storage: "healthy" | "warning" | "error"
}

export default function AdminMonitoringPage() {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    activeUsers: 0,
    totalSessions: 0,
    messagesPerHour: 0,
    systemLoad: 0,
    responseTime: 0,
    errorRate: 0
  })
  const [status, setStatus] = useState<SystemStatus>({
    database: "healthy",
    redis: "healthy", 
    api: "healthy",
    storage: "healthy"
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      // 模拟数据加载
      setMetrics({
        activeUsers: 1245,
        totalSessions: 8792,
        messagesPerHour: 3456,
        systemLoad: 65,
        responseTime: 234,
        errorRate: 0.12
      })
      setStatus({
        database: "healthy",
        redis: "healthy",
        api: "warning",
        storage: "healthy"
      })
      setLoading(false)
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "healthy": return <CheckCircle className="w-4 h-4 text-green-600" />
      case "warning": return <AlertCircle className="w-4 h-4 text-yellow-600" />
      case "error": return <AlertCircle className="w-4 h-4 text-red-600" />
      default: return <Clock className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "healthy": return "正常"
      case "warning": return "警告"
      case "error": return "错误"
      default: return "未知"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "healthy": return "bg-green-100 text-green-700"
      case "warning": return "bg-yellow-100 text-yellow-700"
      case "error": return "bg-red-100 text-red-700"
      default: return "bg-gray-100 text-gray-700"
    }
  }

  if (loading) {
    return <AdminPageSkeleton />
  }

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">系统监控</h1>
          <p className="text-sm text-muted-foreground">实时监控系统状态和性能指标</p>
        </div>
        <Button variant="outline">
          <Activity className="w-4 h-4 mr-2" />
          刷新数据
        </Button>
      </div>

      {/* 关键指标 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃用户</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.activeUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +12% 较昨日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总会话数</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalSessions.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +8% 较昨日
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">每小时消息数</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.messagesPerHour.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              <TrendingUp className="w-3 h-3 inline mr-1" />
              +5% 较昨日
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 系统状态 */}
      <Card>
        <CardHeader>
          <CardTitle>系统组件状态</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Object.entries(status).map(([component, componentStatus]) => (
              <div key={component} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  {getStatusIcon(componentStatus)}
                  <span className="font-medium capitalize">
                    {component === "database" ? "数据库" : 
                     component === "redis" ? "缓存" :
                     component === "api" ? "API服务" : "存储"}
                  </span>
                </div>
                <Badge className={getStatusColor(componentStatus)}>
                  {getStatusLabel(componentStatus)}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 性能指标 */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">系统负载</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.systemLoad}%</div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${metrics.systemLoad}%` }}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">平均响应时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.responseTime}ms</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.responseTime < 300 ? "响应良好" : "响应较慢"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">错误率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{metrics.errorRate}%</div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.errorRate < 1 ? "系统稳定" : "需要关注"}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
