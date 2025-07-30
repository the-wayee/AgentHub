import type { Message } from "../types/chat"
import { Smile, Bot } from 'lucide-react'

interface MessageBubbleProps {
  message: Message
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const formatTime = (date: Date): string => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const isUser = message.role === "user"
  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} animate__animated animate__fadeInUp`}> 
      <div
        className={`relative rounded-2xl p-4 max-w-xs lg:max-w-md break-words shadow-md transition-all duration-300 ${
          isUser
            ? "bg-gradient-to-br from-blue-400 to-blue-600 text-white"
            : "bg-gradient-to-br from-pink-100 via-blue-100 to-green-100 dark:from-gray-700 dark:via-gray-800 dark:to-gray-700 text-gray-900 dark:text-gray-100"
        }`}
        style={{ borderBottomRightRadius: isUser ? 8 : 32, borderBottomLeftRadius: isUser ? 32 : 8 }}
      >
        <div className="flex items-center gap-2 mb-1">
          {isUser ? <Smile className="w-4 h-4 opacity-70" /> : <Bot className="w-4 h-4 opacity-70" />}
          <span className="text-xs opacity-60">{isUser ? '我' : 'AI'}</span>
        </div>
        <div className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</div>
        <div
          className={`text-xs mt-2 opacity-70 text-right ${
            isUser ? "text-blue-100" : "text-gray-500 dark:text-gray-400"
          }`}
        >
          {formatTime(message.timestamp)}
        </div>
      </div>
    </div>
  )
}
