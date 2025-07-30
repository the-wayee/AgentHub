"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Send, Loader2 } from "lucide-react"
import { Input, Button } from 'antd'

interface ChatInputProps {
  isLoading: boolean
  onSendMessage: (message: string) => void
}

export function ChatInput({ isLoading, onSendMessage }: ChatInputProps) {
  const [message, setMessage] = useState("")
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSend = () => {
    if (message.trim() && !isLoading) {
      onSendMessage(message)
      setMessage("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="p-4 bg-white dark:bg-gray-800">
      <div className="flex gap-2 items-end animate__animated animate__fadeInUp">
        <div className="flex-1">
          <Input.TextArea
            ref={textareaRef as any}
            value={message}
            onChange={e => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message... (Enter to send, Shift+Enter for new line)"
            autoSize={{ minRows: 1, maxRows: 4 }}
            disabled={isLoading}
            style={{ borderRadius: 12, fontSize: 16, background: '#f4f8ff' }}
          />
        </div>
        <Button
          type="primary"
          shape="circle"
          size="large"
          onClick={handleSend}
          disabled={!message.trim() || isLoading}
          style={{ boxShadow: '0 2px 8px #91caff', background: 'linear-gradient(90deg, #4f8cff 0%, #6fd6ff 100%)' }}
          icon={isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
        />
      </div>
    </div>
  )
}
