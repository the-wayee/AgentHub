import { Tool, UserTool } from './types'

// 模拟作者信息
export const mockAuthors = {
  'admin': { name: 'AgentHub 官方', avatar: '🏢' },
  'dev-user-1': { name: '张开发', avatar: '👨‍💻' },
  'dev-user-2': { name: '李设计', avatar: '🎨' },
  'dev-user-3': { name: '王工程师', avatar: '⚙️' },
  'dev-user-4': { name: '数据科学家', avatar: '📊' },
  'dev-user-5': { name: '效率专家', avatar: '⚡' },
  'dev-user-6': { name: '文本大师', avatar: '📝' },
}

// 模拟用户已安装的工具
export const mockUserTools: UserTool[] = [
  {
    id: "user-tool-1",
    userId: "user-123",
    name: "Web 搜索",
    description: "通过搜索引擎获取最新信息，支持多种搜索策略和结果过滤",
    icon: "🔍",
    subtitle: "实时搜索引擎",
    toolId: "tool-1",
    version: "2.1.0",
    toolList: [
      {
        name: "web_search",
        description: "搜索网络信息",
        parameters: {
          query: { type: "string", description: "搜索关键词" },
          max_results: { type: "number", description: "最大结果数", default: 10 }
        }
      }
    ],
    labels: ["搜索", "信息", "实用工具"],
    isOffice: true,
    publicState: true,
    createdAt: "2024-01-15T08:00:00Z",
    updatedAt: "2024-01-20T10:30:00Z"
  },
  {
    id: "user-tool-2",
    userId: "user-123",
    name: "代码生成器",
    description: "根据需求自动生成各种编程语言的代码片段和模板",
    icon: "💻",
    subtitle: "智能代码助手",
    toolId: "tool-5",
    version: "1.5.2",
    toolList: [
      {
        name: "generate_code",
        description: "生成代码",
        parameters: {
          language: { type: "string", description: "编程语言" },
          description: { type: "string", description: "代码功能描述" }
        }
      }
    ],
    labels: ["开发", "代码", "生产力"],
    isOffice: false,
    publicState: true,
    createdAt: "2024-02-01T09:15:00Z",
    updatedAt: "2024-02-05T14:20:00Z"
  },
  {
    id: "user-tool-3",
    userId: "user-123", 
    name: "文档转换",
    description: "支持多种文档格式之间的互相转换，包括PDF、Word、Markdown等",
    icon: "📄",
    subtitle: "文档格式转换工具",
    toolId: "tool-8",
    version: "3.0.1",
    toolList: [
      {
        name: "convert_document",
        description: "转换文档格式",
        parameters: {
          source_format: { type: "string", description: "源格式" },
          target_format: { type: "string", description: "目标格式" },
          content: { type: "string", description: "文档内容" }
        }
      }
    ],
    labels: ["文档", "转换", "办公"],
    isOffice: true,
    publicState: true,
    createdAt: "2024-01-25T11:00:00Z",
    updatedAt: "2024-02-10T16:45:00Z"
  }
]

// 模拟市场工具数据
export const mockMarketTools: Tool[] = [
  {
    id: "tool-1",
    name: "Web 搜索",
    description: "通过搜索引擎获取最新信息，支持多种搜索策略和结果过滤。可以搜索新闻、学术资料、技术文档等各类信息。内置智能排序算法，确保搜索结果的准确性和时效性。支持多种搜索模式：精确匹配、模糊搜索、语义搜索等。",
    icon: "🔍",
    subtitle: "实时搜索引擎",
    userId: "admin",
    labels: ["搜索", "信息", "实用工具"],
    toolType: "search",
    uploadType: "api",
    uploadUrl: "https://api.example.com/search",
    installCommand: {
      type: "npm",
      command: "npm install web-search-tool"
    },
    toolList: [
      {
        name: "web_search",
        description: "搜索网络信息",
        parameters: {
          query: { type: "string", description: "搜索关键词" },
          max_results: { type: "number", description: "最大结果数", default: 10 },
          search_type: { type: "string", description: "搜索类型", enum: ["general", "news", "academic", "images"] }
        }
      }
    ],
    status: "approved",
    isOffice: true,
    installCount: 15420,
    author: mockAuthors['admin'],
    changelog: "v2.1.0: 新增语义搜索功能，优化搜索结果排序算法",
    versions: [
      { version: "2.1.0", date: "2024-01-15", changelog: "新增语义搜索功能，优化搜索结果排序算法" },
      { version: "2.0.0", date: "2024-01-01", changelog: "重构搜索引擎，支持多种搜索模式" },
      { version: "1.5.0", date: "2023-12-15", changelog: "添加图片搜索功能" },
      { version: "1.0.0", date: "2023-11-01", changelog: "初始版本发布" }
    ],
    createdAt: "2024-01-01T00:00:00Z",
    updatedAt: "2024-01-15T12:00:00Z"
  },
  {
    id: "tool-2",
    name: "天气查询",
    description: "获取全球任意城市的实时天气和未来7天预报，支持多种天气数据源。提供详细的气象数据包括温度、湿度、风速、空气质量指数等。覆盖全球超过200,000个城市。",
    icon: "🌤️",
    subtitle: "全球天气预报",
    userId: "admin",
    labels: ["天气", "预报", "实用工具"],
    toolType: "weather",
    uploadType: "api",
    status: "approved",
    isOffice: true,
    installCount: 8943,
    author: mockAuthors['admin'],
    changelog: "v1.3.0: 新增空气质量指数和紫外线指数查询功能",
    versions: [
      { version: "1.3.0", date: "2024-01-16", changelog: "新增空气质量指数和紫外线指数查询功能" },
      { version: "1.2.0", date: "2023-12-20", changelog: "支持7天天气预报" },
      { version: "1.1.0", date: "2023-11-30", changelog: "添加多语言支持" },
      { version: "1.0.0", date: "2023-11-01", changelog: "初始版本发布" }
    ],
    toolList: [
      {
        name: "get_weather",
        description: "获取指定城市实时天气",
        parameters: {
          city: { type: "string", description: "城市名称" },
          units: { type: "string", description: "温度单位", enum: ["celsius", "fahrenheit"], default: "celsius" },
          lang: { type: "string", description: "语言", default: "zh-CN" }
        }
      },
      {
        name: "get_forecast",
        description: "获取7天天气预报",
        parameters: {
          city: { type: "string", description: "城市名称" },
          days: { type: "number", description: "预报天数", default: 7, max: 7 }
        }
      }
    ],
    createdAt: "2024-01-02T00:00:00Z",
    updatedAt: "2024-01-16T12:00:00Z"
  },
  {
    id: "tool-3",
    name: "翻译助手",
    description: "支持100+语言的实时翻译，包括文本翻译、语音翻译和图片文字识别翻译。基于先进的神经网络翻译技术，提供高质量的翻译结果。支持批量翻译和文档翻译。",
    icon: "🌐",
    subtitle: "多语言翻译工具",
    userId: "admin",
    labels: ["翻译", "语言", "国际化"],
    toolType: "translation",
    uploadType: "api",
    status: "approved",
    isOffice: true,
    installCount: 12567,
    author: mockAuthors['admin'],
    changelog: "v2.2.0: 新增OCR图片文字识别翻译功能",
    versions: [
      { version: "2.2.0", date: "2024-01-17", changelog: "新增OCR图片文字识别翻译功能" },
      { version: "2.1.0", date: "2024-01-05", changelog: "支持语音翻译功能" },
      { version: "2.0.0", date: "2023-12-10", changelog: "升级到神经网络翻译引擎" },
      { version: "1.0.0", date: "2023-10-15", changelog: "初始版本发布" }
    ],
    toolList: [
      {
        name: "translate_text",
        description: "翻译文本内容",
        parameters: {
          text: { type: "string", description: "要翻译的文本" },
          from: { type: "string", description: "源语言代码", default: "auto" },
          to: { type: "string", description: "目标语言代码" }
        }
      },
      {
        name: "translate_image",
        description: "识别并翻译图片中的文字",
        parameters: {
          image_url: { type: "string", description: "图片URL" },
          to: { type: "string", description: "目标语言代码" }
        }
      }
    ],
    createdAt: "2024-01-03T00:00:00Z",
    updatedAt: "2024-01-17T12:00:00Z"
  },
  {
    id: "tool-4",
    name: "计算器",
    description: "强大的科学计算器，支持基础运算、科学计算、单位转换等功能。内置了三角函数、对数、指数、阶乘等高级数学函数。支持表达式计算和历史记录。",
    icon: "🧮",
    subtitle: "科学计算工具",
    userId: "admin",
    labels: ["计算", "数学", "实用工具"],
    toolType: "calculator",
    uploadType: "builtin",
    status: "approved",
    isOffice: true,
    installCount: 6789,
    author: mockAuthors['admin'],
    changelog: "v1.4.0: 新增单位转换和表达式计算功能",
    versions: [
      { version: "1.4.0", date: "2024-01-18", changelog: "新增单位转换和表达式计算功能" },
      { version: "1.3.0", date: "2024-01-08", changelog: "添加科学计算函数" },
      { version: "1.2.0", date: "2023-12-01", changelog: "优化界面和计算精度" },
      { version: "1.0.0", date: "2023-10-01", changelog: "初始版本发布" }
    ],
    toolList: [
      {
        name: "calculate",
        description: "计算数学表达式",
        parameters: {
          expression: { type: "string", description: "数学表达式" },
          mode: { type: "string", description: "计算模式", enum: ["basic", "scientific"], default: "basic" }
        }
      },
      {
        name: "convert_unit",
        description: "单位转换",
        parameters: {
          value: { type: "number", description: "要转换的数值" },
          from_unit: { type: "string", description: "源单位" },
          to_unit: { type: "string", description: "目标单位" }
        }
      }
    ],
    createdAt: "2024-01-04T00:00:00Z",
    updatedAt: "2024-01-18T12:00:00Z"
  },
  {
    id: "tool-5",
    name: "代码生成器",
    description: "根据需求自动生成各种编程语言的代码片段、函数模板和完整项目结构",
    icon: "💻",
    subtitle: "智能代码助手",
    userId: "dev-user-1",
    labels: ["开发", "代码", "生产力"],
    toolType: "development",
    uploadType: "package",
    status: "approved",
    isOffice: false,
    createdAt: "2024-01-05T00:00:00Z",
    updatedAt: "2024-01-19T12:00:00Z"
  },
  {
    id: "tool-6",
    name: "图片处理",
    description: "强大的图片编辑工具，支持裁剪、滤镜、格式转换、压缩等功能",
    icon: "🎨",
    subtitle: "多功能图片编辑器",
    userId: "dev-user-2",
    labels: ["图片", "编辑", "多媒体"],
    toolType: "media",
    uploadType: "package",
    status: "approved",
    isOffice: false,
    createdAt: "2024-01-06T00:00:00Z",
    updatedAt: "2024-01-20T12:00:00Z"
  },
  {
    id: "tool-7",
    name: "邮件发送",
    description: "简单易用的邮件发送工具，支持HTML邮件、附件、批量发送等功能",
    icon: "📧",
    subtitle: "邮件发送助手",
    userId: "dev-user-3",
    labels: ["邮件", "通讯", "办公"],
    toolType: "communication",
    uploadType: "api",
    status: "approved",
    isOffice: false,
    createdAt: "2024-01-07T00:00:00Z",
    updatedAt: "2024-01-21T12:00:00Z"
  },
  {
    id: "tool-8",
    name: "文档转换",
    description: "支持多种文档格式之间的互相转换，包括PDF、Word、Markdown、HTML等格式。高保真度转换，保持文档格式和样式。支持批量转换和云端处理。",
    icon: "📄",
    subtitle: "文档格式转换工具",
    userId: "admin",
    labels: ["文档", "转换", "办公"],
    toolType: "document",
    uploadType: "api",
    status: "approved",
    isOffice: true,
    installCount: 5432,
    author: mockAuthors['admin'],
    changelog: "v1.5.0: 支持批量转换和更多文档格式",
    versions: [
      { version: "1.5.0", date: "2024-01-22", changelog: "支持批量转换和更多文档格式" },
      { version: "1.4.0", date: "2024-01-12", changelog: "优化PDF转换质量" },
      { version: "1.3.0", date: "2023-12-25", changelog: "添加Markdown支持" },
      { version: "1.0.0", date: "2023-11-08", changelog: "初始版本发布" }
    ],
    toolList: [
      {
        name: "convert_document",
        description: "转换文档格式",
        parameters: {
          file_url: { type: "string", description: "源文件URL" },
          from_format: { type: "string", description: "源格式", enum: ["pdf", "docx", "md", "html", "txt"] },
          to_format: { type: "string", description: "目标格式", enum: ["pdf", "docx", "md", "html", "txt"] }
        }
      },
      {
        name: "batch_convert",
        description: "批量转换文档",
        parameters: {
          file_urls: { type: "array", description: "文件URL列表" },
          to_format: { type: "string", description: "目标格式" }
        }
      }
    ],
    createdAt: "2024-01-08T00:00:00Z",
    updatedAt: "2024-01-22T12:00:00Z"
  },
  {
    id: "tool-9",
    name: "数据分析",
    description: "强大的数据分析工具，支持Excel处理、图表生成、统计分析等功能",
    icon: "📊",
    subtitle: "数据处理分析工具",
    userId: "dev-user-4",
    labels: ["数据", "分析", "统计"],
    toolType: "analytics",
    uploadType: "package",
    status: "pending",
    isOffice: false,
    createdAt: "2024-01-09T00:00:00Z",
    updatedAt: "2024-01-23T12:00:00Z"
  },
  {
    id: "tool-10",
    name: "时间管理",
    description: "高效的时间管理工具，支持番茄工作法、任务提醒、时间统计等功能",
    icon: "⏰",
    subtitle: "个人时间管理助手",
    userId: "dev-user-5",
    labels: ["时间", "管理", "生产力"],
    toolType: "productivity",
    uploadType: "package",
    status: "approved",
    isOffice: false,
    createdAt: "2024-01-10T00:00:00Z",
    updatedAt: "2024-01-24T12:00:00Z"
  },
  {
    id: "tool-11",
    name: "密码生成器",
    description: "安全的密码生成器，支持自定义规则、密码强度检测、密码管理等功能。采用加密随机数生成器，确保密码的不可预测性。支持多种密码策略和安全级别。",
    icon: "🔐",
    subtitle: "安全密码工具",
    userId: "admin",
    labels: ["安全", "密码", "实用工具"],
    toolType: "security",
    uploadType: "builtin",
    status: "approved",
    isOffice: true,
    installCount: 9876,
    author: mockAuthors['admin'],
    changelog: "v1.2.0: 新增密码强度检测和安全存储功能",
    versions: [
      { version: "1.2.0", date: "2024-01-25", changelog: "新增密码强度检测和安全存储功能" },
      { version: "1.1.0", date: "2024-01-15", changelog: "添加自定义密码规则" },
      { version: "1.0.0", date: "2023-11-11", changelog: "初始版本发布" }
    ],
    toolList: [
      {
        name: "generate_password",
        description: "生成安全密码",
        parameters: {
          length: { type: "number", description: "密码长度", default: 12, min: 8, max: 128 },
          include_uppercase: { type: "boolean", description: "包含大写字母", default: true },
          include_lowercase: { type: "boolean", description: "包含小写字母", default: true },
          include_numbers: { type: "boolean", description: "包含数字", default: true },
          include_symbols: { type: "boolean", description: "包含特殊字符", default: true }
        }
      },
      {
        name: "check_password_strength",
        description: "检测密码强度",
        parameters: {
          password: { type: "string", description: "要检测的密码" }
        }
      }
    ],
    createdAt: "2024-01-11T00:00:00Z",
    updatedAt: "2024-01-25T12:00:00Z"
  },
  {
    id: "tool-12",
    name: "文本处理",
    description: "多功能文本处理工具，支持格式化、编码转换、正则表达式匹配等",
    icon: "📝",
    subtitle: "文本编辑处理工具",
    userId: "dev-user-6",
    labels: ["文本", "处理", "编辑"],
    toolType: "text",
    uploadType: "package",
    status: "approved",
    isOffice: false,
    createdAt: "2024-01-12T00:00:00Z",
    updatedAt: "2024-01-26T12:00:00Z"
  }
]

// 根据筛选条件过滤工具
export function filterTools(
  tools: Tool[], 
  filters: {
    keyword?: string
    category?: string
    isOffice?: boolean
    status?: string
  }
): Tool[] {
  return tools.filter(tool => {
    // 关键词搜索
    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase()
      const searchText = `${tool.name} ${tool.description} ${tool.labels?.join(' ')}`.toLowerCase()
      if (!searchText.includes(keyword)) {
        return false
      }
    }

    // 分类筛选 (这里简化处理，可根据实际需求调整)
    if (filters.category && filters.category !== 'all') {
      const categoryMap: Record<string, string[]> = {
        productivity: ['生产力', 'productivity', '时间', '管理'],
        development: ['开发', '代码', 'development'],
        communication: ['通讯', '邮件', 'communication'],
        media: ['多媒体', '图片', '媒体', 'media'],
        utility: ['实用工具', '计算', '密码', '文本']
      }
      
      const categoryKeywords = categoryMap[filters.category] || []
      const hasCategory = categoryKeywords.some(keyword => 
        tool.labels?.some(label => label.includes(keyword)) ||
        tool.toolType.includes(keyword) ||
        (tool.description && tool.description.includes(keyword))
      )
      
      if (!hasCategory) {
        return false
      }
    }

    // 官方/社区筛选
    if (filters.isOffice !== undefined) {
      if (tool.isOffice !== filters.isOffice) {
        return false
      }
    }

    // 状态筛选
    if (filters.status && filters.status !== 'all') {
      if (tool.status !== filters.status) {
        return false
      }
    }

    return true
  })
}

// 分页处理
export function paginateTools(tools: Tool[], page: number, size: number) {
  const startIndex = (page - 1) * size
  const endIndex = startIndex + size
  return {
    data: tools.slice(startIndex, endIndex),
    total: tools.length,
    totalPages: Math.ceil(tools.length / size),
    currentPage: page,
    hasNext: endIndex < tools.length,
    hasPrev: page > 1
  }
}
