"use client"
import type { ChatSession } from "../types/chat"
import { Plus, Trash2 } from "lucide-react"

interface SessionSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onNewSession: () => void
  onDeleteSession: (sessionId: string) => void
  showArchived: boolean
  onToggleArchived: () => void
}

export function SessionSidebar({
  sessions,
  currentSessionId,
  onSelectSession,
  onNewSession,
  onDeleteSession,
  showArchived,
  onToggleArchived
}: SessionSidebarProps) {
  const formatDate = (date: Date): string => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (days === 0) return "Today"
    if (days === 1) return "Yesterday"
    if (days < 7) return `${days} days ago`
    return date.toLocaleDateString()
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="p-4 border-b border-gray-200 dark:border-gray-700 space-y-2">
        <button
          onClick={onNewSession}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Chat
        </button>

        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm text-gray-600 dark:text-gray-300">显示归档</span>
          <button
            onClick={onToggleArchived}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
              showArchived ? 'bg-blue-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            role="switch"
            aria-checked={showArchived}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                showArchived ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Sessions list */}
      <div className="flex-1 overflow-y-auto p-2">
        {sessions.map((session) => (
          <div
            key={session.id}
            className={`group flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors duration-200 mb-2 ${
              session.id === currentSessionId
                ? "bg-blue-100 dark:bg-blue-900 text-blue-900 dark:text-blue-100"
                : "hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
            }`}
            onClick={() => onSelectSession(session.id)}
          >
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate">{session.title}</div>
              <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(session.updatedAt)}</div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDeleteSession(session.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
