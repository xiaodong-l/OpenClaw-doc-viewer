# Troubleshooting Guide / 故障排除指南

**English** | [简体中文](#简体中文)

---

## English

### Quick Fixes

#### Server Won't Start

```bash
# Check Node.js version
node --version  # Should be 18+

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check for port conflicts
lsof -i :3000  # or netstat -tlnp | grep 3000

# Check logs
tail -f /tmp/openclaw/openclaw-*.log
```

#### Frontend Build Fails

```bash
# Clear cache
cd workspace/frontend
rm -rf node_modules dist
npm install
npm run build

# Check Node.js version
node --version  # Should be 18+

# Increase memory limit (if needed)
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### Can't Access Documents

1. **Check ROOT_DIRS configuration**
   ```bash
   # Verify directories exist
   ls -la /path/to/your/documents
   
   # Check permissions
   chmod -R 755 /path/to/your/documents
   ```

2. **Verify file format**
   - Ensure files are `.md` (Markdown)
   - Check file encoding (UTF-8)

3. **Check server logs**
   ```bash
   tail -f /tmp/openclaw/openclaw-*.log
   ```

---

### Common Errors

#### Error: "JWT_SECRET is required"

**Solution:**
```bash
# Generate a strong secret
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# Add to .env
JWT_SECRET=your-generated-secret-here
```

#### Error: "Cannot find module"

**Solution:**
```bash
# Reinstall dependencies
npm install

# For backend
cd workspace/backend && npm install

# For frontend
cd workspace/frontend && npm install
```

#### Error: "Port already in use"

**Solution:**
```bash
# Find process using the port
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
PORT=3001
```

#### Error: "Permission denied"

**Solution:**
```bash
# Fix file permissions
chmod -R 755 /path/to/documents

# Or run as appropriate user
sudo -u <user> npm start
```

---

### Performance Issues

#### Slow Search

1. **Reduce ROOT_DIRS scope**
   - Only include necessary directories
   - Exclude large binary files

2. **Increase debounce time**
   ```bash
   SCAN_DEBOUNCE_MS=3000
   ```

3. **Add Redis caching** (Enterprise)

#### High Memory Usage

1. **Reduce MAX_FILE_SIZE_MB**
   ```bash
   MAX_FILE_SIZE_MB=5
   ```

2. **Exclude large directories**
   ```bash
   EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs,dist
   ```

3. **Use production mode**
   ```bash
   NODE_ENV=production
   ```

---

### Docker Issues

#### Container Won't Start

```bash
# Check logs
docker-compose logs api

# Verify volumes
docker-compose config

# Rebuild image
docker-compose build --no-cache
```

#### Permission Issues in Docker

```yaml
# Add to docker-compose.yml
services:
  api:
    user: "1000:1000"  # Match your host user
```

---

## 简体中文

### 快速修复

#### 服务器无法启动

```bash
# 检查 Node.js 版本
node --version  # 应该是 18+

# 清除 node_modules 并重新安装
rm -rf node_modules package-lock.json
npm install

# 检查端口冲突
lsof -i :3000  # 或 netstat -tlnp | grep 3000

# 查看日志
tail -f /tmp/openclaw/openclaw-*.log
```

#### 前端构建失败

```bash
# 清除缓存
cd workspace/frontend
rm -rf node_modules dist
npm install
npm run build

# 检查 Node.js 版本
node --version  # 应该是 18+

# 增加内存限制 (如需要)
export NODE_OPTIONS="--max-old-space-size=4096"
```

#### 无法访问文档

1. **检查 ROOT_DIRS 配置**
   ```bash
   # 验证目录存在
   ls -la /path/to/your/documents
   
   # 检查权限
   chmod -R 755 /path/to/your/documents
   ```

2. **验证文件格式**
   - 确保文件是 `.md` (Markdown)
   - 检查文件编码 (UTF-8)

3. **检查服务器日志**
   ```bash
   tail -f /tmp/openclaw/openclaw-*.log
   ```

---

### 常见错误

#### 错误："JWT_SECRET is required"

**解决方案:**
```bash
# 生成强密钥
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# 添加到 .env
JWT_SECRET=your-generated-secret-here
```

#### 错误："Cannot find module"

**解决方案:**
```bash
# 重新安装依赖
npm install

# 后端
cd workspace/backend && npm install

# 前端
cd workspace/frontend && npm install
```

#### 错误："Port already in use"

**解决方案:**
```bash
# 查找占用端口的进程
lsof -i :3000

# 终止进程
kill -9 <PID>

# 或在 .env 中更改端口
PORT=3001
```

#### 错误："Permission denied"

**解决方案:**
```bash
# 修复文件权限
chmod -R 755 /path/to/documents

# 或使用适当的用户运行
sudo -u <user> npm start
```

---

### 性能问题

#### 搜索缓慢

1. **减少 ROOT_DIRS 范围**
   - 只包含必要的目录
   - 排除大型二进制文件

2. **增加防抖时间**
   ```bash
   SCAN_DEBOUNCE_MS=3000
   ```

3. **添加 Redis 缓存** (企业版)

#### 内存使用高

1. **降低 MAX_FILE_SIZE_MB**
   ```bash
   MAX_FILE_SIZE_MB=5
   ```

2. **排除大目录**
   ```bash
   EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs,dist
   ```

3. **使用生产模式**
   ```bash
   NODE_ENV=production
   ```

---

### Docker 问题

#### 容器无法启动

```bash
# 查看日志
docker-compose logs api

# 验证卷配置
docker-compose config

# 重新构建镜像
docker-compose build --no-cache
```

#### Docker 中的权限问题

```yaml
# 添加到 docker-compose.yml
services:
  api:
    user: "1000:1000"  # 匹配你的主机用户
```

---

## Still Having Issues?

### Get Help

1. **Search existing issues**: https://github.com/xiaodong-l/OpenClaw-doc-viewer/issues
2. **Create a new issue**: Use our [bug report template](.github/ISSUE_TEMPLATE/bug_report.md)
3. **Join discussions**: https://github.com/xiaodong-l/OpenClaw-doc-viewer/discussions
4. **Contact support**: support@openclaw.ai

### Information to Include

When reporting issues, please include:

- [ ] OpenClaw Doc Viewer version
- [ ] Node.js version
- [ ] Operating system
- [ ] Error messages (full text)
- [ ] Steps to reproduce
- [ ] Server logs
- [ ] Configuration (remove sensitive info)

---

*Last updated: 2026-03-15*
