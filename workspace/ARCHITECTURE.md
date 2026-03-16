# 📖 OpenClaw Doc Viewer 架构设计

**版本**: v2.0  
**日期**: 2026-03-12  
**状态**: 待开发  
**优先级**: 高

---

## 🎯 项目概述

### 问题陈述

当前 OpenClaw 部署在 Linux 服务器上，生成的文档均为 `.md` 格式，存在以下痛点：

| 问题 | 影响 | 当前方案 |
|------|------|---------|
| **查看不便** | 需要 SSH 登录服务器查看 | `cat` / `vim` 命令行 |
| **无导航** | 无法直观了解文档结构 | 手动 `tree` / `find` |
| **无搜索** | 查找特定内容困难 | `grep` 命令行 |
| **无渲染** | Markdown 格式不直观 | 原始文本 |
| **多实例分散** | 多个 OpenClaw 实例文档分散 | 逐个查看 |

### 项目目标

构建一个 **Web 文档查看器**，提供：

1. ✅ **Web 界面** - 浏览器访问，无需 SSH
2. ✅ **目录树导航** - 可视化 Linux 目录结构
3. ✅ **Markdown 渲染** - 美观的文档预览（含代码高亮）
4. ✅ **全文搜索** - 快速定位内容
5. ✅ **多实例支持** - 统一查看多个 OpenClaw 实例
6. ✅ **实时更新** - 文件变更自动刷新

---

## 🏗️ 系统架构

### 架构图

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户浏览器                                │
│              https://docs.yourdomain.com  (HTTPS)                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Nginx (反向代理 + HTTPS 终止)                  │
│                    • SSL/TLS 证书 (Let's Encrypt)                │
│                    • 静态文件缓存                                │
│                    • API 路由转发                                │
│                    • Gzip 压缩                                   │
└─────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌───────────────┐    ┌───────────────┐    ┌───────────────┐
│   前端 SPA    │    │   后端 API    │    │  文件系统    │
│   (Vue 3)     │    │   (Node.js)   │    │   扫描器     │
│               │    │               │    │               │
│ • 目录树      │    │ • RESTful API │    │ • 扫描.md    │
│ • Markdown    │    │ • 文件读取    │    │ • 建立索引    │
│ • 搜索        │    │ • 全文搜索    │    │ • 监听变更    │
│ • 响应式      │    │ • 权限控制    │    │ • 元数据生成  │
└───────────────┘    └───────────────┘    └───────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   OpenClaw 文档目录 (只读访问)                     │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ~/.openclaw/  (企业实例)                           │    │
│  │  ├── agents/main/skills/    # 技能文档 (~50 个.md)        │    │
│  │  ├── projects/              # 项目文档 (~10 个)           │    │
│  │  ├── workspace/             # 工作区文档                  │    │
│  │  └── memory/                # 记忆文件                    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ~/.openclaw/  (主实例)                                 │    │
│  │  └── ...                    # 主实例文档                 │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │  ~/.openclaw-personal/  (皇朝实例)                       │    │
│  │  └── ...                    # 皇朝实例文档                │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
│  预计文档总量：~500 个 .md 文件，总大小 ~10MB                     │
└─────────────────────────────────────────────────────────────────┘
```

### 数据流

```
用户请求 → Nginx → 后端 API → 文件系统 → 返回数据 → 前端渲染 → 用户界面
                ↓
            搜索索引 (内存)
                ↓
            文件监听 (chokidar)
```

---

## 📁 技术栈

### 选型原则

- **轻量** - 低资源占用，适合服务器部署
- **成熟** - 社区活跃，文档完善
- **性能** - 快速响应，支持并发
- **安全** - 内置安全机制，易加固

### 前端技术栈

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **框架** | Vue 3 | 3.4+ | 组合式 API，性能优异 |
| **构建** | Vite | 5.x | 极速开发体验 |
| **UI** | Element Plus | 2.x | 成熟组件库 |
| **Markdown** | markdown-it | 14.x | 高性能解析器 |
| **高亮** | highlight.js | 11.x | 代码语法高亮 |
| **状态** | Pinia | 2.x | Vue3 官方推荐 |
| **路由** | Vue Router | 4.x | SPA 路由 |
| **HTTP** | Axios | 1.x | API 调用 |

### 后端技术栈

| 组件 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **运行时** | Node.js | 18+ LTS | 异步 IO，高性能 |
| **框架** | Fastify | 4.x | 比 Express 快 2-3 倍 |
| **文件监听** | chokidar | 3.x | 跨平台文件监听 |
| **搜索** | flexsearch | 0.7.x | 内存全文搜索 |
| **Markdown** | markdown-it | 14.x | 与前端一致 |
| **认证** | @fastify/jwt | 7.x | JWT 认证 |
| **日志** | pino | 8.x | 高性能日志 |
| **配置** | dotenv | 16.x | 环境变量 |

### 部署技术栈

| 组件 | 技术 | 说明 |
|------|------|------|
| **Web 服务器** | Nginx | 反向代理、静态文件、HTTPS |
| **进程管理** | PM2 | Node.js 进程守护、日志、监控 |
| **SSL 证书** | Let's Encrypt | 免费自动续期 |
| **防火墙** | UFW | 端口访问控制 |

---

## 📂 项目结构

```
/path/to/your/home/.openclaw/projects/doc-viewer/
│
├── workspace/                          # 工作区
│   ├── ARCHITECTURE.md                 # 架构文档
│   │
│   ├── frontend/                       # 前端 (Vue 3)
│   │   ├── src/
│   │   │   ├── components/             # 组件
│   │   │   │   ├── DirectoryTree.vue   # 目录树 (懒加载)
│   │   │   │   ├── MarkdownViewer.vue  # Markdown 渲染
│   │   │   │   ├── SearchPanel.vue     # 搜索面板
│   │   │   │   ├── BreadCrumb.vue      # 面包屑导航
│   │   │   │   └── AppHeader.vue       # 顶部导航
│   │   │   ├── views/                  # 页面
│   │   │   │   ├── Home.vue            # 首页 (统计 + 最近)
│   │   │   │   ├── Document.vue        # 文档详情
│   │   │   │   └── Search.vue          # 搜索结果
│   │   │   ├── stores/                 # 状态管理
│   │   │   │   ├── tree.js             # 目录树状态
│   │   │   │   ├── doc.js              # 文档状态
│   │   │   │   └── search.js           # 搜索状态
│   │   │   ├── composables/            # 组合式函数
│   │   │   │   ├── useFileTree.js      # 文件树逻辑
│   │   │   │   └── useMarkdown.js      # Markdown 渲染
│   │   │   ├── api/                    # API 封装
│   │   │   │   └── index.js
│   │   │   ├── utils/                  # 工具函数
│   │   │   │   └── path.js             # 路径处理
│   │   │   ├── App.vue
│   │   │   └── main.js
│   │   ├── public/
│   │   │   └── favicon.ico
│   │   ├── index.html
│   │   ├── package.json
│   │   └── vite.config.js
│   │
│   ├── backend/                        # 后端 (Node.js)
│   │   ├── src/
│   │   │   ├── routes/                 # 路由
│   │   │   │   ├── files.js            # 文件 API
│   │   │   │   ├── search.js           # 搜索 API
│   │   │   │   ├── config.js           # 配置 API
│   │   │   │   └── auth.js             # 认证 API
│   │   │   ├── services/               # 服务层
│   │   │   │   ├── fileScanner.js      # 文件扫描
│   │   │   │   ├── searchIndex.js      # 搜索索引
│   │   │   │   ├── markdownParser.js   # Markdown 解析
│   │   │   │   └── fileWatcher.js      # 文件监听
│   │   │   ├── middleware/             # 中间件
│   │   │   │   ├── auth.js             # 认证
│   │   │   │   └── security.js         # 安全
│   │   │   ├── config/                 # 配置
│   │   │   │   ├── default.js          # 默认配置
│   │   │   │   └── schema.js           # 配置校验
│   │   │   ├── utils/                  # 工具
│   │   │   │   ├── path.js             # 路径安全
│   │   │   │   └── logger.js           # 日志
│   │   │   ├── app.js                  # 应用入口
│   │   │   └── server.js               # 服务器启动
│   │   ├── config/                     # 运行时配置
│   │   │   └── production.json         # 生产配置
│   │   ├── package.json
│   │   └── ecosystem.config.js         # PM2 配置
│   │
│   ├── scripts/                        # 工具脚本
│   │   ├── build.sh                    # 构建脚本
│   │   ├── deploy.sh                   # 部署脚本
│   │   ├── init-config.sh              # 初始化配置
│   │   └── ssl-setup.sh                # SSL 证书设置
│   │
│   └── docs/                           # 项目文档
│       ├── API.md                      # API 文档
│       ├── DEPLOY.md                   # 部署指南
│       ├── CONFIG.md                   # 配置说明
│       └── USER-GUIDE.md               # 用户指南
│
├── memory/                             # 项目记忆
│   ├── MEMORY.md                       # 长期记忆
│   └── daily/                          # 每日进度
│       └── 2026-03-12.md
│
├── context/                            # 上下文
│   ├── tasks/                          # 任务
│   │   ├── active-tasks.json
│   │   └── completed-tasks.json
│   └── decisions/                      # 决策
│       └── decisions.json
│
└── .project-meta.json                  # 项目元数据
```

---

## 🔌 API 设计

### RESTful API 规范

**基础路径**: `/api/v1`

| 方法 | 路径 | 说明 | 认证 |
|------|------|------|------|
| `GET` | `/files` | 获取目录树 | 可选 |
| `GET` | `/files/*path` | 获取文件内容 | 可选 |
| `GET` | `/files/*path/raw` | 获取原始内容 | 可选 |
| `GET` | `/search` | 搜索文档 | 可选 |
| `GET` | `/search/suggest` | 搜索建议 | 可选 |
| `GET` | `/stats` | 获取统计信息 | 可选 |
| `POST` | `/refresh` | 刷新索引 | 需要 |
| `GET` | `/config` | 获取配置 | 需要 |
| `POST` | `/auth/login` | 用户登录 | - |
| `POST` | `/auth/logout` | 用户登出 | 需要 |

### API 响应格式

**成功响应**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2026-03-12",
    "version": "1.0.0"
  }
}
```

**错误响应**:
```json
{
  "success": false,
  "error": {
    "code": "FILE_NOT_FOUND",
    "message": "文件不存在",
    "details": { ... }
  }
}
```

### API 详细设计

#### GET /api/v1/files

获取目录树（支持懒加载）

**请求**:
```
GET /api/v1/files?path=/path/to/your/home/.openclaw&depth=1
```

**参数**:
| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `path` | string | root | 目录路径 |
| `depth` | number | 1 | 递归深度 |

**响应**:
```json
{
  "success": true,
  "data": {
    "path": "/path/to/your/home/.openclaw",
    "name": ".openclaw",
    "type": "directory",
    "children": [
      {
        "name": "agents",
        "path": "/path/to/your/home/.openclaw/agents",
        "type": "directory",
        "hasChildren": true,
        "mdCount": 15,
        "updatedAt": "2026-03-12"
      },
      {
        "name": "MEMORY.md",
        "path": "/path/to/your/home/.openclaw/MEMORY.md",
        "type": "file",
        "size": 1024,
        "sizeFormatted": "1KB",
        "updatedAt": "2026-03-12"
      }
    ]
  }
}
```

#### GET /api/v1/files/*path

获取文件内容和渲染后的 HTML

**请求**:
```
GET /api/v1/files/path/to/your/home/.openclaw/MEMORY.md
```

**响应**:
```json
{
  "success": true,
  "data": {
    "path": "/path/to/your/home/.openclaw/MEMORY.md",
    "name": "MEMORY.md",
    "type": "file",
    "content": "# Memory...\n...",
    "html": "<h1>Memory</h1>...",
    "meta": {
      "size": 1024,
      "sizeFormatted": "1KB",
      "lines": 50,
      "wordCount": 500,
      "updatedAt": "2026-03-12",
      "encoding": "UTF-8"
    }
  }
}
```

#### GET /api/v1/search

全文搜索

**请求**:
```
GET /api/v1/search?q=skill&limit=20&offset=0
```

**参数**:
| 参数 | 类型 | 默认 | 说明 |
|------|------|------|------|
| `q` | string | 必需 | 搜索关键词 |
| `limit` | number | 20 | 每页数量 |
| `offset` | number | 0 | 偏移量 |
| `path` | string | all | 限定目录 |

**响应**:
```json
{
  "success": true,
  "data": {
    "query": "skill",
    "total": 10,
    "limit": 20,
    "offset": 0,
    "results": [
      {
        "path": "/path/to/your/home/.openclaw/skills/project-manager/SKILL.md",
        "name": "SKILL.md",
        "title": "Project Manager Skill",
        "excerpt": "创建和管理 OpenClaw <em>技能</em>...",
        "score": 0.95,
        "highlights": ["技能", "技能"],
        "updatedAt": "2026-03-11"
      }
    ]
  }
}
```

#### GET /api/v1/stats

获取统计信息

**响应**:
```json
{
  "success": true,
  "data": {
    "totalFiles": 523,
    "totalDirectories": 89,
    "totalSize": 10485760,
    "totalSizeFormatted": "10MB",
    "lastScan": "2026-03-12",
    "rootDirs": [
      "/path/to/your/home/.openclaw",
      "/path/to/your/home/.openclaw",
      "/path/to/your/home/.openclaw-personal"
    ]
  }
}
```

---

## 🔐 安全设计

### 认证机制

```
┌─────────────────┐
│   用户登录       │
│   (用户名 + 密码) │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 验证凭据         │
│ (bcrypt 哈希)    │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 生成 JWT Token   │
│ (24h 过期)       │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 客户端存储       │
│ (localStorage)  │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ 后续请求携带     │
│ Authorization   │
└─────────────────┘
```

### 路径安全

**防止路径遍历攻击**:

```javascript
// 路径 sanitization
function sanitizePath(userPath, allowedRoots) {
  // 1. 解析为绝对路径
  const resolved = path.resolve(userPath);
  
  // 2. 检查是否在允许的根目录内
  const isAllowed = allowedRoots.some(root => 
    resolved.startsWith(path.resolve(root))
  );
  
  if (!isAllowed) {
    throw new SecurityError('Path not allowed');
  }
  
  // 3. 检查文件是否存在
  if (!fs.existsSync(resolved)) {
    throw new NotFoundError('File not found');
  }
  
  return resolved;
}
```

### 访问控制列表 (ACL)

| 路径模式 | 访客 | 认证用户 | 管理员 |
|---------|------|---------|-------|
| `/workspace/*` | ✅ 只读 | ✅ 只读 | ✅ 只读 |
| `/memory/*` | ❌ | ✅ 只读 | ✅ 只读 |
| `/projects/*` | ❌ | ✅ 只读 | ✅ 只读 |
| `/agents/*` | ❌ | ✅ 只读 | ✅ 只读 |
| `/api/refresh` | ❌ | ❌ | ✅ |
| `/api/config` | ❌ | ❌ | ✅ |

### 安全头

```nginx
# Nginx 安全头
add_header X-Frame-Options "SAMEORIGIN" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-XSS-Protection "1; mode=block" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline';" always;
```

---

## 📊 文件扫描服务

### 扫描配置

```javascript
{
  // 根目录列表
  rootDirs: [
    '/path/to/your/home/.openclaw',
    '/path/to/your/home/.openclaw',
    '/path/to/your/home/.openclaw-personal'
  ],
  
  // 包含的文件模式
  include: [
    '**/*.md',
    '**/*.markdown'
  ],
  
  // 排除的目录
  exclude: [
    '**/node_modules/**',
    '**/.git/**',
    '**/cache/**',
    '**/tmp/**',
    '**/logs/**',
    '**/dist/**'
  ],
  
  // 文件监听
  watch: {
    enabled: true,
    debounce: 1000,  // 防抖 1 秒
    persistent: true
  },
  
  // 索引选项
  index: {
    tokenize: 'forward',  // 分词方式
    charset: 'latin:extra',  // 字符集
    optimize: true  // 优化搜索
  }
}
```

### 索引结构

```javascript
// 文档索引
{
  documents: Map<id, Document>,
  index: FlexSearch.Index,
  
  // 文档结构
  Document: {
    id: string,           // 唯一 ID (路径 hash)
    path: string,         // 完整路径
    name: string,         // 文件名
    title: string,        // 从 Markdown 提取的标题
    content: string,      // 纯文本内容
    excerpt: string,      // 摘要 (前 200 字)
    tags: string[],       // 标签
    rootDir: string,      // 所属根目录
    size: number,         // 文件大小
    lines: number,        // 行数
    wordCount: number,    // 字数
    createdAt: Date,      // 创建时间
    updatedAt: Date       // 更新时间
  }
}
```

### 扫描流程

```
┌─────────────┐
│  启动扫描    │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 遍历目录树   │
│ (排除忽略项) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 读取.md 文件  │
│ (UTF-8)     │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 提取元数据   │
│ (标题、摘要) │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 建立搜索索引 │
│ (FlexSearch)│
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ 缓存文件列表 │
│ (内存 + 可选磁盘)│
└─────────────┘
```

---

## 🎨 前端设计

### 页面布局

```
┌─────────────────────────────────────────────────────────────────────────┐
│  Header (60px)                                                          │
│  ┌──────┐  OpenClaw Doc Viewer    ┌──────────────┐  👤 admin  ⚙️       │
│  │ Logo │                         │ 🔍 搜索...   │                      │
│  └──────┘                         └──────────────┘                      │
├────────────┬────────────────────────────────────────────────────────────┤
│            │                                                            │
│ 侧边栏     │  主内容区                                                   │
│ (280px)    │                                                            │
│            │  ┌──────────────────────────────────────────────────────┐  │
│ 📂 目录树  │  │ 面包屑：home > .openclaw > MEMORY.md            │  │
│            │  └──────────────────────────────────────────────────────┘  │
│ ▼ agents   │                                                            │
│ ▼ skills   │  ┌──────────────────────────────────────────────────────┐  │
│ ▼ memory   │  │                                                      │  │
│ ▼ projects │  │  # Memory                                            │  │
│            │  │                                                      │  │
│            │  │  这是长期记忆文件...                                  │  │
│            │  │                                                      │  │
│            │  │  ## 项目进度                                         │  │
│            │  │  - 项目 A: 80%                                       │  │
│            │  │  - 项目 B: 60%                                       │  │
│            │  │                                                      │  │
│            │  │  ```javascript                                       │  │
│            │  │  // 代码高亮                                         │  │
│            │  │  ```                                                 │  │
│            │  │                                                      │  │
│            │  └──────────────────────────────────────────────────────┘  │
│            │                                                            │
├────────────┴────────────────────────────────────────────────────────────┤
│  Footer (40px)                                                          │
│  📊 共 523 个文档 | 💾 10MB | 🕐 最后更新：2026-03-12                    │
└─────────────────────────────────────────────────────────────────────────┘
```

### 响应式设计

| 断点 | 宽度 | 布局 |
|------|------|------|
| **Desktop** | ≥1024px | 侧边栏 + 主内容 |
| **Tablet** | 768-1023px | 可折叠侧边栏 |
| **Mobile** | <768px | 全屏内容，汉堡菜单 |

### 组件设计

#### DirectoryTree.vue

```vue
<template>
  <el-tree
    ref="treeRef"
    :data="rootNodes"
    :load="loadNode"
    lazy
    :props="{ label: 'name', children: 'children', isLeaf: 'isLeaf' }"
    @node-click="handleNodeClick"
    :expand-on-click-node="false"
  >
    <template #default="{ node, data }">
      <span class="tree-node">
        <i :class="getIcon(data.type, data.name)" class="node-icon"></i>
        <span class="node-label">{{ node.label }}</span>
        <span v-if="data.mdCount" class="md-count">({{ data.mdCount }})</span>
      </span>
    </template>
  </el-tree>
</template>

<script setup>
const loadNode = async (node, resolve) => {
  const path = node.data?.path || '/'
  const { data } = await api.getFiles({ path, depth: 1 })
  resolve(data.children || [])
}
</script>
```

#### MarkdownViewer.vue

```vue
<template>
  <div class="markdown-body" v-html="renderedHtml"></div>
</template>

<script setup>
import markdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'github-markdown-css'
import 'highlight.js/styles/github.css'

const md = markdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: (str, lang) => {
    if (lang && hljs.getLanguage(lang)) {
      return hljs.highlight(str, { language: lang }).value
    }
    return ''
  }
})

const renderedHtml = computed(() => md.render(props.content))
</script>

<style>
@import 'github-markdown-css';
.markdown-body {
  box-sizing: border-box;
  padding: 2rem;
  max-width: 900px;
  margin: 0 auto;
}
</style>
```

---

## 🚀 部署方案

### 环境要求

| 组件 | 最低 | 推荐 |
|------|------|------|
| **CPU** | 1 核 | 2 核 |
| **内存** | 512MB | 1GB |
| **磁盘** | 100MB | 500MB |
| **Node.js** | 18.x | 20.x LTS |
| **Nginx** | 1.18+ | 1.24+ |

### 部署流程

```bash
# =====================
# 1. 准备环境
# =====================
# 安装 Node.js (如未安装)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 安装 Nginx
sudo apt install -y nginx

# 安装 PM2
sudo npm install -g pm2

# =====================
# 2. 构建前端
# =====================
cd /path/to/your/home/.openclaw/projects/doc-viewer/workspace/frontend
npm install
npm run build
# 输出：dist/

# =====================
# 3. 安装后端
# =====================
cd ../backend
npm install --production

# 配置环境变量
cp .env.example .env
nano .env  # 编辑配置

# =====================
# 4. 配置 Nginx
# =====================
sudo cp nginx.conf /etc/nginx/sites-available/doc-viewer
sudo ln -s /etc/nginx/sites-available/doc-viewer /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# =====================
# 5. 启动后端
# =====================
cd ../backend
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup  # 生成开机启动命令

# =====================
# 6. 配置 HTTPS
# =====================
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d docs.yourdomain.com

# =====================
# 7. 配置防火墙
# =====================
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Nginx 配置

```nginx
server {
    listen 80;
    server_name docs.yourdomain.com;
    
    # 重定向到 HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name docs.yourdomain.com;

    # SSL 证书
    ssl_certificate /etc/letsencrypt/live/docs.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docs.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # 安全头
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # 前端静态文件
    location / {
        root /path/to/your/home/.openclaw/projects/doc-viewer/workspace/frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存
        expires 1d;
        add_header Cache-Control "public, immutable";
    }

    # 后端 API
    location /api/ {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # 日志
    access_log /var/log/nginx/doc-viewer-access.log;
    error_log /var/log/nginx/doc-viewer-error.log;
}
```

### PM2 配置 (ecosystem.config.js)

```javascript
module.exports = {
  apps: [{
    name: 'doc-viewer-api',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M',
    watch: false
  }]
}
```

---

## 📋 开发计划

### Phase 1: 核心功能 (预计 1-2 周)

| 任务 | 优先级 | 预计 | 状态 |
|------|--------|------|------|
| 后端项目初始化 | P0 | 0.5 天 | ⏳ 待开始 |
| 文件扫描服务 | P0 | 1 天 | ⏳ 待开始 |
| 文件 API (列表、内容) | P0 | 1 天 | ⏳ 待开始 |
| 前端项目初始化 | P0 | 0.5 天 | ⏳ 待开始 |
| 目录树组件 | P0 | 2 天 | ⏳ 待开始 |
| Markdown 渲染器 | P0 | 1 天 | ⏳ 待开始 |
| 基础布局 | P1 | 1 天 | ⏳ 待开始 |

**里程碑**: 可查看任意 .md 文件

### Phase 2: 搜索功能 (预计 1 周)

| 任务 | 优先级 | 预计 | 状态 |
|------|--------|------|------|
| 搜索索引服务 | P0 | 1 天 | ⏳ 待开始 |
| 搜索 API | P0 | 1 天 | ⏳ 待开始 |
| 前端搜索组件 | P0 | 1 天 | ⏳ 待开始 |
| 搜索结果高亮 | P1 | 1 天 | ⏳ 待开始 |
| 搜索建议 | P2 | 1 天 | ⏳ 待开始 |

**里程碑**: 可全文搜索所有文档

### Phase 3: 增强功能 (预计 1-2 周)

| 任务 | 优先级 | 预计 | 状态 |
|------|--------|------|------|
| 用户认证系统 | P0 | 2 天 | ⏳ 待开始 |
| 权限控制 | P0 | 1 天 | ⏳ 待开始 |
| 文件变更监听 | P1 | 1 天 | ⏳ 待开始 |
| 响应式设计 | P1 | 2 天 | ⏳ 待开始 |
| 面包屑导航 | P2 | 0.5 天 | ⏳ 待开始 |
| 统计面板 | P2 | 1 天 | ⏳ 待开始 |

**里程碑**: 生产就绪

### Phase 4: 部署优化 (预计 1 周)

| 任务 | 优先级 | 预计 | 状态 |
|------|--------|------|------|
| HTTPS 配置 | P0 | 0.5 天 | ⏳ 待开始 |
| 性能优化 | P1 | 2 天 | ⏳ 待开始 |
| 日志监控 | P1 | 1 天 | ⏳ 待开始 |
| 备份策略 | P2 | 1 天 | ⏳ 待开始 |
| 文档完善 | P2 | 1.5 天 | ⏳ 待开始 |

**里程碑**: 正式上线

---

## ⚠️ 风险与注意事项

### 安全风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 路径遍历攻击 | 高 | 严格路径校验、白名单机制 |
| 未授权访问 | 高 | JWT 认证、ACL 控制 |
| XSS 攻击 | 中 | Markdown 净化、CSP 头 |
| 敏感信息泄露 | 高 | 排除敏感目录、访问日志 |

### 性能风险

| 风险 | 影响 | 缓解措施 |
|------|------|---------|
| 大文件加载慢 | 中 | 懒加载、分页、流式传输 |
| 搜索响应慢 | 中 | 内存索引、搜索结果限制 |
| 目录树过大 | 中 | 懒加载、虚拟滚动 |
| 内存泄漏 | 高 | 定期重启、内存监控 |

### 运维注意事项

1. **文件权限** - 确保运行用户有读取 OpenClaw 目录的权限
   ```bash
   sudo usermod -aG your-username www-data
   sudo chmod -R 750 /path/to/your/home/.openclaw
   ```

2. **文件锁定** - 避免读取正在写入的文件
   ```javascript
   // 读取前检查文件是否被占用
   try {
     fs.openSync(path, 'r');
     // 读取文件
   } catch (e) {
     // 文件被占用，返回缓存或错误
   }
   ```

3. **编码处理** - 统一使用 UTF-8 编码
   ```javascript
   const content = fs.readFileSync(path, 'utf-8');
   ```

4. **日志轮转** - 配置日志轮转避免磁盘占满
   ```javascript
   // PM2 配置
   max_memory_restart: '500M'
   ```

---

## 📊 监控与运维

### 健康检查

```bash
# API 健康检查
curl https://docs.yourdomain.com/api/v1/stats

# 后端进程检查
pm2 status doc-viewer-api

# Nginx 状态
sudo systemctl status nginx
```

### 日志位置

| 组件 | 日志路径 |
|------|---------|
| Nginx 访问 | `/var/log/nginx/doc-viewer-access.log` |
| Nginx 错误 | `/var/log/nginx/doc-viewer-error.log` |
| PM2 应用 | `~/.pm2/logs/doc-viewer-api-out.log` |
| PM2 错误 | `~/.pm2/logs/doc-viewer-api-error.log` |

### 备份策略

```bash
# 每日备份配置
0 2 * * * tar -czf /backup/doc-viewer-$(date +\%Y\%m\%d).tar.gz \
    /path/to/your/home/.openclaw/projects/doc-viewer/workspace/backend/config/
```

---

## 🔗 参考资料

- [Vue 3 文档](https://vuejs.org/)
- [Fastify 文档](https://www.fastify.io/)
- [markdown-it 文档](https://markdown-it.github.io/)
- [FlexSearch 文档](https://github.com/nextapps-de/flexsearch)
- [Nginx 配置最佳实践](https://www.nginx.com/resources/wiki/start/topics/tutorials/config_pitfalls/)

---

*OpenClaw Doc Viewer 架构设计 v2.0 - 2026-03-12*
