<template>
    <div class="flex h-screen bg-gray-50">
      <!-- 左侧导航栏 -->
      <div class="w-64 bg-gray-900 text-white flex flex-col">
        <!-- 新建聊天按钮 -->
        <div class="p-4 border-b border-gray-700">
          <button
            @click="createNewChat"
            class="w-full flex items-center gap-3 px-4 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            <PlusIcon class="h-4 w-4" />
            <span>新建聊天</span>
          </button>
        </div>
  
        <!-- 聊天历史列表 -->
        <div class="flex-1 overflow-y-auto p-4">
          <div class="space-y-2">
            <div
              v-for="chat in chatHistory"
              :key="chat.id"
              @click="switchChat(chat.id)"
              :class="[
                'p-3 rounded-lg cursor-pointer transition-colors',
                currentChatId === chat.id ? 'bg-gray-700' : 'hover:bg-gray-800'
              ]"
            >
              <div class="text-sm font-medium truncate">{{ chat.title }}</div>
              <div class="text-xs text-gray-400 mt-1">{{ formatDate(chat.updatedAt) }}</div>
            </div>
          </div>
        </div>
      </div>
  
      <!-- 主聊天区域 -->
      <div class="flex-1 flex flex-col">
        <!-- 聊天头部 -->
        <div class="bg-white border-b border-gray-200 px-6 py-4">
          <h1 class="text-xl font-semibold text-gray-900">ChatGPT</h1>
          <div class="flex gap-4 items-center mt-2">
            <select v-model="model" class="border rounded px-2 py-1">
              <option v-for="item in modelOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
            <select v-model="provider" class="border rounded px-2 py-1">
              <option v-for="item in providerOptions" :key="item.value" :value="item.value">{{ item.label }}</option>
            </select>
            <label class="flex items-center gap-1">
              <input type="checkbox" v-model="stream" />
              流式
            </label>
          </div>
        </div>
  
        <!-- 消息列表 -->
        <div class="flex-1 overflow-y-auto px-6 py-4" ref="messagesContainer">
          <div class="max-w-3xl mx-auto space-y-6">
            <div
              v-for="message in currentMessages"
              :key="message.id"
              class="flex gap-4"
            >
              <!-- 头像 -->
              <div class="flex-shrink-0">
                <div
                  :class="[
                    'w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-medium',
                    message.role === 'user' ? 'bg-blue-500' : 'bg-green-500'
                  ]"
                >
                  {{ message.role === 'user' ? 'U' : 'AI' }}
                </div>
              </div>
  
              <!-- 消息内容 -->
              <div class="flex-1 min-w-0">
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="whitespace-pre-wrap">{{ message.message }}</div>
                  <div class="text-xs text-gray-500 mt-2">
                    {{ formatTime(message.timestamp) }}
                  </div>
                </div>
              </div>
            </div>
  
            <!-- 加载指示器 -->
            <div v-if="isLoading" class="flex gap-4">
              <div class="flex-shrink-0">
                <div class="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-medium">
                  AI
                </div>
              </div>
              <div class="flex-1 min-w-0">
                <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                  <div class="flex items-center gap-2">
                    <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                    <span class="text-gray-500">AI正在思考中...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
  
        <!-- 输入区域 -->
        <div class="bg-white border-t border-gray-200 px-6 py-4">
          <div class="max-w-3xl mx-auto">
            <div class="flex gap-4">
              <div class="flex-1">
                <textarea
                  v-model="inputMessage"
                  @keydown.enter.prevent="handleKeyDown"
                  placeholder="输入您的消息..."
                  rows="1"
                  class="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  :disabled="isLoading"
                ></textarea>
              </div>
              <button
                @click="sendMessage"
                :disabled="!inputMessage.trim() || isLoading"
                class="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
              >
                <SendIcon class="h-4 w-4" />
                发送
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  <script setup lang="ts">
  import { ref, computed, nextTick, onMounted } from 'vue'
  import { PlusIcon, SendIcon } from 'lucide-vue-next'
  
  // 类型定义
  interface Message {
    id: string
    role: 'user' | 'assistant'
    message: string
    timestamp: Date
  }
  
  interface ChatSession {
    id: string
    title: string
    messages: Message[]
    createdAt: Date
    updatedAt: Date
  }
  
  // 响应式数据
  const inputMessage = ref('')
  const isLoading = ref(false)
  const messagesContainer = ref<HTMLElement>()
  const currentChatId = ref<string>('')
  const chatHistory = ref<ChatSession[]>([])

  // 新增：模型、供应商、流式选项
  const model = ref('THUDM/GLM-4-9B-0414')
  const provider = ref('SiliconFlow')
  const stream = ref(true)

  const modelOptions = [
    { label: 'GLM-4-9B', value: 'THUDM/GLM-4-9B-0414' },
    { label: 'Qwen3-32B', value: 'Qwen/Qwen3-32B' },
    { label: 'Deepseek-R1', value: 'deepseek-ai/DeepSeek-R1' }
  ]
  const providerOptions = [
    { label: '硅基流动', value: 'SiliconFlow' },
    { label: '阿里云百炼', value: 'BaiLian' },
    { label: 'API2D', value: 'API2D' },
    { label: 'DeepSeek', value: 'DeepSeek' }
  ]
  
  // 计算属性
  const currentMessages = computed(() => {
    const currentChat = chatHistory.value.find((chat: ChatSession) => chat.id === currentChatId.value)
    return currentChat?.messages || []
  })
  
  // 生成唯一ID
  const generateId = () => Math.random().toString(36).substr(2, 9)
  
  // 创建新聊天
  const createNewChat = () => {
    const newChat: ChatSession = {
      id: generateId(),
      title: '新的聊天',
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date()
    }
    
    chatHistory.value.unshift(newChat)
    currentChatId.value = newChat.id
  }
  
  // 切换聊天
  const switchChat = (chatId: string) => {
    currentChatId.value = chatId
    nextTick(() => {
      scrollToBottom()
    })
  }
  
  // 发送消息
  const sendMessage = async (): Promise<void> => {
    if (!inputMessage.value.trim() || isLoading.value) return
  
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      message: inputMessage.value.trim(),
      timestamp: new Date()
    }
  
    // 添加用户消息
    addMessageToCurrentChat(userMessage)
    
    // 更新聊天标题（如果是第一条消息）
    updateChatTitle(userMessage.message)
    
    const messageContent = inputMessage.value.trim()
    inputMessage.value = ''
    isLoading.value = true
  
    try {
      // 创建AI消息占位符
      const aiMessage: Message = {
        id: generateId(),
        role: 'assistant',
        message: '',
        timestamp: new Date()
      }
      
      addMessageToCurrentChat(aiMessage)
      
      // 发送SSE请求
      await sendSSERequest(messageContent, aiMessage.id)
      
    } catch (error) {
      console.error('发送消息失败:', error)
      // 可以在这里添加错误处理，比如显示错误消息
    } finally {
      isLoading.value = false
    }
  }
  
  // 发送SSE请求
  const sendSSERequest = async (message: string, messageId: string): Promise<void> => {
    try {
      const response = await fetch('http://127.0.0.1:8888/conversation/chat/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          model: model.value,
          provider: provider.value,
          stream: stream.value
        })
      })
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
  
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
  
      if (!reader) {
        throw new Error('无法获取响应流')
      }
  
      let buffer = ''
      
      while (true) {
        const { done, value } = await reader.read()
        
        if (done) break
        
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        
        for (const line of lines) {

          if ((line as string).startsWith('data:')) {
            const data = line.slice(5)
            const parsed = JSON.parse(data)
            
            if (parsed.done === true || parsed === '') {
              return
            }
            
            try {
              if (parsed.message) {
                updateMessageContent(messageId, parsed.message)
              }
            } catch (e) {
              // 忽略解析错误
            }
          }
        }
      }
    } catch (error) {
      console.error('SSE请求失败:', error)
      updateMessageContent(messageId, '抱歉，发生了错误，请稍后重试。')
    }
  }
  
  // 更新消息内容（流式输出）
  const updateMessageContent = (messageId: string, newContent: string) => {
    const currentChat = chatHistory.value.find((chat: ChatSession) => chat.id === currentChatId.value)
    if (currentChat) {
      const message = currentChat.messages.find((msg: Message) => msg.id === messageId)
      if (message) {
        // 兼容 message.content/message.message
        if ('content' in message) {
          (message as any).content += newContent
        } else {
          message.message += newContent
        }
        nextTick(() => {
          scrollToBottom()
        })
      }
    }
  }
  
  // 添加消息到当前聊天
  const addMessageToCurrentChat = (message: Message) => {
    const currentChat = chatHistory.value.find((chat: ChatSession) => chat.id === currentChatId.value)
    if (currentChat) {
      currentChat.messages.push(message)
      currentChat.updatedAt = new Date()
      nextTick(() => {
        scrollToBottom()
      })
    }
  }
  
  // 更新聊天标题
  const updateChatTitle = (firstMessage: string) => {
    const currentChat = chatHistory.value.find((chat: ChatSession) => chat.id === currentChatId.value)
    if (currentChat && currentChat.messages.length === 1) {
      currentChat.title = firstMessage.slice(0, 30) + (firstMessage.length > 30 ? '...' : '')
    }
  }
  
  // 滚动到底部
  const scrollToBottom = () => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight
    }
  }
  
  // 处理键盘事件
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      sendMessage()
    }
  }
  
  // 格式化日期
  const formatDate = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (days === 0) {
      return '今天'
    } else if (days === 1) {
      return '昨天'
    } else if (days < 7) {
      return `${days}天前`
    } else {
      return date.toLocaleDateString()
    }
  }
  
  // 格式化时间
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit'
    })
  }
  
  // 组件挂载时创建第一个聊天
  onMounted(() => {
    createNewChat()
  })
  </script>
  <style scoped>
  /* 自定义滚动条样式 */
  ::-webkit-scrollbar {
    width: 6px;
  }
  
  ::-webkit-scrollbar-track {
    background: #f1f1f1;
  }
  
  ::-webkit-scrollbar-thumb {
    background: #c1c1c1;
    border-radius: 3px;
  }
  
  ::-webkit-scrollbar-thumb:hover {
    background: #a8a8a8;
  }
  
  /* 文本域自动调整高度 */
  textarea {
    min-height: 44px;
    max-height: 120px;
    overflow-y: auto;
  }
  </style>