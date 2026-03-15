# Performance Guide / 性能优化指南

**English** | [简体中文](#简体中文)

---

## English

### Overview

This guide covers performance optimization for OpenClaw Doc Viewer.

---

## Benchmarks

### Default Configuration

| Metric | Value |
|--------|-------|
| **Cold Start** | ~2s |
| **Search (1000 docs)** | <100ms |
| **Search (10000 docs)** | <500ms |
| **Page Load** | <1s |
| **Memory Usage** | ~400MB |
| **Concurrent Users** | 100+ |

---

## Backend Optimization

### 1. Enable Redis Caching (Enterprise)

```bash
# Install Redis
sudo apt install redis-server

# Configure in .env
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

**Benefits:**
- 50-80% faster repeated queries
- Reduced database load
- Better concurrent user support

### 2. Optimize File Scanning

```bash
# Increase debounce for large directories
SCAN_DEBOUNCE_MS=3000

# Limit file size
MAX_FILE_SIZE_MB=5

# Exclude unnecessary patterns
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs,dist,*.bak,*.tmp
```

### 3. Use Production Mode

```bash
NODE_ENV=production
LOG_LEVEL=warn  # Reduce logging overhead
```

### 4. Cluster Mode

```bash
# Use PM2 cluster mode
pm2 start ecosystem.config.js -i max
```

**Benefits:**
- Utilize all CPU cores
- Better request handling
- Zero-downtime restarts

### 5. Database Optimization

```javascript
// Use indexes for frequently queried fields
// (Auto-configured in v2.0+)
```

---

## Frontend Optimization

### 1. Enable Production Build

```bash
npm run build  # Minified and optimized
```

### 2. Lazy Loading

Already implemented in v1.1+:
- Directory tree lazy loading
- Route-based code splitting
- Image lazy loading

### 3. Caching

```javascript
// Service Worker (PWA - coming in v2.1)
// Browser caching headers
// API response caching
```

### 4. Reduce Bundle Size

```bash
# Analyze bundle
cd workspace/frontend
npm run build -- --analyze

# Remove unused dependencies
# Use tree-shaking
```

---

## Infrastructure Optimization

### 1. Use CDN

```nginx
# Nginx configuration for static assets
location /assets {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 2. Enable Compression

```javascript
// Already enabled in backend
// gzip compression for API responses
```

### 3. Load Balancing

```nginx
upstream doc-viewer {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

### 4. Database Scaling

- Use external database (PostgreSQL/MongoDB)
- Read replicas for search queries
- Connection pooling

---

## Monitoring

### 1. Enable Health Checks

```bash
# Check endpoint
curl http://localhost:3000/health

# Response time monitoring
watch -n 1 'curl -w "%{time_total}\n" -o /dev/null -s http://localhost:3000/health'
```

### 2. Performance Metrics

```javascript
// Built-in metrics endpoint (v2.0+)
GET /api/v1/metrics
```

### 3. Logging

```bash
# Structured logging
LOG_LEVEL=info
LOG_FORMAT=json

# Log aggregation (Enterprise)
# ELK Stack integration
```

---

## Common Bottlenecks

### Slow Search

**Cause:** Large document collection

**Solution:**
```bash
# Increase debounce
SCAN_DEBOUNCE_MS=5000

# Use Redis caching
REDIS_URL=redis://localhost:6379

# Exclude large files
MAX_FILE_SIZE_MB=3
```

### High Memory Usage

**Cause:** Too many documents in memory

**Solution:**
```bash
# Reduce batch size
SCAN_BATCH_SIZE=50

# Enable streaming
STREAM_LARGE_FILES=true

# Use external search (Enterprise)
# Elasticsearch integration
```

### Slow Page Load

**Cause:** Large bundle size

**Solution:**
```bash
# Analyze and optimize
npm run build -- --analyze

# Enable CDN
# Use HTTP/2
# Enable browser caching
```

---

## 简体中文

### 概述

本指南涵盖 OpenClaw Doc Viewer 的性能优化。

---

## 基准测试

### 默认配置

| 指标 | 数值 |
|------|------|
| **冷启动** | ~2 秒 |
| **搜索 (1000 文档)** | <100 毫秒 |
| **搜索 (10000 文档)** | <500 毫秒 |
| **页面加载** | <1 秒 |
| **内存使用** | ~400MB |
| **并发用户** | 100+ |

---

## 后端优化

### 1. 启用 Redis 缓存 (企业版)

```bash
# 安装 Redis
sudo apt install redis-server

# 在 .env 中配置
REDIS_URL=redis://localhost:6379
CACHE_TTL=3600
```

**优势:**
- 重复查询快 50-80%
- 减少数据库负载
- 更好的并发用户支持

### 2. 优化文件扫描

```bash
# 大目录增加防抖
SCAN_DEBOUNCE_MS=3000

# 限制文件大小
MAX_FILE_SIZE_MB=5

# 排除不必要的模式
EXCLUDE_PATTERNS=node_modules,.git,cache,tmp,logs,dist,*.bak,*.tmp
```

### 3. 使用生产模式

```bash
NODE_ENV=production
LOG_LEVEL=warn  # 减少日志开销
```

### 4. 集群模式

```bash
# 使用 PM2 集群模式
pm2 start ecosystem.config.js -i max
```

**优势:**
- 利用所有 CPU 核心
- 更好的请求处理
- 零停机重启

---

## 前端优化

### 1. 启用生产构建

```bash
npm run build  # 压缩和优化
```

### 2. 懒加载

已在 v1.1+ 实现:
- 目录树懒加载
- 基于路由的代码分割
- 图片懒加载

### 3. 缓存

```javascript
// Service Worker (PWA - v2.1 推出)
// 浏览器缓存头
// API 响应缓存
```

### 4. 减少包大小

```bash
# 分析包
cd workspace/frontend
npm run build -- --analyze

# 移除未使用的依赖
# 使用 tree-shaking
```

---

## 基础设施优化

### 1. 使用 CDN

```nginx
# Nginx 静态资源配置
location /assets {
    expires 30d;
    add_header Cache-Control "public, immutable";
}
```

### 2. 启用压缩

```javascript
// 后端已启用
// API 响应 gzip 压缩
```

### 3. 负载均衡

```nginx
upstream doc-viewer {
    server localhost:3000;
    server localhost:3001;
    server localhost:3002;
}
```

---

## 监控

### 1. 启用健康检查

```bash
# 检查端点
curl http://localhost:3000/health

# 响应时间监控
watch -n 1 'curl -w "%{time_total}\n" -o /dev/null -s http://localhost:3000/health'
```

### 2. 性能指标

```javascript
// 内置指标端点 (v2.0+)
GET /api/v1/metrics
```

### 3. 日志

```bash
# 结构化日志
LOG_LEVEL=info
LOG_FORMAT=json

# 日志聚合 (企业版)
# ELK Stack 集成
```

---

## 常见瓶颈

### 搜索缓慢

**原因:** 文档集合大

**解决方案:**
```bash
# 增加防抖
SCAN_DEBOUNCE_MS=5000

# 使用 Redis 缓存
REDIS_URL=redis://localhost:6379

# 排除大文件
MAX_FILE_SIZE_MB=3
```

### 内存使用高

**原因:** 内存中文档太多

**解决方案:**
```bash
# 减少批次大小
SCAN_BATCH_SIZE=50

# 启用流式传输
STREAM_LARGE_FILES=true
```

### 页面加载慢

**原因:** 包大小过大

**解决方案:**
```bash
# 分析和优化
npm run build -- --analyze

# 启用 CDN
# 使用 HTTP/2
# 启用浏览器缓存
```

---

*Last updated: 2026-03-15*

*For enterprise performance tuning, contact: enterprise@openclaw.ai*
