"use client"

import { useAgentCatalog } from "@/lib/stores"
import { useEffect, useState } from "react"

export function AppLoadingOverlay() {
  const { loading, rehydrated } = useAgentCatalog()
  const [showSplash, setShowSplash] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)

  useEffect(() => {
    // 开屏动画固定显示2秒后开始淡出
    const splashTimer = setTimeout(() => {
      setIsFadingOut(true)
      // 淡出动画持续0.5秒，然后完全隐藏
      setTimeout(() => {
        setShowSplash(false)
      }, 500)
    }, 2000)

    return () => clearTimeout(splashTimer)
  }, [])

  // 始终显示开屏动画，直到计时器结束
  const shouldShow = showSplash || (loading && !rehydrated)

  if (!shouldShow) return null

  return (
    <>
      {/* 预加载CSS动画样式到头部 */}
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes splash-fade-in {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }

          @keyframes splash-slide-up {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes splash-fade-out {
            from {
              opacity: 1;
              transform: scale(1);
            }
            to {
              opacity: 0;
              transform: scale(0.95);
            }
          }

          .splash-fade-in {
            animation: splash-fade-in 0.8s ease-out;
          }

          .splash-slide-up {
            animation: splash-slide-up 0.8s ease-out 0.2s both;
          }

          .splash-slide-up-delay {
            animation: splash-slide-up 0.8s ease-out 0.4s both;
          }

          .splash-fade-in-delay {
            animation: splash-fade-in 0.8s ease-out 0.6s both;
          }

          .splash-fade-out {
            animation: splash-fade-out 0.5s ease-in forwards;
          }
        `
      }} />

      <div className={`fixed inset-0 z-[60] bg-gradient-to-br from-gray-50 via-white to-gray-100 flex items-center justify-center transition-opacity duration-500 ${isFadingOut ? 'opacity-0' : 'opacity-100'}`}>
        <div className={`flex flex-col items-center gap-8 ${isFadingOut ? 'splash-fade-out' : 'splash-fade-in'}`}>
          {/* Logo区域 */}
          <div className="relative">
            <div className="w-24 h-24 rounded-2xl bg-white border-2 border-gray-200 flex items-center justify-center shadow-lg animate-pulse">
              <svg className="w-12 h-12 text-gray-800" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            {/* 光环效果 - 改为灰色 */}
            <div className="absolute inset-0 w-24 h-24 rounded-2xl bg-gray-300/20 blur-xl animate-ping" />
          </div>

          {/* 文字区域 */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl font-bold text-gray-800 splash-slide-up">
              科技，引领生活
            </h1>
            <p className="text-lg text-gray-600 splash-slide-up-delay">
              探索智能AI的无限可能
            </p>
          </div>

        </div>
      </div>
    </>
  )
}



