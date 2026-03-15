# Architecture / 架构

**English** | [简体中文](#简体中文)

---

## English

### System Overview

OpenClaw Doc Viewer follows a modern client-server architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────┐
│                        Client (Browser)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Vue 3 + Vite + Element Plus                           │  │
│  │  - Component-based UI                                  │  │
│  │  - Pinia state management                              │  │
│  │  - Markdown rendering (markdown-it)                    │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      Server (Node.js)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Fastify 4.x                                           │  │
│  │  - RESTful API                                         │  │
│  │  - JWT Authentication                                  │  │
│  │  - File scanning and indexing                          │  │
│  │  - FlexSearch full-text search                         │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Data Layer                                            │  │
│  │  - JSON file storage (users, collections, comments)    │  │
│  │  - In-memory search index                              │  │
│  │  - File system watcher                                 │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ File System
┌─────────────────────────────────────────────────────────────┐
│                    Document Sources                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  Directory 1 │  │  Directory 2 │  │  Directory 3 │      │
│  │  (.md files) │  │  (.md files) │  │  (.md files) │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### Backend Architecture

#### Directory Structure

```
backend/
├── src/
│   ├── routes/          # API route handlers
│   │   ├── auth.js      # Authentication routes
│   │   ├── files.js     # File operations
│   │   ├── search.js    # Search endpoints
│   │   ├── collections.js
│   │   ├── history.js
│   │   ├── shares.js
│   │   └── comments.js
│   ├── plugins/         # Fastify plugins
│   │   ├── auth.js      # JWT authentication
│   │   ├── cors.js      # CORS configuration
│   │   └── helmet.js    # Security headers
│   ├── services/        # Business logic
│   │   ├── fileScanner.js
│   │   ├── searchIndex.js
│   │   └── userService.js
│   ├── middleware/      # Custom middleware
│   ├── utils/           # Utility functions
│   └── server.js        # Entry point
├── config/              # Configuration
├── data/                # JSON data storage
└── tests/               # Test files
```

#### Key Components

1. **File Scanner**
   - Watches configured directories
   - Parses Markdown files
   - Builds search index
   - Handles file changes

2. **Search Engine**
   - FlexSearch-based full-text search
   - Incremental index updates
   - Highlighting support

3. **Authentication**
   - JWT-based authentication
   - Role-based access control
   - Session management

### Frontend Architecture

#### Directory Structure

```
frontend/
├── src/
│   ├── components/      # Vue components
│   │   ├── common/      # Shared components
│   │   ├── layout/      # Layout components
│   │   ├── file/        # File-related components
│   │   └── user/        # User components
│   ├── views/           # Page views
│   ├── stores/          # Pinia stores
│   ├── router/          # Vue Router config
│   ├── api/             # API client
│   ├── utils/           # Utilities
│   └── App.vue          # Root component
├── public/              # Static assets
└── tests/               # Test files
```

#### State Management

```
Pinia Stores:
├── auth.js         # Authentication state
├── file.js         # File/directory state
├── search.js       # Search state
├── user.js         # User preferences
└── comment.js      # Comment state
```

### Data Flow

```
User Action → Component → Store → API → Server → Database/File System
                ↑                                        ↓
                └────────── Response ────────────────────┘
```

### Security Architecture

1. **Authentication**
   - JWT tokens with expiration
   - Secure password hashing (bcrypt)
   - Session management

2. **Authorization**
   - Role-based access control (Admin, Editor, Viewer)
   - Route-level protection
   - API-level validation

3. **Data Protection**
   - Input sanitization
   - SQL injection prevention (No SQL used)
   - XSS prevention (markdown-it sanitization)

---

## 简体中文

### 系统概述

OpenClaw Doc Viewer 采用现代化的客户端 - 服务器架构，关注点清晰分离。

```
┌─────────────────────────────────────────────────────────────┐
│                        客户端 (浏览器)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Vue 3 + Vite + Element Plus                            │  │
│  │  - 组件化 UI                                            │  │
│  │  - Pinia 状态管理                                        │  │
│  │  - Markdown 渲染 (markdown-it)                          │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      服务器 (Node.js)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Fastify 4.x                                           │  │
│  │  - RESTful API                                         │  │
│  │  - JWT 认证                                             │  │
│  │  - 文件扫描和索引                                         │  │
│  │  - FlexSearch 全文搜索                                   │  │
│  └───────────────────────────────────────────────────────┘  │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  数据层                                                 │  │
│  │  - JSON 文件存储 (用户、收藏、评论)                       │  │
│  │  - 内存搜索索引                                          │  │
│  │  - 文件系统监控器                                         │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                              ↕ 文件系统
┌─────────────────────────────────────────────────────────────┐
│                      文档源                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  目录 1       │  │  目录 2       │  │  目录 3       │      │
│  │  (.md 文件)   │  │  (.md 文件)   │  │  (.md 文件)   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
```

### 后端架构

#### 目录结构

```
backend/
├── src/
│   ├── routes/          # API 路由处理器
│   │   ├── auth.js      # 认证路由
│   │   ├── files.js     # 文件操作
│   │   ├── search.js    # 搜索端点
│   │   ├── collections.js
│   │   ├── history.js
│   │   ├── shares.js
│   │   └── comments.js
│   ├── plugins/         # Fastify 插件
│   │   ├── auth.js      # JWT 认证
│   │   ├── cors.js      # CORS 配置
│   │   └── helmet.js    # 安全头
│   ├── services/        # 业务逻辑
│   │   ├── fileScanner.js
│   │   ├── searchIndex.js
│   │   └── userService.js
│   ├── middleware/      # 自定义中间件
│   ├── utils/           # 工具函数
│   └── server.js        # 入口点
├── config/              # 配置
├── data/                # JSON 数据存储
└── tests/               # 测试文件
```

#### 关键组件

1. **文件扫描器**
   - 监控配置的目录
   - 解析 Markdown 文件
   - 构建搜索索引
   - 处理文件变更

2. **搜索引擎**
   - 基于 FlexSearch 的全文搜索
   - 增量索引更新
   - 支持高亮

3. **认证系统**
   - 基于 JWT 的认证
   - 基于角色的访问控制
   - 会话管理

### 前端架构

#### 目录结构

```
frontend/
├── src/
│   ├── components/      # Vue 组件
│   │   ├── common/      # 共享组件
│   │   ├── layout/      # 布局组件
│   │   ├── file/        # 文件相关组件
│   │   └── user/        # 用户组件
│   ├── views/           # 页面视图
│   ├── stores/          # Pinia stores
│   ├── router/          # Vue Router 配置
│   ├── api/             # API 客户端
│   ├── utils/           # 工具
│   └── App.vue          # 根组件
├── public/              # 静态资源
└── tests/               # 测试文件
```

#### 状态管理

```
Pinia Stores:
├── auth.js         # 认证状态
├── file.js         # 文件/目录状态
├── search.js       # 搜索状态
├── user.js         # 用户偏好
└── comment.js      # 评论状态
```

### 数据流

```
用户操作 → 组件 → Store → API → 服务器 → 数据库/文件系统
                ↑                                        ↓
                └────────── 响应 ─────────────────────────┘
```

### 安全架构

1. **认证**
   - 带过期的 JWT 令牌
   - 安全密码哈希 (bcrypt)
   - 会话管理

2. **授权**
   - 基于角色的访问控制 (管理员、编辑者、查看者)
   - 路由级保护
   - API 级验证

3. **数据保护**
   - 输入清理
   - SQL 注入防护 (不使用 SQL)
   - XSS 防护 (markdown-it 清理)

---

## Related Documents / 相关文档

- [API Reference](API.md)
- [Configuration](CONFIGURATION.md)
- [Deployment](DEPLOYMENT.md)

---

*Last updated: 2026-03-15*
