# AgentHub - AI智能体平台

AgentHub是一个基于Spring Boot和Next.js构建的全栈AI智能体管理平台，支持创建、管理和部署各种类型的AI助手。项目采用DDD架构设计，集成多种LLM服务提供商，提供完整的智能体生命周期管理。

## 🚀 项目特性

- **智能体管理**: 创建、编辑、版本控制和发布AI智能体
- **多模型支持**: 集成多种LLM提供商（OpenAI、阿里云百炼、智谱AI等）
- **会话管理**: 完整的对话会话管理和上下文维护
- **工作区**: 个人工作区管理，支持自定义模型配置
- **现代化UI**: 基于Next.js 15和Tailwind CSS的响应式界面
- **容器化部署**: Docker Compose一键部署，开箱即用
- **CI/CD集成**: GitHub Actions自动化构建和代码检查

## 🏗️ 技术栈

### 后端技术栈
- **Java 17** + **Spring Boot 3.5.3**
- **MyBatis-Plus 3.5.7** - 数据库ORM
- **PostgreSQL** - 主数据库
- **LangChain4j 1.3.0** - AI模型集成框架
  - 支持OpenAI、阿里云百炼、智谱AI等多种LLM
  - 集成MCP (Model Context Protocol) 支持
- **FastJSON2** - JSON处理
- **Maven** - 依赖管理

### 前端技术栈
- **Next.js 15** + **React 19**
- **TypeScript** - 类型安全
- **Tailwind CSS 4.1.9** - 样式框架
- **Radix UI** - 无头组件库
- **Ant Design 5.26.7** - UI组件库
- **Zustand** - 状态管理
- **React Hook Form** + **Zod** - 表单处理
- **AI SDK** - AI对话集成

### 开发工具
- **Docker** + **Docker Compose** - 容器化部署
- **GitHub Actions** - CI/CD自动化
- **PostgreSQL 15** - 数据库
- **Maven** - 构建工具

## 📋 系统要求

- Docker 20.10+
- Docker Compose 2.0+
- 至少4GB可用内存
- 至少2GB可用磁盘空间

## 🚀 快速开始

### 1. 克隆项目

```bash
git clone https://github.com/the-wayee/AgentHub.git
cd AgentHub
```

### 2. 启动项目

```bash
# 构建并启动所有服务
docker compose up -d --build
```

### 3. 访问应用

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:8080/api
- **数据库**: localhost:5432

## 📁 项目结构

```
AgentHub/
├── AgentHub-Front/          # Next.js前端应用
│   ├── app/                 # App Router页面
│   ├── components/          # React组件
│   ├── lib/                 # 工具函数和类型定义
│   └── public/              # 静态资源
├── src/main/java/           # Spring Boot后端源码
│   ├── application/         # 应用服务层
│   ├── domain/              # 领域模型
│   ├── infrastructure/      # 基础设施层
│   └── interfaces/          # 接口层
├── docker-compose.yml       # Docker编排配置
├── Dockerfile              # 后端Docker配置
├── init.sql                # 数据库初始化脚本
└── pom.xml                 # Maven配置
```

## 🔧 配置说明

### 环境变量

项目支持通过环境变量进行配置，主要配置项包括：

#### 数据库配置
- `DB_HOST`: 数据库主机地址（默认：localhost）
- `DB_PORT`: 数据库端口（默认：5432）
- `DB_NAME`: 数据库名称（默认：agenthub）
- `DB_USERNAME`: 数据库用户名（默认：postgres）
- `DB_PASSWORD`: 数据库密码（默认：postgres）

#### LLM服务配置
项目支持多种LLM提供商，可通过环境变量配置：

**OpenAI配置**
- `OPENAI_API_KEY`: OpenAI API密钥
- `OPENAI_BASE_URL`: OpenAI API基础地址（可选）

**阿里云百炼配置**
- `DASHSCOPE_API_KEY`: 阿里云百炼API密钥

**智谱AI配置**
- `ZHIPUAI_API_KEY`: 智谱AI API密钥

**SiliconFlow配置**
- `SILICONFLOW_API_KEY`: SiliconFlow API密钥
- `SILICONFLOW_MODEL`: 默认模型（默认：Qwen/Qwen3-32B）

### 自定义配置

如需修改配置，可以：

1. **修改环境变量**: 在`docker-compose.yml`中修改environment部分
2. **修改配置文件**: 编辑`src/main/resources/application.yml`
3. **重新构建**: 运行`docker compose up -d --build`

## 🗄️ 数据库

项目使用PostgreSQL作为主数据库，包含以下主要表：

- `agents` - AI智能体信息
- `agent_versions` - 智能体版本管理
- `sessions` - 对话会话
- `messages` - 消息记录
- `context` - 上下文管理
- `providers` - LLM服务提供商
- `models` - 模型信息
- `agent_workspace` - 工作区配置
- `agent_tasks` - 任务管理

数据库会在首次启动时自动初始化，包含必要的表结构和示例数据。

## 🔌 API接口

后端API基于RESTful设计，主要接口包括：

- `/api/agents` - 智能体管理
- `/api/sessions` - 会话管理
- `/api/messages` - 消息处理
- `/api/providers` - 服务提供商管理
- `/api/models` - 模型管理

详细的API文档可以通过访问 `http://localhost:8080/api` 查看。

## 🛠️ 开发指南

### 本地开发

如需在本地开发环境运行：

#### 后端开发
```bash
# 确保PostgreSQL运行在localhost:5432
# 安装Java 17和Maven
mvn spring-boot:run
```

#### 前端开发
```bash
cd AgentHub-Front
npm install
npm run dev
```

### 代码结构

项目采用DDD（领域驱动设计）架构：

**后端架构 (src/main/java/com/xiaoguai/agentx/)**
- **application/**: 应用服务层
  - `agent/`: 智能体相关应用服务
  - `admin/`: 管理员相关应用服务
- **domain/**: 领域模型层
  - 实体、值对象、领域服务
- **infrastructure/**: 基础设施层
  - 数据库、外部服务集成
- **interfaces/**: 接口层
  - REST API控制器、DTO转换

**前端架构 (AgentHub-Front/)**
- **app/**: Next.js App Router页面
- **components/**: React组件库
- **hooks/**: 自定义React Hooks
- **lib/**: 工具函数和类型定义

## 🐳 Docker服务

项目包含以下Docker服务：

- **backend**: Spring Boot应用（端口8080）
- **frontend**: Next.js应用（端口3000）
- **db**: PostgreSQL数据库（端口5432）

## 📝 使用说明

1. **创建智能体**: 在管理界面创建新的AI智能体
2. **配置模型**: 设置智能体使用的LLM模型和参数
3. **开始对话**: 创建会话并与智能体进行交互
4. **管理工作区**: 将常用智能体添加到个人工作区

## 🔍 故障排除

### 常见问题

1. **端口冲突**: 确保3000、8080、5432端口未被占用
2. **内存不足**: 确保Docker有足够内存分配
3. **数据库连接失败**: 检查PostgreSQL服务是否正常启动

### 日志查看

```bash
# 查看所有服务日志
docker compose logs

# 查看特定服务日志
docker compose logs backend
docker compose logs frontend
docker compose logs db
```

### 重启服务

```bash
# 重启所有服务
docker compose restart

# 重启特定服务
docker compose restart backend
```

## 🤝 贡献指南

### 开发流程
1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

### 代码规范
- **后端**: 遵循Java代码规范，代码提交时会自动进行Maven构建和检查
- **前端**: 遵循TypeScript/React规范，代码提交时会自动进行ESLint检查和类型检查
- **提交信息**: 使用清晰的提交信息格式，如 `fix: 修复xxx问题` 或 `feature: 添加xxx功能`

### CI/CD流程
项目配置了GitHub Actions自动化流程：
- **Backend Java Lint**: Java代码编译和测试
- **Frontend TS/React Lint**: TypeScript代码检查和类型检查

所有PR必须通过CI检查才能合并到main分支。

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 提交Issue
- 发送邮件
- 项目讨论区

---

**注意**: 首次启动可能需要几分钟时间来下载依赖和构建镜像，请耐心等待。
