# 部署指南 / Deployment Guide

**English** | [简体中文](#简体中文)

---

## English

### Production Deployment Checklist

- [ ] Change default admin password
- [ ] Set strong JWT_SECRET
- [ ] Configure HTTPS/SSL
- [ ] Set up firewall rules
- [ ] Configure log rotation
- [ ] Set up monitoring
- [ ] Configure backups

### Option 1: PM2 Deployment (Recommended)

#### Step 1: Build Frontend

```bash
cd workspace/frontend
npm install
npm run build
```

#### Step 2: Configure PM2

Edit `config/pm2.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'doc-viewer-api',
    script: 'src/server.js',
    cwd: 'workspace/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### Step 3: Start with PM2

```bash
pm2 start config/pm2.config.js --env production
pm2 save
pm2 startup
```

### Option 2: Docker Deployment

#### Create Dockerfile

```dockerfile
# Backend
FROM node:18-alpine AS backend
WORKDIR /app
COPY workspace/backend/package*.json ./
RUN npm ci --production
COPY workspace/backend/ ./
EXPOSE 3000
CMD ["node", "src/server.js"]

# Frontend
FROM node:18-alpine AS frontend
WORKDIR /app
COPY workspace/frontend/package*.json ./
RUN npm ci
COPY workspace/frontend/ ./
RUN npm run build

# Production
FROM nginx:alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY --from=backend /app /backend
EXPOSE 80
```

#### Build and Run

```bash
docker build -t doc-viewer .
docker run -d -p 80:80 doc-viewer
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # Frontend static files
    location / {
        root /path/to/doc-viewer/workspace/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API proxy
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# HTTP to HTTPS redirect
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot python3-certbot-nginx

# Get certificate
sudo certbot --nginx -d your-domain.com

# Auto-renewal
sudo certbot renew --dry-run
```

### Monitoring Setup

```bash
# PM2 monitoring
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# System monitoring
pm2 monit
```

---

## 简体中文

### 生产环境部署检查清单

- [ ] 修改默认管理员密码
- [ ] 设置强 JWT_SECRET
- [ ] 配置 HTTPS/SSL
- [ ] 设置防火墙规则
- [ ] 配置日志轮转
- [ ] 设置监控
- [ ] 配置备份

### 方案一：PM2 部署 (推荐)

#### 步骤 1: 构建前端

```bash
cd workspace/frontend
npm install
npm run build
```

#### 步骤 2: 配置 PM2

编辑 `config/pm2.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'doc-viewer-api',
    script: 'src/server.js',
    cwd: 'workspace/backend',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

#### 步骤 3: 使用 PM2 启动

```bash
pm2 start config/pm2.config.js --env production
pm2 save
pm2 startup
```

### 方案二：Docker 部署

#### 创建 Dockerfile

```dockerfile
# 后端
FROM node:18-alpine AS backend
WORKDIR /app
COPY workspace/backend/package*.json ./
RUN npm ci --production
COPY workspace/backend/ ./
EXPOSE 3000
CMD ["node", "src/server.js"]

# 前端
FROM node:18-alpine AS frontend
WORKDIR /app
COPY workspace/frontend/package*.json ./
RUN npm ci
COPY workspace/frontend/ ./
RUN npm run build

# 生产
FROM nginx:alpine
COPY --from=frontend /app/dist /usr/share/nginx/html
COPY --from=backend /app /backend
EXPOSE 80
```

#### 构建和运行

```bash
docker build -t doc-viewer .
docker run -d -p 80:80 doc-viewer
```

### Nginx 配置

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL 配置
    ssl_certificate /etc/letsencrypt/live/your-domain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/your-domain.com/privkey.pem;
    
    # 前端静态文件
    location / {
        root /path/to/doc-viewer/workspace/frontend/dist;
        try_files $uri $uri/ /index.html;
    }

    # 后端 API 代理
    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}

# HTTP 重定向到 HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

### SSL 证书设置

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx

# 获取证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

### 监控设置

```bash
# PM2 监控
pm2 install pm2-logrotate
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7

# 系统监控
pm2 monit
```

---

## Security Best Practices / 安全最佳实践

### English

1. **Change Default Password**
   ```bash
   # After first login, change admin password immediately
   ```

2. **Use Strong JWT Secret**
   ```bash
   # Generate random secret
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **Enable HTTPS Only**
   - Force HTTPS redirect
   - Use HSTS headers

4. **Firewall Rules**
   ```bash
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

### 简体中文

1. **修改默认密码**
   ```bash
   # 首次登录后立即修改 admin 密码
   ```

2. **使用强 JWT 密钥**
   ```bash
   # 生成随机密钥
   node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
   ```

3. **仅启用 HTTPS**
   - 强制 HTTPS 重定向
   - 使用 HSTS 头

4. **防火墙规则**
   ```bash
   sudo ufw allow 443/tcp
   sudo ufw allow 22/tcp
   sudo ufw enable
   ```

---

## Backup Strategy / 备份策略

### Database Backup

```bash
# Backup user data
cp workspace/backend/data/users.json ~/backup/users-$(date +%Y%m%d).json

# Backup collections
cp workspace/backend/data/collections.json ~/backup/collections-$(date +%Y%m%d).json

# Backup comments
cp workspace/backend/data/comments.json ~/backup/comments-$(date +%Y%m%d).json
```

### Automated Backup Script

```bash
#!/bin/bash
# backup.sh
BACKUP_DIR=~/backup
DATE=$(date +%Y%m%d)

mkdir -p $BACKUP_DIR
cp workspace/backend/data/*.json $BACKUP_DIR/
find $BACKUP_DIR -name "*.json" -mtime +30 -delete

echo "Backup completed: $DATE"
```

Add to crontab:
```bash
# Daily backup at 2 AM
0 2 * * * /path/to/backup.sh
```

---

## Related Documents

- [Installation Guide](INSTALL.md)
- [Quick Start](QUICKSTART.md)
- [Configuration](CONFIGURATION.md)

## 相关文档

- [安装指南](INSTALL.md)
- [快速开始](QUICKSTART.md)
- [配置说明](CONFIGURATION.md)
