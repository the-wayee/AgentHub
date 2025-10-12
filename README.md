# AgentHub - 企业级AI智能体管理平台

<div align="center">

![AgentHub Logo](https://img.shields.io/badge/AgentHub-AI%20Platform-blue?style=for-the-badge)

[![Java](https://img.shields.io/badge/Java-17-orange?style=flat-square)](https://openjdk.java.net/projects/jdk/17/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5.3-brightgreen?style=flat-square)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-blue?style=flat-square)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue?style=flat-square)](https://www.postgresql.org/)
[![LangChain4j](https://img.shields.io/badge/LangChain4j-1.3.0-purple?style=flat-square)](https://docs.langchain4j.dev/)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=flat-square)](https://www.docker.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

**一个基于领域驱动设计(DDD)的现代化AI智能体管理平台**

[快速开始](#-快速开始) • [功能特性](#-功能特性) • [功能清单](#-功能清单-roadmap) • [技术架构](#-技术架构) • [部署指南](#-部署指南) • [开发文档](#-开发文档)

</div>

---

## 📖 项目简介

AgentHub 是一个**企业级AI智能体管理平台**，采用**领域驱动设计(DDD)**架构模式，基于**Spring Boot + Next.js**全栈技术栈构建。平台提供了完整的AI智能体生命周期管理，从开发、测试到部署的全流程支持。

### 🎯 设计理念

- **智能驱动**: 不仅仅是聊天机器人，而是具备任务分解、工作流自动化能力的智能体
- **企业级**: DDD架构设计，支持高并发、水平扩展和企业级安全
- **开放生态**: 支持多种LLM提供商，提供工具市场生态
- **生产就绪**: 容器化部署，完整的监控、日志和错误处理机制

---

## ✨ 核心功能


---

## 📋 功能清单 (Roadmap)

### ✅ 已完成功能

#### 🔐 用户认证系统
- [x] **邮箱注册/登录**: 完整的用户注册和登录流程
- [x] **密码重置**: 基于邮箱验证的密码重置功能
- [x] **验证码系统**: 图形验证码防止恶意注册
- [x] **JWT认证**: 无状态的用户认证机制
- [x] **用户信息管理**: 个人资料编辑和头像上传
- [ ] **GitHub OAuth登录**: 第三方账号快速登录

#### 🤖 智能体管理
- [x] **智能体创建**: 支持聊天助手型和功能型智能体
- [x] **版本控制系统**: 完整的智能体版本管理
- [x] **审核工作流**: 草稿 → 审核 → 发布的完整流程
- [x] **工作区管理**: 用户个人智能体配置和模型设置
- [x] **智能体市场**: 浏览和使用已发布的智能体

#### 💬 对话系统
- [x] **实时对话**: 基于SSE的流式对话输出
- [x] **多轮对话**: 支持复杂的多步骤交互
- [x] **上下文管理**: 智能的对话历史管理和总结
- [x] **Markdown渲染**: 支持富文本消息显示
- [x] **消息类型**: 支持文本等多种消息类型

#### 🔄 智能工作流引擎
- [x] **8阶段工作流**: 初始化 → 问题分析 → 任务分解 → 执行 → 汇总
- [x] **任务分解器**: 智能分解复杂任务为可执行步骤
- [x] **进度跟踪**: 实时显示任务执行进度和状态
- [x] **结果汇总**: 自动汇总各子任务执行结果
- [x] **事件驱动架构**: AgentEventBus异步处理机制

#### 🛠️ 工具市场
- [x] **工具上传**: 支持多种工具上传方式
- [x] **版本管理**: 工具版本控制和更新机制
- [x] **质量审核**: 工具质量和安全性审核流程
- [x] **市场浏览**: 工具搜索、分类和推荐功能
- [x] **工具安装**: 一键安装工具到智能体工作区

#### 🌐 LLM集成
- [x] **多提供商支持**: OpenAI、阿里云百炼、智谱AI等
- [x] **统一抽象层**: 屏蔽不同LLM提供商的技术差异
- [x] **配置管理**: 灵活的API密钥和模型参数配置
- [x] **模型切换**: 运行时动态切换模型和提供商
- [x] **基础MCP支持**: Model Context Protocol基础集成

#### 🏗️ 系统基础
- [x] **DDD架构**: 基于领域驱动设计的四层架构
- [x] **数据库设计**: 完整的PostgreSQL数据库结构
- [x] **容器化部署**: Docker + Docker Compose一键部署
- [x] **API文档**: RESTful API接口规范和文档
- [x] **日志系统**: 完整的请求和操作日志记录


#### 🌐 MCP统一网关管理
- [ ] **MCP协议服务器**: 统一的MCP服务网关
- [ ] **工具集成管理**: MCP工具的统一管理和调度
- [ ] **性能监控**: MCP服务的性能指标监控

#### 🖼️ 模型多模态支持
- [ ] **图像理解**: 支持图片输入和图像分析
- [ ] **语音交互**: 语音输入和语音合成功能
- [ ] **文档解析**: PDF、Word等文档内容解析
- [ ] **多模态融合**: 文本、图像、语音的综合处理

#### 📚 知识库系统 && RAG增强检索
- [ ] **文档管理**: 知识库文档的创建、编辑、删除
- [ ] **版本控制**: 知识库文档的版本管理
- [ ] **向量化存储**: 文档内容的向量化存储
- [ ] **相似度检索**: 基于向量相似度的内容检索
- [ ] **上下文增强**: 检索内容与对话上下文的智能融合
- [ ] **检索优化**: 检索结果的相关性和准确性优化
- [ ] **知识图谱**: 结构化知识表示和推理

#### 💰 用户Token计费系统
- [ ] **Token统计**: 精确的用户Token使用量统计
- [ ] **计费规则**: 灵活的计费策略和规则配置
- [ ] **账单管理**: 用户账单生成和查看
- [ ] **支付集成**: 支付宝、微信支付集成
- [ ] **套餐管理**: 多种计费套餐和优惠方案

#### 🤝 多Agent协同
- [ ] **Agent协作**: 多个智能体的协同工作机制
- [ ] **任务分配**: 智能任务分配和负载均衡
- [ ] **通信协议**: Agent间通信协议和数据交换
- [ ] **冲突解决**: 多Agent决策冲突的解决机制
- [ ] **协作优化**: 协作效率和结果质量优化

#### 🔧 系统增强
- [ ] **监控告警**: 系统运行状态监控和异常告警
- [ ] **性能优化**: 数据库查询优化和缓存策略
- [ ] **安全加固**: 安全漏洞扫描和防护措施
- [ ] **API限流**: 接口访问频率限制和防护
- [ ] **数据备份**: 自动化数据备份和恢复机制

---

### 🤖 智能体管理
- **版本控制系统**: 完整的智能体版本管理，支持发布审核工作流
- **多类型支持**: 聊天助手型和功能型智能体
- **工作区管理**: 用户自定义智能体配置和模型参数
- **生命周期管理**: 草稿 → 审核 → 发布 → 下架的完整流程

### 🔄 智能工作流引擎

平台核心的**8阶段智能工作流**，实现复杂任务的自动化处理：

```
初始化 → 问题分析 → 任务分解 → 分解完成 → 任务执行 → 执行完成 → 结果汇总 → 完成/失败
```

**核心组件**:
- **问题分析器**: 智能判断用户请求类型
- **任务分解器**: 将复杂任务分解为可执行的子任务
- **上下文管理器**: 自动检测信息完整性，询问缺失信息
- **事件驱动架构**: 基于AgentEventBus的异步处理机制

### 💬 对话与上下文管理
- **智能上下文窗口**: 自动对话历史管理和智能总结
- **多轮对话支持**: 处理复杂的多步骤交互场景
- **信息完整性检查**: 自动识别并请求缺失的关键信息
- **Token精确管理**: 消息令牌计数和上下文优化策略

### 🌐 多LLM提供商集成
- **统一抽象层**: 屏蔽不同LLM提供商的技术差异
- **热插拔支持**: 运行时动态切换模型和提供商
- **配置管理**: 灵活的API密钥和模型参数配置
- **成本优化**: 智能模型选择和成本控制策略

### 🛠️ 任务管理系统
- **层次化任务结构**: 支持父子任务关系和依赖管理
- **进度跟踪**: 完整的任务生命周期状态追踪
- **结果聚合**: 自动收集和汇总子任务执行结果
- **失败恢复**: 智能错误处理和任务重试机制

### 🏪 工具市场生态
- **工具发布**: 用户可以上传和分享自定义工具
- **版本管理**: 工具版本控制和更新机制
- **审核机制**: 工具质量和安全性审核
- **安装使用**: 一键安装工具到智能体工作区

---

## 🏗️ 技术架构

### 后端架构 (Java 17 + Spring Boot 3.5.3)

基于**领域驱动设计(DDD)**的四层架构模式：

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
- **Java 17** + **Spring Boot 3.5.3** - 现代化Java企业级框架
- **MyBatis-Plus 3.5.7** - 高性能ORM框架
- **PostgreSQL 15** - 企业级关系型数据库
- **LangChain4j 1.3.0** - AI模型集成框架
  - 支持OpenAI、阿里云百炼、智谱AI等多种LLM提供商
  - 集成MCP (Model Context Protocol)支持
- **JWT认证** - 安全的用户认证和授权机制
- **事件驱动架构** - AgentEventBus异步消息处理

#### 前端技术
- **Next.js 15** + **React 19** - 现代化React全栈框架
- **TypeScript 5** - 类型安全的JavaScript超集
- **Tailwind CSS 4.1.9** - 原子化CSS框架
- **Ant Design 5.26.7** - 企业级UI组件库
- **Radix UI** - 无头组件库，提供完全的可定制性
- **Zustand** - 轻量级状态管理方案
- **React Hook Form + Zod** - 高性能表单处理和验证
- **AI SDK** - Vercel AI对话集成支持
- **react-markdown** - Markdown内容渲染支持

#### 开发运维
- **Docker + Docker Compose** - 容器化部署方案
- **Maven** - Java项目依赖管理
- **ESLint + Prettier** - 代码质量保证
- **PostgreSQL** - 数据库初始化和管理

---

## 🎨 项目特色

### 🏆 技术优势

1. **企业级DDD架构**
   - 清晰的领域边界和分层架构
   - 高内聚低耦合，易于维护和扩展
   - 支持水平扩展和高并发访问

2. **智能化工作流引擎**
   - 业界领先的8阶段智能工作流
   - 自适应任务分解和执行机制
   - 基于事件驱动的异步处理架构

3. **多模型统一管理**
   - 支持多种LLM提供商的无缝集成
   - 统一的模型管理和配置界面
   - 智能的模型选择和成本优化策略

4. **生产就绪特性**
   - 完整的错误处理和异常恢复机制
   - 详细的操作日志和审计追踪
   - 容器化部署和自动化运维支持

### 💼 业务价值

1. **提升开发效率**
   - 可视化的智能体开发工具
   - 预构建的工作流模板库
   - 快速的模型测试和部署流程

2. **降低AI使用门槛**
   - 统一的多模型管理界面
   - 智能的任务自动化处理
   - 友好的用户交互体验设计

3. **企业级安全保障**
   - 完整的权限管理体系
   - 安全的API密钥管理机制
   - 数据加密和隐私保护方案

---

## 🚀 快速开始

### 系统要求

- **Docker** 20.10+
- **Docker Compose** 2.0+
- **内存**: 至少4GB RAM
- **存储**: 至少2GB可用空间

### 一键部署

```bash
# 1. 克隆项目
git clone https://github.com/the-wayee/AgentHub.git
cd AgentHub

# 2. 启动所有服务
docker compose up -d --build

# 3. 查看服务状态
docker compose ps

# 4. 访问应用
echo "前端界面: http://localhost:3000"
echo "后端API: http://localhost:8080/api"
echo "数据库: localhost:5432"
```

### 本地开发环境

#### 后端开发
```bash
# 确保PostgreSQL运行在localhost:5432
# 创建数据库agenthub
psql -U postgres -c "CREATE DATABASE agenthub;"

# 启动后端服务
mvn spring-boot:run

# 或使用Maven构建
mvn clean package
java -jar target/AgentHub-0.0.1-SNAPSHOT.jar
```

#### 前端开发
```bash
cd AgentHub-Front

# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build

# 启动生产服务器
npm start
```

---

## 📊 数据模型

### 核心实体关系

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│      Users      │    │     Agents      │    │   AgentVersions │
│─────────────────│    │─────────────────│    │─────────────────│
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ nickname        │    │ name            │    │ agent_id (FK)   │
│ email           │    │ description     │    │ version_number  │
│ password        │    │ system_prompt   │    │ system_prompt   │
│ github_id       │    │ agent_type      │    │ publish_status  │
│ created_at      │    │ user_id (FK)    │    │ user_id (FK)    │
└─────────────────┘    │ created_at      │    │ created_at      │
                       └─────────────────┘    └─────────────────┘
                                │                       │
                                │                       │
                                └───────────┬───────────┘
                                            │
                                ┌─────────────────┐
                                │   Sessions      │
                                │─────────────────│
                                │ id (PK)         │
                                │ title           │
                                │ user_id (FK)    │
                                │ agent_id (FK)   │
                                │ created_at      │
                                └─────────────────┘
                                            │
                                ┌─────────────────┐
                                │    Messages     │
                                │─────────────────│
                                │ id (PK)         │
                                │ session_id (FK) │
                                │ role            │
                                │ content         │
                                │ message_type    │
                                │ created_at      │
                                └─────────────────┘
```

### 数据库表结构

- **users**: 用户信息表，支持邮箱和GitHub登录
- **agents**: 智能体基本信息表
- **agent_versions**: 智能体版本管理表，支持审核流程
- **sessions**: 对话会话表
- **messages**: 消息记录表，支持多种消息类型
- **context**: 上下文管理表，智能对话历史管理
- **agent_tasks**: 任务执行表，支持层次化任务结构
- **providers**: LLM服务提供商表
- **models**: 模型信息表
- **tools**: 工具市场表
- **tool_versions**: 工具版本管理表
- **user_tools**: 用户工具关联表

---

## 🔧 配置说明

### 环境变量配置

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

#### 邮件服务配置
```bash
MAIL_HOST=smtp.gmail.com     # SMTP服务器
MAIL_PORT=587               # SMTP端口
MAIL_USERNAME=your_email    # 邮箱用户名
MAIL_PASSWORD=your_password # 邮箱密码
```

---



## 🎯 功能模块详解

### 用户认证模块
- **多种登录方式**: 邮箱注册/登录
- **密码重置**: 基于邮箱验证的密码重置功能
- **验证码系统**: 图形验证码防止恶意注册
- **JWT认证**: 无状态的用户认证机制

### 智能体管理模块
- **智能体创建**: 支持聊天助手和功能型两种类型
- **版本控制**: 完整的版本管理和发布流程
- **审核机制**: 管理员审核智能体发布
- **工作区**: 用户个人智能体配置和模型设置

### 对话系统模块
- **实时对话**: 基于sse的流式输出
- **上下文管理**: 智能的对话历史管理和总结
- **多媒体支持**: 支持文本、图片等多种消息类型
- **Markdown渲染**: 支持富文本消息显示

### 任务工作流模块
- **智能分析**: 自动分析用户请求复杂度
- **任务分解**: 将复杂任务分解为可执行步骤
- **进度跟踪**: 实时显示任务执行进度
- **结果汇总**: 自动汇总各子任务执行结果

### 工具市场模块
- **工具上传**: 支持多种工具上传方式
- **版本管理**: 工具版本控制和更新
- **质量审核**: 工具质量和安全性审核
- **市场浏览**: 工具搜索、分类和推荐

---

## 📈 性能特点


---

## 🤝 贡献指南

### 开发流程
1. **Fork项目** 到个人GitHub仓库
2. **创建功能分支** (`git checkout -b feature/amazing-feature`)
3. **提交代码更改** (遵循项目代码规范)
4. **推送分支** (`git push origin feature/amazing-feature`)
5. **创建Pull Request** 并填写详细的PR描述

### Git提交规范

```bash
<type>(<scope>): <subject>

<body>

<footer>
```

**提交类型说明**:
- `feat`: 新功能开发
- `fix`: Bug修复
- `docs`: 文档更新
- `style`: 代码格式调整(不影响功能)
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建工具、依赖管理等

**提交示例**:
```bash
feat(back): 开发Agent问题分析处理器

- 实现问题复杂度分析工作流
- 添加问题分类和优先级判断功能
- 集成LangChain4j进行智能处理

Closes #123

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>
```

### 代码规范
- **后端代码**: 遵循阿里巴巴Java开发规范，使用Maven进行构建管理
- **前端代码**: 遵循TypeScript/React最佳实践，使用ESLint和Prettier保证代码质量
- **测试要求**: 保持高测试覆盖率，包含单元测试和集成测试
- **文档要求**: 重要的功能模块需要编写详细的技术文档

---

## 📄 许可证

本项目采用 **MIT许可证** - 查看 [LICENSE](LICENSE) 文件了解详情。

---

## 📞 支持与联系

- **GitHub Issues**: [提交问题和建议](https://github.com/the-wayee/AgentHub/issues)
- **GitHub Discussions**: [技术讨论和交流](https://github.com/the-wayee/AgentHub/discussions)
- **邮箱支持**: [联系开发者](mailto:contact@agenthub.com)

---

## 🙏 致谢

感谢以下优秀的开源项目：

- [Spring Boot](https://spring.io/projects/spring-boot) - 企业级Java开发框架
- [Next.js](https://nextjs.org/) - React全栈开发框架
- [LangChain4j](https://docs.langchain4j.dev/) - Java AI应用开发框架
- [Ant Design](https://ant.design/) - 企业级UI设计语言
- [Tailwind CSS](https://tailwindcss.com/) - 实用优先的CSS框架
- [PostgreSQL](https://www.postgresql.org/) - 强大的开源数据库
- [Docker](https://www.docker.com/) - 容器化平台

---

<div align="center">

**⭐ 如果这个项目对你有帮助，请给我们一个Star! ⭐**

[![GitHub stars](https://img.shields.io/github/stars/the-wayee/AgentHub?style=social&label=Star)](https://github.com/the-wayee/AgentHub)
[![GitHub forks](https://img.shields.io/github/forks/the-wayee/AgentHub?style=social&label=Fork)](https://github.com/the-wayee/AgentHub/fork)
[![GitHub issues](https://img.shields.io/github/issues/the-wayee/AgentHub)](https://github.com/the-wayee/AgentHub/issues)
[![GitHub pull requests](https://img.shields.io/github/issues-pr/the-wayee/AgentHub)](https://github.com/the-wayee/AgentHub/pulls)

**Made with ❤️ by AgentHub Team**

</div>