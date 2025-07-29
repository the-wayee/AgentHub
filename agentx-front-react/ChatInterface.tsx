"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Menu } from 'lucide-react'
import { SessionSidebar } from "./components/SessionSidebar"
import { ChatWindow } from "./components/ChatWindow"
import { ChatInput } from "./components/ChatInput"
import { ModelSelector } from "./components/ModelSelector"
import { ToolSelector } from "./components/ToolSelector"
import { KnowledgeBaseSelector } from "./components/KnowledgeBaseSelector"
import type { ChatSession, Message, Model, Tool, KnowledgeBase } from "./types/chat"

// API 相关类型定义
interface StreamResponse {
  content: string;        // 响应内容
  sessionId?: string;     // 会话ID
  provider?: string;      // 使用的服务商
  model?: string;        // 使用的模型
  done: boolean;         // 是否完成
}

interface CreateAndChatRequest {
  content: string;
}

interface SendMessageRequest {
  content: string;
}

export default function ChatInterface() {
  // State management
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentSessionId, setCurrentSessionId] = useState<string>("")

  // Configuration state
  const [selectedModel, setSelectedModel] = useState<string>("gpt-4")
  const [selectedTool, setSelectedTool] = useState<string>("none")
  const [selectedKnowledgeBase, setSelectedKnowledgeBase] = useState<string>("none")

  // Mock data - Replace with actual API calls
  const [availableModels] = useState<Model[]>([
    { id: "gpt-4", name: "GPT-4", provider: "OpenAI" },
    { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", provider: "OpenAI" },
    { id: "claude-3", name: "Claude 3", provider: "Anthropic" },
    { id: "gemini-pro", name: "Gemini Pro", provider: "Google" },
  ])

  const [availableTools] = useState<Tool[]>([
    { id: "none", name: "None", description: "No tools" },
    { id: "code-interpreter", name: "Code Interpreter", description: "Execute Python code" },
    { id: "image-generation", name: "Image Generation", description: "Generate images with DALL-E" },
    { id: "web-search", name: "Web Search", description: "Search the web for information" },
  ])

  const [availableKnowledgeBases] = useState<KnowledgeBase[]>([
    { id: "none", name: "None", description: "No knowledge base" },
    { id: "company-docs", name: "Company Documentation", description: "Internal company knowledge" },
    { id: "technical-docs", name: "Technical Documentation", description: "API and technical guides" },
    { id: "customer-support", name: "Customer Support", description: "Support articles and FAQs" },
  ])

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([
    {
      id: "1",
      title: "Welcome Chat",
      messages: [
        {
          id: "1",
          role: "assistant",
          content: "Hello! How can I help you today?",
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    },
  ])

  // Get current messages
  const currentMessages = chatSessions.find((s) => s.id === currentSessionId)?.messages || []

  // Initialize current session
  useEffect(() => {
    if (chatSessions.length > 0 && !currentSessionId) {
      setCurrentSessionId(chatSessions[0].id)
    }
  }, [chatSessions, currentSessionId])

  // Event handlers
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const createNewSession = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: `Chat ${chatSessions.length + 1}`,
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }
    setChatSessions([newSession, ...chatSessions])
    setCurrentSessionId(newSession.id)
  }

  const deleteSession = (sessionId: string) => {
    const updatedSessions = chatSessions.filter((s) => s.id !== sessionId)
    setChatSessions(updatedSessions)
    if (currentSessionId === sessionId && updatedSessions.length > 0) {
      setCurrentSessionId(updatedSessions[0].id)
    }
  }

  const updateModel = (modelId: string) => {
    setSelectedModel(modelId)
  }

  const updateTool = (toolId: string) => {
    setSelectedTool(toolId)
  }

  const updateKnowledgeBase = (kbId: string) => {
    setSelectedKnowledgeBase(kbId)
  }

  // 通过 fetch POST 处理 SSE 流
  const postSSE = async (
    url: string,
    body: any,
    onToken: (data: StreamResponse) => void
  ): Promise<void> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      credentials: 'include',
    });
    if (!response.body) throw new Error('No response body');
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      let lines = buffer.split('\n');
      buffer = lines.pop() || '';
      for (const line of lines) {
        if (line.startsWith('data:')) {
          const json = line.replace(/^data:/, '').trim();
          if (json) {
            const data = JSON.parse(json) as StreamResponse;
            onToken(data);
            if (data.done) return;
          }
        }
      }
    }
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const currentSession = chatSessions.find((s) => s.id === currentSessionId);
    // 允许首次无会话

    // 添加用户消息
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    let updatedMessages: Message[] = [];
    let updatedTitle = "";
    let updatedSession: ChatSession | undefined = undefined;
    if (currentSession) {
      updatedMessages = [...currentSession.messages, userMessage];
      updatedTitle = currentSession.messages.length === 0
        ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
        : currentSession.title;
      updatedSession = {
        ...currentSession,
        title: updatedTitle,
        messages: updatedMessages,
        updatedAt: new Date(),
      };
      setChatSessions((sessions) =>
        sessions.map((s) => (s.id === currentSessionId ? updatedSession! : s))
      );
    }

    setIsLoading(true);

    let responseContent = '';
    const baseUrl = '/api';

    try {
      let sessionId = currentSessionId;
      if (!sessionId) {
        // 第一次：创建会话并发送消息
        await postSSE(
          `${baseUrl}/session/create-and-chat`,
          { content: content.trim() },
          (data) => {
            if (data.sessionId && !sessionId) {
              sessionId = data.sessionId;
              setCurrentSessionId(sessionId);
              // 新建会话
              setChatSessions((sessions) => [
                {
                  id: sessionId!,
                  title: content.slice(0, 50) + (content.length > 50 ? "..." : ""),
                  messages: [userMessage],
                  createdAt: new Date(),
                  updatedAt: new Date(),
                },
                ...sessions,
              ]);
            }
            if (data.content) {
              responseContent += data.content;
            }
          }
        );
      } else {
        // 后续：直接发送消息
        await postSSE(
          `${baseUrl}/chat/${sessionId}`,
          { content: content.trim() },
          (data) => {
            if (data.content) {
              responseContent += data.content;
            }
          }
        );
      }

      // 添加助手回复
      setChatSessions((sessions) =>
        sessions.map((s) =>
          s.id === sessionId
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: (Date.now() + 1).toString(),
                    role: "assistant",
                    content: responseContent,
                    timestamp: new Date(),
                  },
                ],
                updatedAt: new Date(),
              }
            : s
        )
      );
    } catch (error) {
      console.error("Error sending message:", error);
      // 可以添加错误提示UI
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
      {/* Mobile menu button */}
      <button
        onClick={toggleSidebar}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white dark:bg-gray-800 rounded-md shadow-md"
      >
        <Menu className="w-6 h-6" />
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
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
          <div className="flex flex-wrap gap-4 items-center">
            <ModelSelector
              selectedModel={selectedModel}
              models={availableModels}
              onModelChange={updateModel}
            />
            <ToolSelector
              selectedTool={selectedTool}
              tools={availableTools}
              onToolChange={updateTool}
            />
            <KnowledgeBaseSelector
              selectedKnowledgeBase={selectedKnowledgeBase}
              knowledgeBases={availableKnowledgeBases}
              onKnowledgeBaseChange={updateKnowledgeBase}
            />
          </div>
        </div>

        {/* Chat window */}
        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow messages={currentMessages} isLoading={isLoading} />

          {/* Chat input */}
          <ChatInput isLoading={isLoading} onSendMessage={sendMessage} />
        </div>
      </div>
    </div>
  );
}
