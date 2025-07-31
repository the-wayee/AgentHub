import { useState, useEffect } from 'react'
import type { ChatSession, Message } from '../types/chat'
import type { MessageDTO } from '../types/message'
import type { StreamResponse, SendMessageRequest } from '../types/api'
import { API_CONFIG } from '../lib/config'

interface UseSessionManagerResult {
  chatSessions: ChatSession[]
  currentSessionId: string
  currentMessages: Message[]
  isLoading: boolean
  loadSessionMessages: (sessionId: string) => Promise<void>
  sendMessage: (content: string, options: {
    model: string
    tool: string
    knowledgeBase: string
  }) => Promise<void>
  createNewSession: (sessionData?: { title: string; description?: string }) => Promise<void>
  deleteSession: (sessionId: string) => void
  selectSession: (sessionId: string) => Promise<void>
}

export function useSessionManager(): UseSessionManagerResult & { loadSessions: (showArchived: boolean) => Promise<void> } {
  const [chatSessions, setChatSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string>("")
  const [isLoading, setIsLoading] = useState(false)

    // 初始加载会话列表
    useEffect(() => {
    loadSessions(false)
  }, [])

  // 获取当前会话的消息
  const currentMessages = chatSessions.find((s) => s.id === currentSessionId)?.messages || []

  // 加载会话消息
  const loadSessionMessages = async (sessionId: string) => {
    setIsLoading(true);
    try {
      console.log('开始加载消息，会话ID:', sessionId);
      const response = await fetch(`${API_CONFIG.BASE_URL}/conversation/session/${sessionId}/messages`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        credentials: 'include'
      });

      if (!response.ok) {
        throw new Error('加载消息失败');
      }

      const data = await response.json();
      const messages: MessageDTO[] = data.data;

      setChatSessions(sessions =>
        sessions.map(session =>
          session.id === sessionId
            ? {
                ...session,
                messages: messages.map(msg => ({
                  id: msg.id,
                  role: msg.role as "user" | "assistant",
                  content: msg.content,
                  timestamp: new Date(msg.createdAt),
                  reasonContent: msg.reasonContent,
                  reasoning: msg.reasoning,
                }))
              }
            : session
        )
      );
      console.log('消息加载成功:', messages.length, '条消息');
    } catch (error) {
      console.error("加载消息失败:", error);
      // 可以在这里添加错误处理UI
    } finally {
      setIsLoading(false);
    }
  };

  // 加载会话列表
  const loadSessions = async (showArchived: boolean) => {
    setIsLoading(true);
    try {
      console.log('开始加载会话列表...');
    

      const url = new URL(`${API_CONFIG.BASE_URL}/conversation/session`);
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
      const sessions: ChatSession[] = data.data.map((session: any) => ({
        id: session.id,
        title: session.title,
        messages: [],
        createdAt: new Date(session.createdAt),
        updatedAt: new Date(session.updatedAt)
      }));

      setChatSessions(sessions);
      
      if (!currentSessionId && sessions.length > 0) {
        const firstSessionId = sessions[0].id;
        setCurrentSessionId(firstSessionId);
        await loadSessionMessages(firstSessionId);
      }
      console.log('会话列表加载成功:', sessions);
    } catch (error) {
      console.error("加载会话列表失败:", error);
      // 可以在这里添加错误处理UI
    } finally {
      setIsLoading(false);
    }
  };

  // 发送消息的 SSE 处理
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
        
        buffer = lines.pop() || '';
        for (const line of lines) {
          if (line.trim()) {
            try {
              const jsonStr = line.replace(/^data:\s*/, '').trim();
              if (jsonStr) {
                const data = JSON.parse(jsonStr) as StreamResponse;
                onToken(data);
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
  const sendMessage = async (content: string, options: { model: string, tool: string, knowledgeBase: string }) => {
    if (!content.trim() || isLoading || !currentSessionId) {
      return;
    }

    const currentSession = chatSessions.find((s) => s.id === currentSessionId);
    if (!currentSession) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: content.trim(),
      timestamp: new Date(),
    };

    // 更新会话
    const updatedMessages = [...currentSession.messages, userMessage];
    const updatedTitle = currentSession.messages.length === 0
      ? content.slice(0, 50) + (content.length > 50 ? "..." : "")
      : currentSession.title;

    setChatSessions((sessions) =>
      sessions.map((s) => (
        s.id === currentSessionId 
          ? {
              ...s,
              title: updatedTitle,
              messages: updatedMessages,
              updatedAt: new Date(),
            }
          : s
      ))
    );

    setIsLoading(true);
    let responseContent = '';
    let responseReasonContent = '';

    try {
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
              }
            : s
        )
      );

      await postSSE(
        `${API_CONFIG.BASE_URL}/conversation/chat/${currentSessionId}`,
        {
          content: content.trim(),
          ...options
        },
        (data) => {
          if (!data.reasoning) {
            responseContent += data.content;
          }
          if (data.reasoning) {
            responseReasonContent += data.reasonContent;
          }
          if (data.content || data.reasonContent) {
            setChatSessions((sessions) =>
              sessions.map((s) =>
                s.id === currentSessionId
                  ? {
                      ...s,
                      messages: s.messages.map((msg) =>
                        msg.id === assistantMessageId
                          ? {
                              ...msg,
                              content: responseContent,
                              reasonContent: responseReasonContent,
                              reasoning: data.reasoning,
                            }
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
      console.error("发送消息失败:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // 创建新会话
  const createNewSession = async (sessionData?: { title: string; description?: string }) => {
    try {
      const response = await fetch(`${API_CONFIG.BASE_URL}/conversation/session`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          title: sessionData?.title || `Chat ${chatSessions.length + 1}`,
          description: sessionData?.description || '',
        }),
        credentials: 'include'
      });
      if (!response.ok) {
        throw new Error('创建会话失败');
      }
      const data = await response.json();
      const newSession: ChatSession = {
        id: data.data.id,
        title: data.data.title,
        messages: [],
        createdAt: new Date(data.data.createdAt),
        updatedAt: new Date(data.data.updatedAt),
      };
      setChatSessions([newSession, ...chatSessions]);
      setCurrentSessionId(newSession.id);
    } catch (error) {
      console.error("创建会话失败:", error);
    }
  };

  // 删除会话不再弹窗，由 UI 层控制
  const deleteSession = (sessionId: string) => {
    fetch(`${API_CONFIG.BASE_URL}/conversation/session/${sessionId}`, {
        method: 'DELETE',
      headers: { 'Accept': 'application/json' },
        credentials: 'include'
    })
      .then(response => {
        if (!response.ok) throw new Error('删除会话失败')
      const updatedSessions = chatSessions.filter((s) => s.id !== sessionId);
      setChatSessions(updatedSessions);
      if (currentSessionId === sessionId && updatedSessions.length > 0) {
        setCurrentSessionId(updatedSessions[0].id);
      }
      })
      .catch(error => {
      console.error("删除会话失败:", error);
      })
    }

  // 选择会话
  const selectSession = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    await loadSessionMessages(sessionId);
  };

  return {
    chatSessions,
    currentSessionId,
    currentMessages,
    isLoading,
    loadSessionMessages,
    sendMessage,
    createNewSession,
    deleteSession,
    selectSession,
    loadSessions, // 新增暴露
  };
}
