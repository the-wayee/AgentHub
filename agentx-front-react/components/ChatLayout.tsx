import { useState, useEffect } from 'react'
import { Menu } from 'lucide-react'
import { SessionSidebar } from './SessionSidebar'
import { ChatWindow } from './ChatWindow'
import { ChatInput } from './ChatInput'
import { ModelSelector } from './ModelSelector'
import { ToolSelector } from './ToolSelector'
import { KnowledgeBaseSelector } from './KnowledgeBaseSelector'
import { useSessionManager } from '../hooks/useSessionManager'
import 'antd/dist/reset.css'

// 默认可用模型
const AVAILABLE_MODELS = [
  { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
  { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
  { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
]

// 默认可用工具
const AVAILABLE_TOOLS = [
  { id: "none", name: "None", description: "No tools" },
  { id: "code-interpreter", name: "Code Interpreter", description: "Execute Python code" },
  { id: "image-generation", name: "Image Generation", description: "Generate images with DALL-E" },
  { id: "web-search", name: "Web Search", description: "Search the web for information" },
]

// 默认可用知识库
const AVAILABLE_KNOWLEDGE_BASES = [
  { id: "none", name: "None", description: "No knowledge base" },
  { id: "company-docs", name: "Company Documentation", description: "Internal company knowledge" },
  { id: "technical-docs", name: "Technical Documentation", description: "API and technical guides" },
  { id: "customer-support", name: "Customer Support", description: "Support articles and FAQs" },
]

export function ChatLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [selectedModel, setSelectedModel] = useState("gpt-4")
  const [selectedTool, setSelectedTool] = useState("none")
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState("none")

  const {
    chatSessions,
    currentSessionId,
    currentMessages,
    isLoading,
    sendMessage,
    createNewSession,
    deleteSession,
    selectSession,
    loadSessions,
  } = useSessionManager()

  useEffect(() => {
    loadSessions(showArchived)
  }, [showArchived])

  const handleSendMessage = (content: string) => {
    sendMessage(content, {
      model: selectedModel,
      tool: selectedTool,
      knowledgeBase: selectedKnowledgeBase
    })
  }

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen)
  const toggleArchivedSessions = () => setShowArchived(!showArchived)

  return (
    <div className="flex h-screen bg-gradient-to-br from-blue-100 via-pink-100 to-green-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 animate__animated animate__fadeIn">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md border border-blue-200 hover:scale-110 transition-transform"
      >
        <Menu className="w-6 h-6 text-blue-600" />
      </button>
      {/* Sidebar */}
      <div
        className={`fixed lg:relative inset-y-0 left-0 z-40 w-80 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <SessionSidebar
          sessions={chatSessions}
          currentSessionId={currentSessionId}
          onSelectSession={selectSession}
          onNewSession={createNewSession}
          onDeleteSession={deleteSession}
          showArchived={showArchived}
          onToggleArchived={toggleArchivedSessions}
        />
      </div>
      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          onClick={toggleSidebar}
          className="lg:hidden fixed inset-0 z-30 bg-black bg-opacity-50"
        />
      )}
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header with selectors */}
        <div className="bg-white/80 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4 shadow animate__animated animate__fadeInDown">
          <div className="flex flex-wrap gap-4 items-center">
            <ModelSelector
              selectedModel={selectedModel}
              models={AVAILABLE_MODELS}
              onModelChange={setSelectedModel}
            />
            <ToolSelector
              selectedTool={selectedTool}
              tools={AVAILABLE_TOOLS}
              onToolChange={setSelectedTool}
            />
            <KnowledgeBaseSelector
              selectedKnowledgeBase={selectedKnowledgeBase}
              knowledgeBases={AVAILABLE_KNOWLEDGE_BASES}
              onKnowledgeBaseChange={setSelectedKnowledgeBase}
            />
          </div>
        </div>
        {/* Chat window */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow messages={currentMessages} isLoading={isLoading} />
          {/* Chat input */}
          <ChatInput isLoading={isLoading} onSendMessage={handleSendMessage} />
        </div>
      </div>
    </div>
  )
}
