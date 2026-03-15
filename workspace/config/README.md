# OpenClaw Doc Viewer 配置文档

本目录包含生产环境部署所需的所有配置文件。

## 📁 文件说明

| 文件 | 用途 |
|------|------|
| `nginx.conf` | Nginx 反向代理配置 |
| `pm2.config.js` | PM2 进程管理配置 |
| `systemd/` | Systemd 服务配置 (可选) |

## 🚀 部署流程

### 快速部署

```bash
# 1. 运行部署脚本
./scripts/production-deploy.sh

# 2. 按提示输入域名和邮箱

# 3. 完成！
```

### 手动部署

#### 1. 构建前端

```bash
cd workspace/frontend
npm install
npm run build
```

#### 2. 安装后端依赖

```bash
cd workspace/backend
npm install --production
```

#### 3. 配置环境变量

```bash
cd workspace/backend
cp .env.example .env
# 编辑 .env 文件，修改配置
```

#### 4. 启动服务

```bash
# 使用 PM2
cd workspace
pm2 start config/pm2.config.js --env production
pm2 save
```

#### 5. 配置 Nginx

```bash
# 复制配置
sudo cp config/nginx.conf /etc/nginx/sites-available/doc-viewer
sudo ln -s /etc/nginx/sites-available/doc-viewer /etc/nginx/sites-enabled/

# 修改域名
sudo nano /etc/nginx/sites-available/doc-viewer

# 测试并重载
sudo nginx -t
sudo systemctl reload nginx
```

#### 6. 配置 SSL

```bash
# 运行 SSL 设置脚本
./scripts/ssl-setup.sh docs.yourdomain.com admin@example.com
```

## ⚙️ 配置说明

### Nginx 配置

编辑 `nginx.conf` 修改以下内容：

```nginx
server_name docs.yourdomain.com;  # 修改为你的域名
```

### PM2 配置

编辑 `pm2.config.js` 修改以下内容：

```javascript
env_production: {
  NODE_ENV: 'production',
  PORT: 3000,
  ROOT_DIRS: '/path/to/your/home/.openclaw,/path/to/your/home/.openclaw'  // 修改为你的文档目录
}
```

### 环境变量

`.env` 文件配置说明：

| 变量 | 说明 | 默认值 |
|------|------|--------|
| `PORT` | 服务端口 | 3000 |
| `HOST` | 监听地址 | localhost |
| `NODE_ENV` | 运行环境 | production |
| `ROOT_DIRS` | 文档根目录 (逗号分隔) | /path/to/your/home/.openclaw |
| `JWT_SECRET` | JWT 密钥 | (自动生成) |
| `SCAN_DEBOUNCE_MS` | 文件扫描防抖时间 | 1000 |
| `MAX_FILE_SIZE_MB` | 最大文件大小 | 10 |
| `EXCLUDE_PATTERNS` | 排除的目录 | node_modules,.git,cache,tmp,logs,dist |

## 🔧 常用命令

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

# 删除服务
pm2 delete doc-viewer-api

# 开机启动
pm2 startup
pm2 save
```

### Nginx 管理

```bash
# 测试配置
sudo nginx -t

# 重载配置
sudo systemctl reload nginx

# 重启服务
sudo systemctl restart nginx

# 查看状态
sudo systemctl status nginx
```

### SSL 证书

```bash
# 查看证书
sudo certbot certificates

# 续期证书
sudo certbot renew

# 测试续期
sudo certbot renew --dry-run
```

## 📊 监控

### 查看日志

```bash
# 使用脚本
./logs/view-logs.sh

# 实时查看
tail -f logs/*.log

# 查看 API 错误
tail -100 logs/api-error.log
```

### 监控脚本

```bash
# 手动运行监控
./logs/monitor.sh

# 查看监控日志
tail -f logs/monitor.log
```

### 系统监控

```bash
# CPU 使用
top

# 内存使用
free -h

# 磁盘使用
df -h

# 网络连接
netstat -tulpn
```

## ⚠️ 故障排查

### API 无法启动

```bash
# 检查端口占用
lsof -i :3000

# 查看 PM2 日志
pm2 logs doc-viewer-api

# 检查环境变量
cat .env
```

### Nginx 无法启动

```bash
# 测试配置
sudo nginx -t

# 查看错误日志
sudo tail /var/log/nginx/error.log
```

### SSL 证书问题

```bash
# 检查证书有效期
sudo certbot certificates

# 重新获取证书
sudo certbot certonly --force-renewal -d yourdomain.com
```

## 📝 备份

### 备份配置

```bash
# 备份配置文件
tar -czf doc-viewer-config-backup-$(date +%Y%m%d).tar.gz \
    workspace/backend/.env \
    workspace/config/ \
    data/
```

### 备份用户数据

```bash
# 备份用户数据
cp workspace/backend/data/users.json \
   workspace/backend/data/users.json.backup
```

## 🔒 安全建议

1. **修改默认密码** - 首次登录后立即修改 admin 密码
2. **使用 HTTPS** - 生产环境必须使用 HTTPS
3. **防火墙配置** - 只开放必要端口 (80, 443)
4. **定期更新** - 定期更新依赖和系统包
5. **日志监控** - 定期检查日志发现异常
6. **备份数据** - 定期备份用户数据和配置

---

*配置文档 v1.0 - 2026-03-12*
