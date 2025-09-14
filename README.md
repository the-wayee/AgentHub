# AgentHub - AI智能体平台

AgentHub是一个基于Spring Boot和Next.js构建的AI智能体管理平台，支持创建、管理和部署各种类型的AI助手。

## 代码提交规范

- feat: 新功能 (feature)

- fix: 修复 bug

- docs: 文档修改 (比如 README)

- style: 代码格式修改（不影响功能，如空格、分号）

- refactor: 重构（既不是新增功能，也不是 bug 修复）

- perf: 性能优化

- test: 添加或修改测试

- chore: 构建过程或辅助工具的变动（如依赖升级）

- ci: CI/CD 配置变动（GitHub Actions, Jenkins 等）

- build: 构建系统或依赖相关的变动（如 Maven、npm 依赖）

- revert: 回滚 commit

例如：

feat(back): 开发xxx功能

fix(front): 修复监听触发逻辑

## 🚀 项目特性

- **智能体管理**: 创建、编辑、版本控制和发布AI智能体
- **多模型支持**: 集成多种LLM提供商（阿里云百炼、智谱AI等）
- **会话管理**: 完整的对话会话管理和上下文维护
- **工作区**: 个人工作区管理，支持自定义模型配置
- **现代化UI**: 基于Next.js和Tailwind CSS的响应式界面
- **Docker部署**: 一键部署，开箱即用

## 🏗️ 技术栈

### 后端

- **Java 17** + **Spring Boot 3.5.3**
- **MyBatis-Plus** - 数据库ORM
- **PostgreSQL** - 主数据库
- **LangChain4j** - AI模型集成框架
- **Maven** - 依赖管理

### 前端

- **Next.js 15** + **React 19**
- **TypeScript** - 类型安全
- **Tailwind CSS** - 样式框架
- **Radix UI** - 组件库
- **Zustand** - 状态管理

### 基础设施

- **Docker** + **Docker Compose**
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

- `LLM_DEFAULT_PROVIDER`: 默认LLM提供商（默认：siliconflow）
- `SILICONFLOW_API_URL`: SiliconFlow API地址
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

- **Application层**: 应用服务，处理业务逻辑
- **Domain层**: 领域模型和业务规则
- **Infrastructure层**: 基础设施实现
- **Interfaces层**: 外部接口（API、DTO等）

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

1. Fork项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开Pull Request

## 📄 许可证

本项目采用MIT许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

## 📞 支持

如有问题或建议，请通过以下方式联系：

- 提交Issue
- 发送邮件
- 项目讨论区

---

**注意**: 首次启动可能需要几分钟时间来下载依赖和构建镜像，请耐心等待。
