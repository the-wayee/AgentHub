"use client"

import { useAgentCatalog } from "@/lib/stores"
import { useEffect, useState } from "react"

export function AppLoadingOverlay() {
  const { loading, rehydrated } = useAgentCatalog()
  const [isInitialLoad, setIsInitialLoad] = useState(true)

  useEffect(() => {
    // 只在应用首次初始化时显示全局loading
    // 一旦rehydrated完成，就禁用全局loading，让各页面使用自己的骨架屏
    if (rehydrated) {
      const timer = setTimeout(() => {
        setIsInitialLoad(false)
      }, 500) // 给一个短暂的延迟确保数据已加载
      return () => clearTimeout(timer)
    }
  }, [rehydrated])

  // 只在应用初始化且还没有rehydrated时显示
  const shouldShow = loading && isInitialLoad && !rehydrated

  if (!shouldShow) return null
  
  return (
    <div className="fixed inset-0 z-[60] bg-background/70 backdrop-blur-sm flex items-center justify-center">
      <div className="flex flex-col items-center gap-2">
        <div className="animate-spin h-8 w-8 rounded-full border-2 border-primary border-t-transparent" />
        <div className="text-xs text-muted-foreground">正在初始化应用…</div>
      </div>
    </div>
  )
}



