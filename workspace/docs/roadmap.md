# 🗺️ OpenClaw Doc Viewer 产品路线图

**更新日期**: 2026-03-13  
**文档状态**: 规划中

---

## 📍 版本历程

| 版本 | 状态 | 发布日期 | 说明 |
|------|------|---------|------|
| **v1.0.0** | ✅ 已发布 | 2026-03-13 | 核心功能 MVP |
| **v1.1.0** | ⏳ 开发中 | 2026-03-25 (预计) | 搜索 + 导航 + 响应式 |
| **v1.2.0** | 📋 规划中 | 2026-04-15 (预计) | 用户功能增强 |
| **v2.0.0** | 🔮 愿景 | 2026-Q2 | 企业级功能 |

---

## 🎯 v1.2.0 用户功能增强

**主题**: 提升用户个性化体验和协作能力

**预计工时**: 8-10 天

### 功能列表

| 功能 | 优先级 | 工时 | 说明 |
|------|--------|------|------|
| 👤 用户头像上传 | P1 | 2 天 | 支持头像上传、裁剪、预览 |
| ⭐ 文档收藏功能 | P1 | 2 天 | 收藏/取消收藏、收藏夹管理 |
| 📜 阅读历史记录 | P2 | 2 天 | 自动记录、历史列表、快速访问 |
| 🔗 文档分享功能 | P2 | 2 天 | 生成分享链接、权限控制、二维码 |
| 📱 移动端优化 | P1 | 2 天 | PWA、触摸手势、离线缓存 |
| 🌙 暗黑模式 | P1 | 1 天 | 系统跟随、手动切换、定时切换 |

---

### 👤 用户头像上传

**需求描述**:
- 支持 JPG/PNG/GIF 格式
- 图片裁剪和预览
- 头像缩略图生成
- 默认头像 (字母/颜色)

**技术实现**:
```javascript
// API: POST /api/v1/user/avatar
// 存储：本地存储或 OSS
// 处理：sharp 库进行图片处理
```

**UI 组件**:
```vue
<avatar-upload
  :user-id="userId"
  @change="handleAvatarChange"
/>
```

---

### ⭐ 文档收藏功能

**需求描述**:
- 收藏/取消收藏文档
- 收藏夹分类管理
- 快速访问收藏
- 收藏排序 (时间/名称)

**数据模型**:
```typescript
interface Collection {
  id: string
  userId: string
  name: string
  documents: Array<{
    path: string
    title: string
    addedAt: string
  }>
  createdAt: string
  updatedAt: string
}
```

**API**:
```
POST   /api/v1/collections          # 创建收藏夹
GET    /api/v1/collections          # 获取收藏夹列表
PUT    /api/v1/collections/:id      # 更新收藏夹
DELETE /api/v1/collections/:id      # 删除收藏夹
POST   /api/v1/collections/:id/docs # 添加文档
DELETE /api/v1/collections/:id/docs # 移除文档
```

---

### 📜 阅读历史记录

**需求描述**:
- 自动记录阅读过的文档
- 显示最近阅读列表
- 支持清除历史
- 隐私模式可选

**数据模型**:
```typescript
interface ReadingHistory {
  userId: string
  documentPath: string
  title: string
  readAt: string
  readDuration: number  // 阅读时长 (秒)
}
```

**存储策略**:
- 最近 100 条记录
- 自动清理 30 天前记录
- 本地缓存 + 服务端同步

---

### 🔗 文档分享功能

**需求描述**:
- 生成文档分享链接
- 设置分享权限 (只读/评论)
- 设置有效期 (1 天/7 天/永久)
- 生成分享二维码
- 查看分享统计 (访问次数)

**分享链接格式**:
```
https://your-domain.com:YOUR_PORT/share/:token
```

**数据模型**:
```typescript
interface ShareLink {
  id: string
  documentPath: string
  token: string
  permissions: 'read' | 'comment'
  expiresAt: string | null
  maxViews: number | null
  viewCount: number
  createdBy: string
  createdAt: string
}
```

---

### 📱 移动端优化 (PWA)

**需求描述**:
- PWA 支持 (离线访问)
- 触摸手势 (滑动返回)
- 移动端导航优化
- 图片懒加载
- 字体自适应

**技术实现**:
```javascript
// vite-plugin-pwa
// workbox 缓存策略
// 触摸事件处理
```

**manifest.json**:
```json
{
  "name": "OpenClaw Doc Viewer",
  "short_name": "DocViewer",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#409EFF",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

---

### 🌙 暗黑模式

**需求描述**:
- 系统主题跟随
- 手动切换
- 定时切换 (日落后自动)
- 记忆用户偏好

**技术实现**:
```vue
<script setup>
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark()
const toggleDark = useToggle(isDark)
</script>

<template>
  <el-switch
    v-model="isDark"
    @change="toggleDark"
    active-icon="Moon"
    inactive-icon="Sunny"
  />
</template>
```

**CSS 变量**:
```css
:root {
  --bg-color: #ffffff;
  --text-color: #303133;
  --border-color: #e4e7ed;
}

:root.dark {
  --bg-color: #1a1a1a;
  --text-color: #e0e0e0;
  --border-color: #333333;
}
```

---

## 🏢 v2.0.0 企业级功能

**主题**: 监控、告警、备份、安全

**预计工时**: 15-20 天

### 功能模块

| 模块 | 功能 | 优先级 | 工时 |
|------|------|--------|------|
| **监控告警** | 系统健康监控 | P0 | 3 天 |
| | 邮件告警配置 | P1 | 2 天 |
| | Slack/Discord 通知 | P1 | 2 天 |
| | 性能监控 (APM) | P1 | 3 天 |
| | 错误追踪 (Sentry) | P1 | 2 天 |
| **备份策略** | 数据库备份 | P0 | 2 天 |
| | 配置文件备份 | P0 | 1 天 |
| | 自动化备份脚本 | P0 | 2 天 |
| **安全增强** | 双因素认证 | P1 | 3 天 |
| | 审计日志 | P1 | 2 天 |
| | IP 白名单 | P2 | 1 天 |

---

### 📊 监控告警

#### 系统健康监控

**监控指标**:
- CPU 使用率
- 内存使用率
- 磁盘空间
- API 响应时间
- 错误率
- 活跃用户数

**技术栈**:
```
Prometheus + Grafana
或
自研轻量监控
```

**API 端点**:
```
GET /api/v1/health        # 健康检查
GET /api/v1/metrics       # 监控指标
GET /api/v1/alerts        # 告警列表
```

---

#### 邮件告警配置

**配置项**:
```javascript
{
  smtp: {
    host: 'smtp.example.com',
    port: 587,
    secure: false,
    auth: {
      user: 'alerts@example.com',
      pass: 'password'
    }
  },
  recipients: ['admin@example.com'],
  thresholds: {
    errorRate: 0.05,      // 错误率 > 5%
    responseTime: 2000,   // 响应时间 > 2s
    diskUsage: 0.85       // 磁盘使用 > 85%
  }
}
```

**告警模板**:
```
主题：[告警] OpenClaw Doc Viewer - {告警类型}

内容：
服务名称：OpenClaw Doc Viewer
告警类型：{类型}
告警时间：{时间}
当前值：{值}
阈值：{阈值}

请立即处理。
```

---

#### Slack/Discord 通知

**集成方式**:
```javascript
// Slack Webhook
POST https://hooks.slack.com/services/xxx/yyy/zzz

// Discord Webhook
POST https://discord.com/api/webhooks/xxx/yyy
```

**消息格式**:
```json
{
  "text": "🚨 告警通知",
  "attachments": [{
    "color": "danger",
    "fields": [
      { "title": "服务", "value": "OpenClaw Doc Viewer", "short": true },
      { "title": "告警类型", "value": "错误率过高", "short": true },
      { "title": "当前值", "value": "8.5%", "short": true },
      { "title": "阈值", "value": "5%", "short": true }
    ]
  }]
}
```

---

#### 性能监控 (APM)

**监控内容**:
- API 响应时间
- 数据库查询时间
- 前端页面加载时间
- 资源加载时间

**技术选型**:
| 方案 | 优点 | 缺点 |
|------|------|------|
| **Sentry** | 功能全面、错误追踪 | 付费 |
| **自研** | 可控、轻量 | 开发成本 |
| **Prometheus** | 开源、生态好 | 复杂 |

**推荐**: 初期用自研轻量监控，后期迁移到 Sentry/Prometheus

---

#### 错误追踪 (Sentry)

**前端集成**:
```javascript
import * as Sentry from '@sentry/vue'

Sentry.init({
  app,
  dsn: 'https://xxx@o0.ingest.sentry.io/0',
  integrations: [
    new Sentry.BrowserTracing({
      tracingOrigins: ['localhost', 'your-domain.com']
    }),
    new Sentry.Replay()
  ],
  tracesSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0
})
```

**后端集成**:
```javascript
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: 'https://xxx@o0.ingest.sentry.io/0',
  integrations: [
    new Sentry.Integrations.Http({ tracing: true }),
    new Sentry.Integrations.Express({ app })
  ],
  tracesSampleRate: 1.0
})
```

---

### 💾 备份策略

#### 数据库备份

**备份内容**:
- 用户数据 (users.json)
- 收藏夹数据
- 分享链接数据
- 阅读历史数据

**备份频率**:
- 全量备份：每天凌晨 2:00
- 增量备份：每小时

**备份存储**:
- 本地：`/backup/doc-viewer/db/`
- 远程：OSS/S3

**备份脚本**:
```bash
#!/bin/bash
# backup-db.sh

BACKUP_DIR="/backup/doc-viewer/db"
DATE=$(date +%Y%m%d_%H%M%S)

# 备份用户数据
cp /path/to/your/home/.openclaw/projects/doc-viewer/workspace/backend/data/users.json \
   $BACKUP_DIR/users_$DATE.json

# 压缩
tar -czf $BACKUP_DIR/backup_$DATE.tar.gz $BACKUP_DIR/*.json

# 清理 30 天前的备份
find $BACKUP_DIR -name "backup_*.tar.gz" -mtime +30 -delete

# 上传到 OSS (可选)
# ossutil cp $BACKUP_DIR/backup_$DATE.tar.gz oss://bucket/backup/
```

---

#### 配置文件备份

**备份内容**:
- `.env` 环境变量
- `ecosystem.config.js` PM2 配置
- Nginx 配置
- SSL 证书

**备份脚本**:
```bash
#!/bin/bash
# backup-config.sh

BACKUP_DIR="/backup/doc-viewer/config"
DATE=$(date +%Y%m%d_%H%M%S)

# 创建备份目录
mkdir -p $BACKUP_DIR/$DATE

# 备份配置文件
cp /path/to/your/home/.openclaw/projects/doc-viewer/workspace/backend/.env \
   $BACKUP_DIR/$DATE/
cp /path/to/your/home/.openclaw/projects/doc-viewer/workspace/ecosystem.config.js \
   $BACKUP_DIR/$DATE/
cp /etc/nginx/sites-available/doc-viewer \
   $BACKUP_DIR/$DATE/

# 备份 SSL 证书
cp -r /etc/letsencrypt/live/your-domain.com \
      $BACKUP_DIR/$DATE/ssl/

# 压缩
tar -czf $BACKUP_DIR/config_$DATE.tar.gz $BACKUP_DIR/$DATE
```

---

#### 自动化备份脚本

**Cron 配置**:
```bash
# 编辑 crontab
crontab -e

# 添加任务
# 每天凌晨 2 点备份数据库
0 2 * * * /path/to/your/home/.openclaw/projects/doc-viewer/workspace/scripts/backup-db.sh

# 每小时备份配置
0 * * * * /path/to/your/home/.openclaw/projects/doc-viewer/workspace/scripts/backup-config.sh

# 每周日上传备份到 OSS
0 3 * * 0 /path/to/your/home/.openclaw/projects/doc-viewer/workspace/scripts/upload-backup.sh
```

**监控备份状态**:
```javascript
// 检查最近备份
fastify.get('/api/v1/backup/status', async () => {
  const backups = await fs.readdir(BACKUP_DIR)
  const latest = backups.sort().pop()
  
  return {
    latest: latest,
    count: backups.length,
    size: await getFileSize(latest)
  }
})
```

---

## 📅 详细时间表

### 2026 年 Q1

```
2026-03-13  ──► v1.0.0 发布 ✅
    │
    ▼
2026-03-25  ──► v1.1.0 发布 (搜索 + 导航 + 响应式)
    │
    ▼
2026-04-15  ──► v1.2.0 发布 (用户功能增强)
```

### 2026 年 Q2

```
2026-05-15  ──► v2.0.0-alpha (监控告警)
    │
    ▼
2026-06-15  ──► v2.0.0-beta (备份策略)
    │
    ▼
2026-06-30  ──► v2.0.0 正式发布
```

---

## 🎯 优先级评估矩阵

```
                    影响力
              低 ◄───────► 高
            ┌───────────────┐
          高│  邮件告警      │ 暗黑模式
            │  备份策略      │ 移动端优化
      工    │               │ 文档收藏
      时    ├───────────────┤
            │  Sentry       │ 阅读历史
          低│  双因素认证    │ 用户头像
            │               │ 文档分享
            └───────────────┘
```

---

## 📊 资源需求

| 阶段 | 开发 | 测试 | 运维 | 总计 |
|------|------|------|------|------|
| v1.1.0 | 10 天 | 2 天 | 1 天 | 13 天 |
| v1.2.0 | 10 天 | 2 天 | 1 天 | 13 天 |
| v2.0.0 | 20 天 | 4 天 | 3 天 | 27 天 |

---

## 🔗 相关文档

- [v1.1.0 需求规划](./v1.1.0-requirements.md)
- [API 文档](./API.md)
- [部署指南](./DEPLOY.md)
- [架构设计](../ARCHITECTURE.md)

---

*OpenClaw Doc Viewer 产品路线图 - 2026-03-13*
