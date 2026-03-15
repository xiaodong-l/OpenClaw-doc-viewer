# 安装指南 / Installation Guide

**English** | [简体中文](#简体中文)

---

## English

### Prerequisites

Before installing OpenClaw Doc Viewer, ensure you have:

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **npm** or **yarn** package manager
- **Git** for cloning the repository

### Step 1: Clone the Repository

```bash
git clone https://github.com/openclaw/doc-viewer.git
cd doc-viewer
```

### Step 2: Install Backend Dependencies

```bash
cd workspace/backend
npm install
```

### Step 3: Configure Backend

Create a `.env` file in the backend directory:

```bash
cp .env.example .env
```

Edit `.env` with your settings:

```bash
# Server configuration
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Root directories to scan (comma-separated)
ROOT_DIRS=/path/to/your/documents

# JWT Secret (CHANGE THIS IN PRODUCTION!)
JWT_SECRET=your-super-secret-key-change-me

# File scan settings
SCAN_DEBOUNCE_MS=1000
MAX_FILE_SIZE_MB=10

# Excluded patterns
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs,dist

# Log level
LOG_LEVEL=info
```

### Step 4: Install Frontend Dependencies

Open a new terminal:

```bash
cd workspace/frontend
npm install
```

### Step 5: Build Frontend (Production)

```bash
npm run build
```

### Step 6: Start Services

**Development Mode:**

```bash
# Terminal 1 - Backend
cd workspace/backend
npm run dev

# Terminal 2 - Frontend
cd workspace/frontend
npm run dev
```

**Production Mode:**

```bash
# Build frontend first
cd workspace/frontend
npm run build

# Start backend with PM2
cd ../backend
pm2 start config/pm2.config.js --env production
pm2 save
```

### Step 7: Verify Installation

Visit http://localhost:5173 (development) or your configured domain (production).

**Default Login:**
- Username: `admin`
- Password: `admin123`

> ⚠️ **Important**: Change the default password immediately!

---

## 简体中文

### 环境要求

安装 OpenClaw Doc Viewer 之前，请确保已安装：

- **Node.js** 18 或更高版本 ([下载](https://nodejs.org/))
- **npm** 或 **yarn** 包管理器
- **Git** 用于克隆仓库

### 步骤 1: 克隆仓库

```bash
git clone https://github.com/openclaw/doc-viewer.git
cd doc-viewer
```

### 步骤 2: 安装后端依赖

```bash
cd workspace/backend
npm install
```

### 步骤 3: 配置后端

在后端目录创建 `.env` 文件：

```bash
cp .env.example .env
```

编辑 `.env` 文件：

```bash
# 服务器配置
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# 文档根目录 (逗号分隔)
ROOT_DIRS=/path/to/your/documents

# JWT 密钥 (生产环境请修改!)
JWT_SECRET=your-super-secret-key-change-me

# 文件扫描设置
SCAN_DEBOUNCE_MS=1000
MAX_FILE_SIZE_MB=10

# 排除的目录
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs,dist

# 日志级别
LOG_LEVEL=info
```

### 步骤 4: 安装前端依赖

打开新终端：

```bash
cd workspace/frontend
npm install
```

### 步骤 5: 构建前端 (生产环境)

```bash
npm run build
```

### 步骤 6: 启动服务

**开发模式:**

```bash
# 终端 1 - 后端
cd workspace/backend
npm run dev

# 终端 2 - 前端
cd workspace/frontend
npm run dev
```

**生产模式:**

```bash
# 先构建前端
cd workspace/frontend
npm run build

# 使用 PM2 启动后端
cd ../backend
pm2 start config/pm2.config.js --env production
pm2 save
```

### 步骤 7: 验证安装

访问 http://localhost:5173 (开发) 或您配置的域名 (生产)。

**默认登录:**
- 用户名：`admin`
- 密码：`admin123`

> ⚠️ **重要**: 请立即修改默认密码！

---

## Troubleshooting / 故障排除

| Issue | Solution |
|-------|----------|
| `npm install` fails | Clear cache: `npm cache clean --force` |
| Port already in use | Change PORT in `.env` |
| Build fails | Ensure Node.js >= 18 |
| Can't access documents | Check ROOT_DIRS path permissions |

| 问题 | 解决方案 |
|------|----------|
| `npm install` 失败 | 清除缓存：`npm cache clean --force` |
| 端口已被占用 | 修改 `.env` 中的 PORT |
| 构建失败 | 确保 Node.js >= 18 |
| 无法访问文档 | 检查 ROOT_DIRS 路径权限 |

---

## Next Steps

- [Quick Start](QUICKSTART.md) - Get started in 5 minutes
- [Deployment](DEPLOYMENT.md) - Production deployment guide
- [Configuration](CONFIGURATION.md) - Advanced configuration options

## 下一步

- [快速开始](QUICKSTART.md) - 5 分钟快速上手
- [部署指南](DEPLOYMENT.md) - 生产环境部署
- [配置说明](CONFIGURATION.md) - 高级配置选项
