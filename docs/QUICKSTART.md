# 快速开始 / Quick Start

**English** | [简体中文](#简体中文)

---

## English

### Get Started in 5 Minutes

Follow these steps to have OpenClaw Doc Viewer running quickly.

### Step 1: Clone and Install (2 minutes)

```bash
# Clone repository
git clone https://github.com/openclaw/doc-viewer.git
cd doc-viewer

# Install backend
cd workspace/backend
npm install

# Install frontend (new terminal)
cd ../frontend
npm install
```

### Step 2: Configure (1 minute)

Create backend configuration:

```bash
cd ../backend
cp .env.example .env
```

Edit `.env`:

```bash
PORT=3000
ROOT_DIRS=/path/to/your/documents
JWT_SECRET=change-this-secret-key
```

### Step 3: Start Services (1 minute)

```bash
# Terminal 1 - Start backend
cd workspace/backend
npm run dev

# Terminal 2 - Start frontend
cd workspace/frontend
npm run dev
```

### Step 4: Access (1 minute)

Open browser and visit: http://localhost:5173

**Login with default credentials:**
- Username: `admin`
- Password: `admin123`

### Step 5: Add Documents

Point to your document directory by editing `ROOT_DIRS` in `.env`:

```bash
ROOT_DIRS=/home/user/docs,/home/user/notes
```

Restart backend to apply changes.

---

## 简体中文

### 5 分钟快速上手

按照以下步骤快速运行 OpenClaw Doc Viewer。

### 步骤 1: 克隆和安装 (2 分钟)

```bash
# 克隆仓库
git clone https://github.com/openclaw/doc-viewer.git
cd doc-viewer

# 安装后端
cd workspace/backend
npm install

# 安装前端 (新终端)
cd ../frontend
npm install
```

### 步骤 2: 配置 (1 分钟)

创建后端配置：

```bash
cd ../backend
cp .env.example .env
```

编辑 `.env`:

```bash
PORT=3000
ROOT_DIRS=/path/to/your/documents
JWT_SECRET=change-this-secret-key
```

### 步骤 3: 启动服务 (1 分钟)

```bash
# 终端 1 - 启动后端
cd workspace/backend
npm run dev

# 终端 2 - 启动前端
cd workspace/frontend
npm run dev
```

### 步骤 4: 访问 (1 分钟)

打开浏览器访问：http://localhost:5173

**使用默认凭据登录:**
- 用户名：`admin`
- 密码：`admin123`

### 步骤 5: 添加文档

编辑 `.env` 中的 `ROOT_DIRS` 指向您的文档目录：

```bash
ROOT_DIRS=/home/user/docs,/home/user/notes
```

重启后端使更改生效。

---

## First Steps / 首次使用

### English

1. **Change Password**
   - Go to User Settings
   - Change default admin password

2. **Add Users** (Optional)
   - Admin panel → User Management
   - Create new users with appropriate roles

3. **Configure Document Sources**
   - Edit `ROOT_DIRS` in `.env`
   - Restart backend

4. **Explore Features**
   - Browse directory tree
   - Try full-text search
   - Test document sharing

### 简体中文

1. **修改密码**
   - 进入用户设置
   - 修改默认 admin 密码

2. **添加用户** (可选)
   - 管理面板 → 用户管理
   - 创建具有适当角色的新用户

3. **配置文档源**
   - 编辑 `.env` 中的 `ROOT_DIRS`
   - 重启后端

4. **探索功能**
   - 浏览目录树
   - 尝试全文搜索
   - 测试文档分享

---

## Common Tasks / 常见任务

### English

| Task | Command/Action |
|------|----------------|
| Start in production | `pm2 start config/pm2.config.js` |
| View logs | `pm2 logs` |
| Restart service | `pm2 restart doc-viewer-api` |
| Backup data | Copy `workspace/backend/data/*.json` |
| Update | `git pull && npm install && npm run build` |

### 简体中文

| 任务 | 命令/操作 |
|------|----------|
| 生产环境启动 | `pm2 start config/pm2.config.js` |
| 查看日志 | `pm2 logs` |
| 重启服务 | `pm2 restart doc-viewer-api` |
| 备份数据 | 复制 `workspace/backend/data/*.json` |
| 更新 | `git pull && npm install && npm run build` |

---

## Troubleshooting / 故障排除

### English

**Problem**: Can't access documents

**Solution**: Check `ROOT_DIRS` path and permissions

```bash
# Verify path exists
ls -la /path/to/documents

# Check permissions
chmod -R 755 /path/to/documents
```

**Problem**: Search not working

**Solution**: Refresh search index

```bash
# In backend
curl http://localhost:3000/api/v1/refresh
```

### 简体中文

**问题**: 无法访问文档

**解决方案**: 检查 `ROOT_DIRS` 路径和权限

```bash
# 验证路径存在
ls -la /path/to/documents

# 检查权限
chmod -R 755 /path/to/documents
```

**问题**: 搜索不工作

**解决方案**: 刷新搜索索引

```bash
# 在后端
curl http://localhost:3000/api/v1/refresh
```

---

## Next Steps / 下一步

### English

- [Installation Guide](INSTALL.md) - Detailed installation steps
- [Deployment Guide](DEPLOYMENT.md) - Production deployment
- [API Reference](API.md) - API documentation

### 简体中文

- [安装指南](INSTALL.md) - 详细安装步骤
- [部署指南](DEPLOYMENT.md) - 生产环境部署
- [API 参考](API.md) - API 文档

---

## Need Help? / 需要帮助？

- 📖 Read the [Documentation](/)
- 🐛 Report issues on [GitHub](https://github.com/openclaw/doc-viewer/issues)
- 💬 Ask questions in [Discussions](https://github.com/openclaw/doc-viewer/discussions)

---

*Congratulations! You're now running OpenClaw Doc Viewer!* 🎉

*恭喜！您现在正在运行 OpenClaw Doc Viewer!* 🎉
