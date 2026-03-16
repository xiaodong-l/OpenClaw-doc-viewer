# OpenClaw 精准引流方案

**目标:** 在 OpenClaw 生态中精准推广 Doc Viewer

---

## 📍 OpenClaw 官方渠道

| 渠道 | URL | 状态 |
|------|-----|------|
| **GitHub Org** | https://github.com/openclaw | ✅ |
| **官网** | https://openclaw.ai | ✅ |
| **Twitter** | @openclaw | ✅ |
| **Discord** | https://discord.com/invite/clawd | ✅ |

---

## 🎯 引流策略

### 1. GitHub Issues 评论

**目标 Issues:**
- 文档相关问题
- Markdown 输出问题
- 集成需求问题

**评论模板:**

```markdown
Hi @author,

For OpenClaw documentation viewing, we built a companion project:

**OpenClaw Doc Viewer**
- Designed specifically for OpenClaw-generated Markdown
- Full-text search (<100ms for 1000+ docs)
- Multi-language support (EN/CN/JP/ES)
- MIT Open Source

GitHub: https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases/tag/v1.4.0

Features:
✅ Directory tree navigation
✅ Markdown rendering with code highlighting
✅ Dark mode
✅ Comments & sharing
✅ Reading history & collections

Already using in production with OpenClaw. Happy to help with integration!

Would love feedback from the OpenClaw community.
```

---

### 2. GitHub Discussions 发帖

**URL:** https://github.com/openclaw/openclaw/discussions

**帖子模板:**

```markdown
Title: [Integration] OpenClaw Doc Viewer - Documentation Platform for OpenClaw

---

Hi OpenClaw community! 👋

We've been using OpenClaw for documentation generation and built a 
companion viewer for better document browsing.

## OpenClaw Doc Viewer v1.4.0

### What is it?
A modern documentation platform designed specifically for OpenClaw-generated Markdown documentation.

### Key Features

**Core Viewing**
- 📁 Directory tree navigation (lazy loading)
- 📝 Beautiful Markdown rendering
- 🔍 Full-text search (FlexSearch, <100ms)
- 🌙 Dark mode

**Collaboration**
- 💬 Document comments with replies
- 🔗 Public sharing links
- ⭐ Collections & bookmarks
- 📜 Reading history

**Multi-language**
- 🌍 EN/CN/JP/ES support
- 📚 41+ documentation files

**DevOps**
- 🤖 Dependabot auto-merge
- 🔧 5 GitHub Actions workflows
- 🐳 Docker support

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Vue 3.4 + Vite 5 + Element Plus |
| Backend | Node.js 18+ + Fastify 4 |
| Search | FlexSearch (client-side) |
| Auth | JWT + Role-based access |

### Quick Start

```bash
git clone https://github.com/xiaodong-l/OpenClaw-doc-viewer.git
cd OpenClaw-doc-viewer

# Backend
cd workspace/backend && npm install && npm run dev

# Frontend (new terminal)
cd workspace/frontend && npm install && npm run dev
```

### Links

- **Release:** https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases/tag/v1.4.0
- **Docs:** https://github.com/xiaodong-l/OpenClaw-doc-viewer/tree/main/docs
- **Demo:** [Add if available]

### Why We Built This

We needed:
1. Fast search across 1000+ OpenClaw docs
2. Beautiful UI for team collaboration
3. Multi-language support for global team
4. Self-hosted, MIT licensed solution

Existing solutions were either too heavy or lacked features we needed.

### Call for Feedback

Would love to hear from the OpenClaw community:
- What features would you add?
- Any integration challenges?
- Interested in making this an official integration?

Thanks for building OpenClaw! 🦞
```

---

### 3. Discord 社区推广

**URL:** https://discord.com/invite/clawd

**频道:**
- `#integrations` - 集成项目展示
- `#showcase` - 项目展示
- `#general` - 一般讨论

**消息模板:**

```
🎉 OpenClaw Doc Viewer v1.4.0 Released!

Hi everyone! We built a documentation viewer specifically for OpenClaw-generated docs.

Features:
✨ Full-text search (<100ms)
✨ Multi-language (EN/CN/JP/ES)
✨ Dark mode
✨ Comments & sharing
✨ MIT Open Source

Tech: Vue 3 + Fastify + FlexSearch

GitHub: https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases/tag/v1.4.0

Would love feedback from the community! 🙏
```

---

### 4. Twitter 互动

**账号:** @openclaw

**策略:**

| 方式 | 说明 |
|------|------|
| **回复官方推文** | 提及 Doc Viewer |
| **带话题发布** | #OpenClaw #Documentation |
| **@官方账号** | 请求转发/评测 |

**推文模板:**

```
🎉 Built a companion project for @openclaw!

OpenClaw Doc Viewer v1.4.0:
- Full-text search (<100ms)
- Multi-language (EN/CN/JP/ES)
- MIT Open Source

Perfect for browsing OpenClaw-generated docs!

GitHub: https://github.com/xiaodong-l/OpenClaw-doc-viewer

#OpenClaw #Documentation #OpenSource
```

---

### 5. 官方博客投稿

**URL:** https://openclaw.ai/blog (如有)

**文章主题:**
- "Building a Documentation Viewer for OpenClaw"
- "How to Browse OpenClaw-Generated Docs"
- "Integrating Doc Viewer with OpenClaw"

---

## 🤖 自动化发布方案

### 方案 A: n8n 自动化 (推荐)

**工作流:**

```
GitHub Release → n8n → Discord Webhook
                        → Twitter API
                        → LinkedIn API
```

**n8n 工作流配置:**

```json
{
  "name": "OpenClaw Doc Viewer Auto-Post",
  "nodes": [
    {
      "name": "GitHub Trigger",
      "type": "n8n-nodes-base.githubTrigger",
      "parameters": {
        "event": "release",
        "owner": "xiaodong-l",
        "repository": "OpenClaw-doc-viewer"
      }
    },
    {
      "name": "Discord",
      "type": "n8n-nodes-base.discord",
      "parameters": {
        "webhookUrl": "YOUR_DISCORD_WEBHOOK",
        "content": "🎉 New Release: {{$json.release.name}}\n{{$json.release.html_url}}"
      }
    },
    {
      "name": "Twitter",
      "type": "n8n-nodes-base.twitter",
      "parameters": {
        "text": "🎉 {{$json.release.name}} released!\n{{$json.release.html_url}}\n#OpenClaw #OpenSource"
      }
    }
  ]
}
```

**优点:**
- 全自动发布
- 多平台同步
- 可定制内容

**缺点:**
- 需要部署 n8n
- 需要配置各平台 API

---

### 方案 B: GitHub Actions 自动化

**工作流文件:** `.github/workflows/auto-promote.yml`

```yaml
name: Auto Promote Release

on:
  release:
    types: [published]

jobs:
  promote:
    runs-on: ubuntu-latest
    steps:
      - name: Discord Notification
        uses: Ilshidur/action-discord@master
        with:
          args: |
            🎉 New Release: ${{ github.event.release.name }}
            ${{ github.event.release.html_url }}
      
      - name: Twitter Post
        uses: ethomson/send-tweet-action@v1
        with:
          status: |
            🎉 ${{ github.event.release.name }} released!
            ${{ github.event.release.html_url }}
            #OpenClaw #OpenSource
          consumer-key: ${{ secrets.TWITTER_CONSUMER_KEY }}
          consumer-secret: ${{ secrets.TWITTER_CONSUMER_SECRET }}
          access-token: ${{ secrets.TWITTER_ACCESS_TOKEN }}
          access-token-secret: ${{ secrets.TWITTER_ACCESS_TOKEN_SECRET }}
```

**优点:**
- 无需额外部署
- GitHub 原生集成
- 配置简单

**缺点:**
- 平台支持有限
- Twitter API 需要审批

---

### 方案 C: Postiz + GitHub Actions

**工作流:**

```yaml
name: Postiz Auto-Post

on:
  release:
    types: [published]

jobs:
  postiz:
    runs-on: ubuntu-latest
    steps:
      - name: Trigger Postiz
        run: |
          curl -X POST ${{ secrets.POSTIZ_WEBHOOK }} \
            -H "Content-Type: application/json" \
            -d '{
              "title": "${{ github.event.release.name }}",
              "content": "New release: ${{ github.event.release.html_url }}",
              "platforms": ["twitter", "linkedin"]
            }'
```

**优点:**
- 使用已有 Postiz
- 多平台管理
- 调度功能

**缺点:**
- 需要 Postiz 支持 webhook
- 配置较复杂

---

### 方案 D: 纯手动 (当前推荐)

**原因:**
- 推广内容需要定制化
- 不同平台需要不同语气
- 初期需要亲自互动回复

**工具:**
- 使用 `.github/SOCIAL_MEDIA.md` 中的模板
- 手动发布到各平台
- 亲自回复评论

---

## 📊 预期效果

| 渠道 | 预计曝光 | 转化率 | Stars |
|------|----------|--------|-------|
| **OpenClaw GitHub** | 500-2K | 10-20% | 30-60 |
| **OpenClaw Discord** | 100-500 | 15-30% | 20-40 |
| **OpenClaw Twitter** | 1K-5K | 2-5% | 10-30 |
| **合计** | - | - | **60-130** |

---

## 📋 执行清单

### 今日任务

- [ ] **GitHub Discussions 发帖** - 30 分钟
- [ ] **GitHub Issues 评论** - 20 分钟 (3-5 个相关 issues)
- [ ] **Discord 社区分享** - 15 分钟
- [ ] **Twitter @openclaw 互动** - 10 分钟

### 自动化设置 (可选)

- [ ] **配置 GitHub Actions** - 30 分钟
- [ ] **设置 Discord Webhook** - 10 分钟
- [ ] **配置 Postiz Webhook** - 20 分钟

---

## ⚠️ 注意事项

### 社区礼仪

| ❌ 不要 | ✅ 要 |
|--------|------|
| 纯广告式推广 | 提供价值 + 项目介绍 |
| 重复发帖 | 每个平台定制内容 |
| 只发不互动 | 积极回复评论 |
| 假装用户 | 诚实说明开发者身份 |

### OpenClaw 特定

- 尊重 OpenClaw 官方品牌
- 明确说明是第三方集成
- 愿意配合官方做成正式集成
- 积极回应 OpenClaw 团队反馈

---

*Last updated: 2026-03-16 02:50 UTC*
