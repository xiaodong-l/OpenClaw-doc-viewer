# OpenClaw Doc Viewer

为 OpenClaw 生成的 `.md` 文档提供 Web 界面查看，支持目录树导航、Markdown 渲染和全文搜索。

## 📌 当前版本

**v1.3.0** - 用户体验与协作功能增强版 (2026-03-13) 🆕

## 🎯 功能特性

### 核心功能
- ✅ **目录树导航** - 可视化浏览 Linux 目录结构
- ✅ **Markdown 渲染** - 美观的文档预览（含代码高亮）
- ✅ **全文搜索** - 快速定位文档内容 (FlexSearch, 1878+ 文档)
- ✅ **多实例支持** - 统一查看多个 OpenClaw 实例
- ✅ **实时更新** - 文件变更自动刷新
- ✅ **用户认证** - JWT 认证 + 权限控制
- ✅ **HTTPS 支持** - Let's Encrypt SSL 证书

### 用户功能 (v1.2.0)
- ✅ **头像上传** - 个性化用户头像
- ✅ **文档收藏** - 收藏夹管理
- ✅ **阅读历史** - 自动记录阅读轨迹
- ✅ **文档分享** - 生成分享链接
- ✅ **暗黑模式** - 完整主题切换

### 协作功能 (v1.3.0) 🆕
- 🆕 **公开分享页面** - 无需登录即可查看分享文档
- 🆕 **批量收藏管理** - 批量删除/移动文档
- 🆕 **文档评论** - 评论、回复、点赞、编辑、删除

## 📁 项目结构

```
doc-viewer/
├── workspace/
│   ├── backend/          # Node.js 后端 (Fastify)
│   ├── frontend/         # Vue 3 前端
│   ├── config/           # 生产配置 (Nginx, PM2)
│   └── scripts/          # 构建和部署脚本
├── memory/               # 项目记忆
└── context/              # 项目上下文
```

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn
- (可选) PM2 用于生产部署
- (可选) Nginx 用于反向代理

### 开发模式

```bash
# 1. 安装后端依赖
cd workspace/backend
npm install

# 2. 启动后端
npm run dev

# 3. 安装前端依赖 (新终端)
cd workspace/frontend
npm install

# 4. 启动前端
npm run dev
```

访问 http://localhost:5173

**默认管理员账号**: `admin` / `admin123`

### 生产部署

**一键部署** (推荐):
```bash
./workspace/scripts/production-deploy.sh
```

**手动部署**:
```bash
# 1. 构建前端
cd workspace/frontend
npm install
npm run build

# 2. 安装后端依赖
cd ../backend
npm install --production

# 3. 启动服务
cd ..
pm2 start config/pm2.config.js --env production
pm2 save
```

## 📖 API 文档

### 认证 API

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | `/api/v1/auth/login` | 用户登录 | 公开 |
| POST | `/api/v1/auth/logout` | 用户登出 | 认证 |
| GET | `/api/v1/auth/me` | 获取当前用户 | 认证 |
| GET | `/api/v1/auth/users` | 用户列表 | 管理员 |
| POST | `/api/v1/auth/users` | 创建用户 | 管理员 |
| DELETE | `/api/v1/auth/users/:id` | 删除用户 | 管理员 |

### 文件 API

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/v1/files` | 获取目录树 | 公开 |
| GET | `/api/v1/files/*path` | 获取文件内容 | 公开 |
| GET | `/api/v1/files/*path/raw` | 获取原始内容 | 公开 |

### 搜索 API

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/v1/search?q=keyword` | 搜索文档 | 公开 |
| GET | `/api/v1/search/suggest?q=keyword` | 搜索建议 | 公开 |

### 统计 API

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | `/api/v1/stats` | 获取统计信息 | 公开 |
| POST | `/api/v1/refresh` | 刷新索引 | 管理员 |

## ⚙️ 配置

### 环境变量

编辑 `workspace/backend/.env`:

```bash
# 服务端口
PORT=3000

# 根目录 (逗号分隔)
ROOT_DIRS=/path/to/your/home/.openclaw,/path/to/your/home/.openclaw

# JWT 密钥 (生产环境请修改)
JWT_SECRET=your-secret-key

# 排除的目录
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp
```

### Nginx 配置

```bash
# 复制配置
sudo cp workspace/config/nginx.conf /etc/nginx/sites-available/doc-viewer
sudo ln -s /etc/nginx/sites-available/doc-viewer /etc/nginx/sites-enabled/

# 修改域名后重载
sudo nginx -t && sudo systemctl reload nginx
```

### SSL 证书

```bash
# 自动配置
./workspace/scripts/ssl-setup.sh docs.yourdomain.com admin@example.com
```

## 📊 技术栈

**后端:**
| 技术 | 用途 |
|------|------|
| Node.js 18+ | 运行时 |
| Fastify 4.x | Web 框架 |
| chokidar 3.x | 文件监听 |
| flexsearch 0.7.x | 全文搜索 |
| markdown-it 14.x | Markdown 解析 |
| @fastify/jwt 8.x | JWT 认证 |

**前端:**
| 技术 | 用途 |
|------|------|
| Vue 3 3.4+ | 框架 |
| Vite 5.x | 构建工具 |
| Element Plus 2.x | UI 组件 |
| markdown-it 14.x | Markdown 渲染 |
| highlight.js 11.x | 代码高亮 |
| Pinia 2.x | 状态管理 |

**部署:**
| 技术 | 用途 |
|------|------|
| Nginx 1.18+ | 反向代理 |
| PM2 5.x | 进程管理 |
| Let's Encrypt | SSL 证书 |

## 🔐 安全

### 认证机制
- JWT Token (24 小时过期)
- 密码 SHA-256 哈希
- 路由守卫保护

### 权限控制
| 角色 | 权限 |
|------|------|
| admin | read, write, admin, users.manage |
| editor | read, write |
| viewer | read |

### 安全措施
- 严格路径校验 (防止路径遍历)
- 只读访问 OpenClaw 目录
- 安全 HTTP 头 (XSS, CSRF 防护)
- HTTPS 强制重定向

## 📝 部署脚本

| 脚本 | 用途 |
|------|------|
| `scripts/build.sh` | 构建前后端 |
| `scripts/deploy.sh` | 快速部署 |
| `scripts/production-deploy.sh` | 生产环境部署 |
| `scripts/ssl-setup.sh` | SSL 证书配置 |
| `scripts/monitoring-setup.sh` | 监控配置 |

## 🔧 管理命令

### PM2 管理
```bash
# 查看状态
pm2 status

# 查看日志
pm2 logs

# 重启服务
pm2 restart doc-viewer-api

# 停止服务
pm2 stop doc-viewer-api
```

### 监控
```bash
# 查看监控
./workspace/logs/view-logs.sh

# 监控日志
tail -f workspace/logs/monitor.log
```

## 📋 版本历史

### v1.2.0 - 用户功能完整版 (2026-03-13) ✅

| Sprint | 功能 | API 端点 |
|--------|------|----------|
| 1 | 👤 头像上传 | `/api/v1/user/avatar` |
| 2 | ⭐ 文档收藏 | `/api/v1/collections/*` |
| 3 | 📜 阅读历史 | `/api/v1/user/history/*` |
| 4 | 🔗 文档分享 | `/api/v1/shares/*` |
| 5 | 🌙 暗黑模式 | 主题切换组件 |

### v1.1.0 - 核心功能增强版

| Sprint | 功能 |
|--------|------|
| 1 | 全文搜索 (FlexSearch) |
| 2 | 目录树懒加载 |
| 3 | 面包屑导航 |
| 4 | 响应式设计 |
| 5 | 预览增强 (TOC + 进度条) |

### v1.0.0 - 初始版本

- 核心文件查看功能
- JWT 认证
- 基础 API 端点

## 📄 License

MIT

---

*OpenClaw Doc Viewer v1.2.0 - 2026-03-13*

## 🔗 相关链接

- **生产环境**: https://your-domain.com:YOUR_PORT/
- **Git 仓库**: https://github.com/xiaodong-l/doc-viewer
- **发布说明**: [workspace/docs/v1.2.0-release-notes.md](workspace/docs/v1.2.0-release-notes.md)
