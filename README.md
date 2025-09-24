# AgentHub - 企业级AI智能体管理平台

[![Java](https://img.shields.io/badge/Java-17-orange.svg)](https://openjdk.java.net/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue.svg)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 🌟 项目概述

AgentHub 是一个基于**领域驱动设计（DDD）**架构的企业级AI智能体管理平台，采用**Spring Boot + Next.js**全栈技术栈。平台不仅仅是简单的聊天机器人，而是提供了**智能任务分解、自动化工作流、多模型集成**等先进功能的完整AI智能体生命周期管理系统。

### 🎯 核心价值主张

- **智能任务自动化**：将复杂用户请求自动分解为可执行的子任务
- **企业级架构**：DDD设计模式，支持高并发和水平扩展
- **多LLM集成**：统一管理多种AI模型提供商，支持灵活切换
- **可视化工作流**：完整的智能体开发、测试、发布工作流
- **生产就绪**：容器化部署，CI/CD集成，企业级监控和日志

---

## 🚀 核心特性

### 🤖 智能体管理引擎
- **版本控制**：完整的智能体版本管理系统，支持发布审核流程
- **类型支持**：聊天助手和功能型智能体两种类型
- **工作区管理**：用户自定义智能体配置和模型设置
- **生命周期管理**：草稿 → 审核 → 发布的完整流程

### 🔄 智能工作流系统
![Agent Workflow](https://img.shields.io/badge/Workflow-Intelligent-purple.svg)

平台核心的**8阶段智能工作流**：

```
初始化 → 问题分析 → 任务分解 → 分解完成 → 任务执行 → 执行完成 → 结果汇总 → 完成/失败
```

**关键工作流组件：**
- **问题分析器**：智能判断用户请求是简单问题还是复杂任务
- **任务分解器**：将复杂任务自动分解为可管理的子任务
- **上下文填充管理器**：自动检测信息完整性，询问缺失信息
- **事件驱动架构**：基于AgentEventBus的异步工作流处理

### 💬 对话与上下文管理
- **智能上下文窗口**：自动对话上下文管理和智能总结
- **多轮对话支持**：处理复杂的多步骤交互
- **信息完整性检查**：自动识别并请求缺失的关键信息
- **令牌管理**：精确的消息令牌计数和上下文优化

### 🌐 多LLM提供商集成
- **统一抽象层**：屏蔽不同LLM提供商的差异
- **热插拔支持**：运行时动态切换模型和提供商
- **配置管理**：灵活的API密钥和模型参数配置
- **成本优化**：智能模型选择和成本控制

### 🛠️ 任务管理系统
- **层次化任务结构**：支持父子任务关系和依赖管理
- **进度跟踪**：完整的任务生命周期状态追踪
- **结果聚合**：自动收集和汇总子任务执行结果
- **失败恢复**：智能错误处理和任务重试机制

---

## 🏗️ 技术架构

### 后端架构 (Java 17 + Spring Boot 3.5.3)

```
┌─────────────────────────────────────────────────────────────┐
│                    Interface Layer (接口层)                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ REST API    │ │   DTO       │ │Validation   │             │
│  │ Controllers │ │ Conversion  │ │   & Auth    │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                  Application Layer (应用层)                    │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │Agent Service│ │Conversation │ │   Workflow  │             │
│  │Management   │ │ Service     │ │  Service    │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│                    Domain Layer (领域层)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │   Entities  │ │ Value Objects│ │Domain Events│             │
│  │   & Aggregates│             │ │             │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────┐
│               Infrastructure Layer (基础设施层)                │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐             │
│  │ PostgreSQL  │ │LangChain4j  │ │   External  │             │
│  │   Database  │ │ Integration │ │  Services   │             │
│  └─────────────┘ └─────────────┘ └─────────────┘             │
└─────────────────────────────────────────────────────────────┘
```

### 核心技术栈

#### 后端技术
- **Java 17** + **Spring Boot 3.5.3** - 企业级Java框架
- **MyBatis-Plus 3.5.7** - 高性能ORM框架
- **PostgreSQL 15** - 企业级关系型数据库
- **LangChain4j 1.3.0** - AI模型集成框架
  - 支持OpenAI、阿里云百炼、智谱AI等
  - 集成MCP (Model Context Protocol)
- **FastJSON2** - 高性能JSON处理
- **事件驱动架构** - AgentEventBus异步消息处理

#### 前端技术
- **Next.js 15** + **React 19** - 现代化React框架
- **TypeScript 5** - 类型安全的JavaScript
- **Tailwind CSS 4.1.9** - 原子化CSS框架
- **Ant Design 5.26.7** - 企业级UI组件库
- **Radix UI** - 无头组件库
- **Zustand** - 轻量级状态管理
- **React Hook Form + Zod** - 高性能表单处理
- **AI SDK** - Vercel AI对话集成
- **react-markdown** - Markdown渲染支持

#### 开发运维
- **Docker + Docker Compose** - 容器化部署
- **GitHub Actions** - CI/CD自动化
- **Maven** - Java依赖管理
- **ESLint + Prettier** - 代码质量保证

---

## 🎨 项目优势

### 🏆 技术优势

1. **企业级架构设计**
   - DDD领域驱动设计，清晰的分层架构
   - 高内聚低耦合，易于维护和扩展
   - 支持水平扩展和高并发访问

2. **智能化工作流引擎**
   - 业界领先的8阶段智能工作流
   - 自适应任务分解和执行
   - 基于事件驱动的异步处理

3. **多模型统一管理**
   - 支持多种LLM提供商的无缝集成
   - 统一的模型管理和配置界面
   - 智能的模型选择和成本优化

4. **生产就绪特性**
   - 完整的错误处理和异常恢复
   - 详细的操作日志和审计追踪
   - 容器化部署和自动化运维

### 💼 业务价值

1. **提升开发效率**
   - 可视化的智能体开发工具
   - 预构建的工作流模板
   - 快速的模型测试和部署

2. **降低AI使用门槛**
   - 统一的多模型管理界面
   - 智能的任务自动化处理
   - 友好的用户交互体验

3. **企业级安全保障**
   - 完整的权限管理体系
   - 安全的API密钥管理
   - 数据加密和隐私保护

4. **灵活的扩展性**
   - 插件化的工具集成
   - 开放的API接口设计
   - 丰富的自定义配置选项

---

## 🚀 快速开始

### 系统要求
- **Docker** 20.10+
- **Docker Compose** 2.0+
- **内存**: 至少4GB
- **存储**: 至少2GB

### 一键启动

```bash
# 1. 克隆项目
git clone https://github.com/the-wayee/AgentHub.git
cd AgentHub

# 2. 启动所有服务
docker compose up -d --build

# 3. 访问应用
echo "前端界面: http://localhost:3000"
echo "后端API: http://localhost:8080/api"
echo "数据库: localhost:5432"
```

### 本地开发

#### 后端开发
```bash
# 确保PostgreSQL运行在localhost:5432
mvn spring-boot:run
```

#### 前端开发
```bash
cd AgentHub-Front
npm install
npm run dev
```

---

## 📊 系统架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户界面层 (Next.js)                      │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │  聊天界面   │ │ 智能体管理  │ │ 工作区管理  │ │ 管理后台    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                        API网关层 (Spring Boot)                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ 认证授权     │ │ 限流熔断    │ │ 监控日志    │ │ API路由     │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      业务逻辑层 (Application)                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ 智能体服务   │ │ 对话服务    │ │ 工作流引擎  │ │ 任务管理    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                      领域模型层 (Domain)                        │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ 智能体聚合   │ │ 会话聚合    │ │ 任务聚合    │ │ 事件总线    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                              │
┌─────────────────────────────────────────────────────────────────┐
│                    基础设施层 (Infrastructure)                 │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ │
│  │ PostgreSQL  │ │ LangChain4j │ │ 消息队列    │ │ 缓存系统    │ │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🔧 配置说明

### 环境变量配置

项目支持通过环境变量进行灵活配置：

#### 数据库配置
```bash
DB_HOST=localhost          # 数据库主机
DB_PORT=5432             # 数据库端口
DB_NAME=agenthub         # 数据库名称
DB_USERNAME=postgres     # 数据库用户名
DB_PASSWORD=postgres     # 数据库密码
```

#### LLM服务配置
```bash
# OpenAI配置
OPENAI_API_KEY=your_openai_key
OPENAI_BASE_URL=https://api.openai.com/v1

# 阿里云百炼配置
DASHSCOPE_API_KEY=your_dashscope_key

# 智谱AI配置
ZHIPUAI_API_KEY=your_zhipuai_key

# SiliconFlow配置
SILICONFLOW_API_KEY=your_siliconflow_key
SILICONFLOW_MODEL=Qwen/Qwen3-32B
```

---

## 📈 性能特点

### 🚀 高性能设计
- **异步处理**：基于事件驱动的非阻塞架构
- **连接池**：数据库连接池和HTTP连接池优化
- **缓存策略**：多级缓存提升响应速度
- **负载均衡**：支持多实例部署和负载均衡

### 📊 可观测性
- **结构化日志**：完整的请求和操作日志
- **性能监控**：API响应时间和系统资源监控
- **错误追踪**：分布式错误追踪和报警
- **业务指标**：用户行为和业务指标统计

---

## 🤝 贡献指南

### 开发流程
1. **Fork项目**到个人仓库
2. **创建功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交更改** (遵循提交信息规范)
4. **推送分支** (`git push origin feature/amazing-feature`)
5. **创建Pull Request**

### Git提交信息规范

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型说明:**
- `feat`: 新功能
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建工具、依赖管理

**示例:**
```bash
feat(back): 开发Agent问题分析处理器

- 实现问题分析工作流
- 添加问题分类功能
- 集成LangChain4j处理逻辑

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 代码规范
- **后端**: 遵循Java代码规范，使用Maven构建和检查
- **前端**: 遵循TypeScript/React规范，使用ESLint和Prettier
- **测试**: 保持高测试覆盖率，包含单元测试和集成测试

---

## 📄 许可证

本项目采用 **MIT许可证** - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📞 支持与联系

- **GitHub Issues**: [提交问题](https://github.com/the-wayee/AgentHub/issues)
- **讨论区**: [GitHub Discussions](https://github.com/the-wayee/AgentHub/discussions)
- **邮件支持**: [联系开发者](mailto:contact@agenthub.com)

---

## 🙏 致谢

感谢以下开源项目的支持：

- [Spring Boot](https://spring.io/projects/spring-boot)
- [Next.js](https://nextjs.org/)
- [LangChain4j](https://docs.langchain4j.dev/)
- [Ant Design](https://ant.design/)
- [Tailwind CSS](https://tailwindcss.com/)

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个Star!**

[![GitHub stars](https://img.shields.io/github/stars/the-wayee/AgentHub.svg?style=social&label=Star)](https://github.com/the-wayee/AgentHub)

*Made with ❤️ by AgentHub Team*

</div>