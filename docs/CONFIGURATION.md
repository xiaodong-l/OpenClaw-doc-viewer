# Configuration Guide / 配置指南

**English** | [简体中文](#简体中文)

---

## English

### Backend Configuration

All backend configuration is done via environment variables in `.env` file.

#### Required Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `PORT` | Server port | `3000` | `3000` |
| `ROOT_DIRS` | Document root directories (comma-separated) | - | `/home/user/docs,/home/user/notes` |
| `JWT_SECRET` | JWT signing secret (REQUIRED in production) | - | `your-secret-key` |

#### Optional Variables

| Variable | Description | Default | Example |
|----------|-------------|---------|---------|
| `HOST` | Server host | `0.0.0.0` | `localhost` |
| `NODE_ENV` | Environment | `production` | `development` |
| `LOG_LEVEL` | Log level | `info` | `debug` |
| `SCAN_DEBOUNCE_MS` | File scan debounce | `1000` | `2000` |
| `MAX_FILE_SIZE_MB` | Max file size | `10` | `20` |
| `EXCLUDE_PATTERNS` | Excluded directories | `node_modules,.git` | `node_modules,.git,cache` |

#### Example .env

```bash
# Server
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# Documents
ROOT_DIRS=/home/user/docs,/home/user/notes

# Security
JWT_SECRET=your-super-secret-key-change-in-production

# File Scanning
SCAN_DEBOUNCE_MS=1000
MAX_FILE_SIZE_MB=10
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs

# Logging
LOG_LEVEL=info
```

### Frontend Configuration

Frontend configuration is done via `workspace/frontend/.env`:

```bash
# API URL
VITE_API_URL=http://localhost:3000/api/v1

# App Title
VITE_APP_TITLE=Doc Viewer

# Features
VITE_ENABLE_COMMENTS=true
VITE_ENABLE_SEARCH=true
VITE_ENABLE_DARK_MODE=true
```

### Advanced Configuration

#### Multiple Document Sources

```bash
ROOT_DIRS=/home/user/docs,/mnt/shared/documents,/opt/wiki
```

#### Custom Exclusions

```bash
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs,dist,.DS_Store,Thumbs.db
```

#### Performance Tuning

```bash
# Increase debounce for large directories
SCAN_DEBOUNCE_MS=3000

# Increase max file size for large documents
MAX_FILE_SIZE_MB=50

# Reduce log verbosity in production
LOG_LEVEL=warn
```

---

## 简体中文

### 后端配置

所有后端配置通过 `.env` 文件中的环境变量完成。

#### 必需变量

| 变量 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `PORT` | 服务器端口 | `3000` | `3000` |
| `ROOT_DIRS` | 文档根目录 (逗号分隔) | - | `/home/user/docs,/home/user/notes` |
| `JWT_SECRET` | JWT 签名密钥 (生产环境必需) | - | `your-secret-key` |

#### 可选变量

| 变量 | 说明 | 默认值 | 示例 |
|------|------|--------|------|
| `HOST` | 服务器主机 | `0.0.0.0` | `localhost` |
| `NODE_ENV` | 环境 | `production` | `development` |
| `LOG_LEVEL` | 日志级别 | `info` | `debug` |
| `SCAN_DEBOUNCE_MS` | 文件扫描防抖 | `1000` | `2000` |
| `MAX_FILE_SIZE_MB` | 最大文件大小 | `10` | `20` |
| `EXCLUDE_PATTERNS` | 排除的目录 | `node_modules,.git` | `node_modules,.git,cache` |

#### .env 示例

```bash
# 服务器
PORT=3000
HOST=0.0.0.0
NODE_ENV=production

# 文档
ROOT_DIRS=/home/user/docs,/home/user/notes

# 安全
JWT_SECRET=your-super-secret-key-change-in-production

# 文件扫描
SCAN_DEBOUNCE_MS=1000
MAX_FILE_SIZE_MB=10
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs

# 日志
LOG_LEVEL=info
```

### 前端配置

前端配置通过 `workspace/frontend/.env` 完成：

```bash
# API URL
VITE_API_URL=http://localhost:3000/api/v1

# 应用标题
VITE_APP_TITLE=Doc Viewer

# 功能
VITE_ENABLE_COMMENTS=true
VITE_ENABLE_SEARCH=true
VITE_ENABLE_DARK_MODE=true
```

### 高级配置

#### 多文档源

```bash
ROOT_DIRS=/home/user/docs,/mnt/shared/documents,/opt/wiki
```

#### 自定义排除

```bash
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs,dist,.DS_Store,Thumbs.db
```

#### 性能调优

```bash
# 大目录增加防抖时间
SCAN_DEBOUNCE_MS=3000

# 大文档增加文件大小限制
MAX_FILE_SIZE_MB=50

# 生产环境减少日志输出
LOG_LEVEL=warn
```

---

## Troubleshooting / 故障排除

### English

| Issue | Solution |
|-------|----------|
| Can't access documents | Check `ROOT_DIRS` path and permissions |
| Search not working | Ensure `SCAN_DEBOUNCE_MS` is not too low |
| High memory usage | Reduce `MAX_FILE_SIZE_MB` |
| Too many logs | Set `LOG_LEVEL=warn` or `error` |

### 简体中文

| 问题 | 解决方案 |
|------|----------|
| 无法访问文档 | 检查 `ROOT_DIRS` 路径和权限 |
| 搜索不工作 | 确保 `SCAN_DEBOUNCE_MS` 不太低 |
| 内存使用高 | 降低 `MAX_FILE_SIZE_MB` |
| 日志太多 | 设置 `LOG_LEVEL=warn` 或 `error` |

---

## Related Documents / 相关文档

- [Installation Guide](INSTALL.md)
- [Deployment Guide](DEPLOYMENT.md)
- [Quick Start](QUICKSTART.md)

---

*Last updated: 2026-03-15*
