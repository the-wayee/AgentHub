"use client"
import type { ChatSession } from "../types/chat"
import { Plus, Trash2, Star, UserCircle } from "lucide-react"
import { Modal, Input, Form, message as antdMessage } from 'antd'
import { useState } from 'react'

interface SessionSidebarProps {
  sessions: ChatSession[]
  currentSessionId: string
  onSelectSession: (sessionId: string) => void
  onNewSession: (sessionData?: { title: string; description?: string }) => void
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
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [createModalOpen, setCreateModalOpen] = useState(false)
  const [createForm] = Form.useForm()

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
          onClick={() => setCreateModalOpen(true)}
          className="w-full bg-gradient-to-r from-blue-400 via-pink-400 to-green-400 hover:from-blue-500 hover:to-green-500 text-white px-4 py-2 rounded-xl shadow-lg transition-all duration-300 flex items-center justify-center gap-2 animate__animated animate__pulse"
        >
          <Plus className="w-5 h-5 animate-spin-slow" />
          <span className="font-bold tracking-wide">新建会话</span>
        </button>
        {/* 新建会话弹窗 */}
        <Modal
          title="新建会话"
          open={createModalOpen}
          onCancel={() => setCreateModalOpen(false)}
          onOk={async () => {
            try {
              const values = await createForm.validateFields()
              setCreateModalOpen(false)
              createForm.resetFields()
              onNewSession(values)
            } catch {}
          }}
          okText="确定"
          cancelText="取消"
          centered
        >
          <Form form={createForm} layout="vertical">
            <Form.Item name="title" label="会话标题" rules={[{ required: true, message: '请输入标题' }]}> 
              <Input maxLength={30} placeholder="请输入会话标题" />
            </Form.Item>
            <Form.Item name="description" label="描述">
              <Input.TextArea maxLength={100} placeholder="可选，描述本次会话" />
            </Form.Item>
          </Form>
        </Modal>

        <div className="flex items-center justify-between px-2 py-1">
          <span className="text-sm text-blue-600 dark:text-blue-300 font-semibold">显示归档</span>
          <button
            onClick={onToggleArchived}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none border-2 border-blue-400 shadow ${
              showArchived ? 'bg-gradient-to-r from-blue-400 to-green-400' : 'bg-gray-200 dark:bg-gray-700'
            }`}
            role="switch"
            aria-checked={showArchived}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform shadow ${
                showArchived ? 'translate-x-6 bg-green-300' : 'translate-x-1'
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
            className={`group flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all duration-300 mb-3 shadow-sm border-2 ${
              session.id === currentSessionId
                ? "bg-gradient-to-r from-blue-100 via-pink-100 to-green-100 dark:from-blue-900 dark:via-gray-800 dark:to-green-900 text-blue-900 dark:text-blue-100 border-blue-400 shadow-lg scale-105"
                : "hover:bg-gradient-to-r hover:from-blue-50 hover:via-pink-50 hover:to-green-50 dark:hover:from-gray-800 dark:hover:via-gray-900 dark:hover:to-gray-800 text-gray-700 dark:text-gray-300 border-transparent hover:scale-102"
            }`}
            onClick={() => onSelectSession(session.id)}
            style={{ minHeight: 56 }}
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <span className={`flex items-center justify-center w-8 h-8 rounded-full shadow ${session.id === currentSessionId ? 'bg-gradient-to-br from-blue-400 to-green-400' : 'bg-gray-200 dark:bg-gray-700'}`}>
                <UserCircle className="w-6 h-6 text-blue-500 dark:text-blue-300" />
              </span>
              <div className="min-w-0">
                <div className="text-base font-semibold truncate flex items-center gap-1">
                  {session.title}
                  {session.id === currentSessionId && <Star className="w-4 h-4 text-yellow-400 animate__animated animate__tada" />}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">{formatDate(session.updatedAt)}</div>
              </div>
            </div>
            <button
              onClick={e => {
                e.stopPropagation()
                setDeleteId(session.id)
              }}
              className="opacity-0 group-hover:opacity-100 p-1 hover:bg-red-100 dark:hover:bg-red-900 rounded transition-all duration-200"
            >
              <Trash2 className="w-4 h-4 text-red-600" />
            </button>
          </div>
        ))}
        {/* 删除会话弹窗 */}
        <Modal
          title="删除会话"
          open={!!deleteId}
          onCancel={() => setDeleteId(null)}
          onOk={() => {
            if (deleteId) {
              onDeleteSession(deleteId)
              setDeleteId(null)
              antdMessage.success('会话已删除')
            }
          }}
          okText="删除"
          okButtonProps={{ danger: true }}
          cancelText="取消"
          centered
        >
          <div>确定要删除该会话吗？删除后不可恢复。</div>
        </Modal>
      </div>
    </div>
  )
}
