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
  sessionId: string;      // 会话ID
  provider: string;       // 使用的服务商
  model: string;         // 使用的模型
  done: boolean;         // 是否完成
}

interface CreateSessionRequest {
  title: string;
  description?: string;
}

interface SessionDTO {
  id: string;
  title: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

interface SendMessageRequest {
  content: string;
  model?: string;
  tool?: string;
  knowledgeBase?: string;
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
  const [showArchived, setShowArchived] = useState<boolean>(false)

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

  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])

  // Get current messages
  const currentMessages = chatSessions.find((s) => s.id === currentSessionId)?.messages || []

  // 加载会话列表
  useEffect(() => {
    const fetchSessions = async () => {
      try {
        const url = new URL('/api/conversation/session', window.location.origin);
        url.searchParams.set('archived', showArchived.toString());
        
        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json'
          },
          credentials: 'include'
        });

        if (!response.ok) {
          throw new Error('加载会话列表失败');
        }

        const data = await response.json();
        const sessions: SessionDTO[] = data.data;
        
        // 将 SessionDTO 转换为 ChatSession
        const chatSessions: ChatSession[] = sessions.map(session => ({
          id: session.id,
          title: session.title,
          messages: [], // 初始时消息列表为空，可以在选择会话时再加载消息
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt)
        }));

        setChatSessions(chatSessions);
      } catch (error) {
        console.error("加载会话列表失败:", error);
      }
    };

    fetchSessions();
  }, [showArchived])

  // 初始化：清除当前会话
  useEffect(() => {
    if (chatSessions.length === 0) {
      setCurrentSessionId("")
    }
  }, [chatSessions])

  // Event handlers
  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen)
  }

  const selectSession = (sessionId: string) => {
    setCurrentSessionId(sessionId)
    setSidebarOpen(false) // Close sidebar on mobile after selection
  }

  const createNewSession = async () => {
    try {
      const response = await fetch('/api/conversation/session', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: `Chat ${chatSessions.length + 1}`,
          description: '新的对话'
        } as CreateSessionRequest),
        credentials: 'include'
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || '创建会话失败');
      }
      
      const data = await response.json();
      const sessionDTO: SessionDTO = data.data;
      
      const newSession: ChatSession = {
        id: sessionDTO.id,
        title: sessionDTO.title,
        messages: [],
        createdAt: new Date(sessionDTO.createdAt),
        updatedAt: new Date(sessionDTO.updatedAt),
      }
      setChatSessions([newSession, ...chatSessions])
      setCurrentSessionId(newSession.id)
    } catch (error) {
      console.error("创建会话失败:", error);
    }
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

  const toggleArchivedSessions = () => {
    setShowArchived(!showArchived)
  }

  // 通过 fetch POST 处理 SSE 流
  const postSSE = async (
    url: string,
    body: any,
    onToken: (data: StreamResponse) => void
  ): Promise<void> => {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error('请求失败: ' + response.status);
    }
    
    if (!response.body) {
      throw new Error('No response body');
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let lastFlushTime = Date.now();

    try {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        
        // 保留最后一行（可能是不完整的）
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim()) {
            try {
              // 处理 SSE 格式，移除 "data:" 前缀
              const jsonStr = line.replace(/^data:\s*/, '').trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr) as StreamResponse;
                onToken(data);
                // 强制 React 立即更新
                await new Promise(resolve => setTimeout(resolve, 0));
                if (data.done) {
                  return;
                }
              }
            } catch (e) {
              console.error('解析 SSE 消息失败:', e, line);
            }
          }
        }

        // 如果缓冲区中有内容且距离上次刷新超过100ms，强制刷新
        const currentTime = Date.now();
        if (buffer && currentTime - lastFlushTime > 100) {
          const jsonStr = buffer.replace(/^data:\s*/, '').trim();
          if (jsonStr) {
            try {
              const data = JSON.parse(jsonStr) as StreamResponse;
              onToken(data);
              await new Promise(resolve => setTimeout(resolve, 0));
            } catch (e) {
              // 忽略不完整的JSON解析错误
            }
          }
          lastFlushTime = currentTime;
        }
      }
    } finally {
      reader.cancel();
    }
  };

  // 发送消息
  const sendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;
    
    if (!currentSessionId) {
      alert("请先创建会话");
      return;
    }

    const currentSession = chatSessions.find((s) => s.id === currentSessionId);

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
      if (!currentSessionId) {
        console.error("请先创建会话");
        return;
      }

      // 创建一个初始的助手回复消息
      const assistantMessageId = (Date.now() + 1).toString();
      setChatSessions((sessions) =>
        sessions.map((s) =>
          s.id === currentSessionId
            ? {
                ...s,
                messages: [
                  ...s.messages,
                  {
                    id: assistantMessageId,
                    role: "assistant",
                    content: "",
                    timestamp: new Date(),
                  },
                ],
                updatedAt: new Date(),
              }
            : s
        )
      );

      // 发送消息并流式更新回复内容
      await postSSE(
        `${baseUrl}/conversation/chat/${currentSessionId}`,
        {
          content: content.trim(),
          model: selectedModel,
          tool: selectedTool,
          knowledgeBase: selectedKnowledgeBase
        } as SendMessageRequest,
        (data) => {
          if (data.content) {
            responseContent += data.content;
            // 每次收到新内容就更新消息
            setChatSessions((sessions) =>
              sessions.map((s) =>
                s.id === currentSessionId
                  ? {
                      ...s,
                      messages: s.messages.map((msg) =>
                        msg.id === assistantMessageId
                          ? { ...msg, content: responseContent }
                          : msg
                      ),
                    }
                  : s
              )
            );
          }
        }
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
