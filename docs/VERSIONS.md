# Version History / 版本历史

**English** | [简体中文](#简体中文)

---

## English

### Overview

This document provides a complete history of all stable releases of OpenClaw Doc Viewer (Community Edition), organized by milestone.

---

## 📌 Release Timeline

```
v1.0.0 ──→ v1.1.0 ──→ v1.2.0 ──→ v1.3.0 ──→ v1.4.0 ──→ v1.5.0 ──→ v1.6.0 ──→ v1.7.0 ──→ v1.8.0
(Mar 12)   (Mar 12)   (Mar 13)   (Mar 13)   (Mar 14)   (Mar 14)   (Mar 15)   (Mar 15)   (Mar 16)
```

---

## 🏷️ Version Details

### [v1.0.0] - 2026-03-12 - Initial Release

**Commit:** `300deb5`

**Theme:** 🎉 Foundation - Community Edition Launch

#### Core Features

| Feature | Description |
|---------|-------------|
| Directory Tree | File system navigation with expandable folders |
| Markdown Rendering | Full markdown support with syntax highlighting |
| JWT Authentication | Secure token-based authentication |
| Role-Based Access | Admin, Editor, Viewer roles |
| Real-Time Updates | File change detection and auto-refresh |
| Basic Statistics | Document count, user activity tracking |

#### Technical Stack

- **Backend:** Node.js 18+, Fastify 4.x
- **Frontend:** Vue 3.x, Vite 5.x
- **Database:** File-based (JSON)
- **Search:** Basic file scanner

#### Documentation

- README.md (bilingual EN/CN)
- LICENSE (MIT)
- Basic installation instructions

#### Known Limitations

- No full-text search
- No user collections or favorites
- No dark mode
- Limited mobile support

---

### [v1.1.0] - 2026-03-12 - Search & Navigation

**Commit:** `9a891cb`

**Theme:** 🔍 Discoverability & UX Improvements

#### New Features

| Feature | Description |
|---------|-------------|
| Full-Text Search | FlexSearch integration (1800+ documents indexed) |
| Lazy Loading | Directory tree loads on-demand |
| Breadcrumb Nav | Clear navigation path display |
| Responsive Design | Mobile-friendly interface |
| Reading Progress | Progress bar and table of contents |

#### Improvements

- Search performance optimized
- Tree navigation UX enhanced
- Search highlighting in large documents fixed
- Breadcrumb overflow on mobile fixed

#### Documentation Added

- CHANGELOG.md
- README updates with version badges
- Basic API documentation

---

### [v1.2.0] - 2026-03-13 - User Experience

**Commit:** `874eb48`

**Theme:** 👤 Personalization & Organization

#### New Features

| Feature | Description |
|---------|-------------|
| Avatar Upload | Custom profile pictures |
| Document Collections | Bookmark and organize favorites |
| Reading History | Automatic tracking of viewed documents |
| Document Sharing | Generate shareable links with expiration |
| Dark Mode | Complete theme switching |

#### Improvements

- User settings page redesigned
- Collection management UI enhanced
- Avatar upload size validation fixed
- History tracking for shared documents fixed

#### Documentation Added

- Open source project infrastructure
- CONTRIBUTING.md
- CODE_OF_CONDUCT.md
- Initial docs/ directory structure

---

### [v1.3.0] - 2026-03-13 - Production Ready

**Commit:** `941ad37`

**Theme:** 🏗️ Infrastructure & Tooling

#### New Features

| Feature | Description |
|---------|-------------|
| Production Infrastructure | Complete deployment tooling |
| CI/CD Pipeline | GitHub Actions workflows |
| Docker Support | Container-based deployment |
| Testing Framework | Vitest + Playwright |
| Code Quality | ESLint, Prettier, lint-staged |

#### Infrastructure

- GitHub Actions: CI, CD, auto-assign, stale, labeler
- Docker: Multi-stage builds, production images
- Testing: Unit, integration, E2E
- Code quality: Husky hooks, commitlint

#### Documentation Added

- DEPLOYMENT.md
- INSTALL.md
- QUICKSTART.md
- API.md
- ARCHITECTURE.md
- EDITIONS.md (Community vs Enterprise)

---

### [v1.4.0] - 2026-03-14 - User Documentation

**Commit:** `58f952d`

**Theme:** 📚 Comprehensive Documentation

#### Documentation Added

| Document | Purpose |
|----------|---------|
| CONFIGURATION.md | All configuration options |
| TROUBLESHOOTING.md | Common issues and solutions |
| FAQ.md | Frequently asked questions |
| PERFORMANCE.md | Performance optimization guide |
| MIGRATION.md | Migration from previous versions |
| MAINTAINERS.md | Maintainer guidelines |
| ROADMAP.md | Future development plans |
| TRANSLATION.md | Translation contribution guide |

#### Improvements

- All documentation bilingual (EN/CN)
- Code examples in all guides
- Screenshots and diagrams added
- Search functionality in docs

---

### [v1.5.0] - 2026-03-14 - Automation

**Commit:** `48cfbfc`

**Theme:** 🤖 Dependabot Auto-Merge

#### New Features

| Feature | Description |
|---------|-------------|
| Dependabot Auto-Merge | Automatic merging of minor/patch updates |
| Auto-Assign Action | Automatic PR assignment |
| Release Automation | Automated GitHub releases |

#### Configuration

```yaml
# .github/dependabot.yml
- package-ecosystem: "npm"
  open-pull-requests-limit: 10
  auto-merge: true  # Minor and patch only
```

#### Benefits

- Reduced maintenance overhead
- Faster security updates
- Consistent dependency versions
- Less manual intervention required

---

### [v1.6.0] - 2026-03-15 - Browser Automation

**Commit:** `594c7fc`

**Theme:** 🌐 China Social Media Integration

#### New Features

| Feature | Description |
|---------|-------------|
| Python Browser Automation | Playwright-based automation |
| China Social Media Support | WeChat, Weibo, Douyin integration |
| Auto-Promotion Strategy | Automated content publishing |
| Engagement Tracking | Monitor likes, shares, comments |

#### Technical Stack

- Python 3.10+
- Playwright for Python
- Custom browser automation scripts
- Social media API wrappers

#### Documentation Added

- SOCIAL_MEDIA.md (automation strategy)
- China-specific deployment guide
- Browser automation examples

---

### [v1.7.0] - 2026-03-15 - Code Cleanup

**Commit:** `36db832`

**Theme:** 🧹 Project Hygiene

#### Changes

| Action | Description |
|--------|-------------|
| File Cleanup | Removed non-project files |
| Directory Restructure | Organized workspace layout |
| Documentation Sync | Aligned docs with code |
| Dependency Audit | Cleaned unused packages |

#### Results

- Cleaner repository structure
- Reduced repository size
- Improved build times
- Better separation of concerns

---

### [v1.8.0] - 2026-03-16 - Stable Release

**Commit:** `fd60925`

**Theme:** ⚡ Dependency Updates (11 Merged)

#### Updated Dependencies

| Category | Package | Version |
|----------|---------|---------|
| **GitHub Actions** | actions/setup-node | v4 → v6 |
| **GitHub Actions** | codecov/codecov-action | v3 → v5 |
| **GitHub Actions** | actions/upload-artifact | v4 → v7 |
| **GitHub Actions** | actions/checkout | v4 → v6 |
| **Backend** | fastify | 4.29.1 → 5.8.2 |
| **Backend** | @fastify/jwt | 8.0.1 → 10.0.0 |
| **Backend** | @fastify/static | 8.0.0 → 9.0.0 |
| **Backend** | redis | 4.7.1 → 5.11.0 |
| **Backend** | @fastify/cors | updated |
| **Dev** | @faker-js/faker | 8.4.1 → 10.3.0 |
| **Dev** | lint-staged | 15.5.2 → 16.4.0 |

#### Benefits

- Security patches applied
- Performance improvements
- Bug fixes included
- Better Node.js compatibility

#### Testing

- All 11 dependabot branches merged
- Full test suite passed
- No breaking changes detected
- Production-ready stable version

---

## 📊 Version Comparison

| Version | Commits | Files Changed | Key Milestone |
|---------|---------|---------------|---------------|
| v1.0.0 | 1 | ~50 | Initial release |
| v1.1.0 | 8 | ~30 | Search added |
| v1.2.0 | 12 | ~45 | User features |
| v1.3.0 | 15 | ~60 | Production ready |
| v1.4.0 | 10 | ~25 | Documentation |
| v1.5.0 | 5 | ~10 | Automation |
| v1.6.0 | 8 | ~35 | Browser automation |
| v1.7.0 | 3 | ~20 | Cleanup |
| v1.8.0 | 12 | ~50 | Dependency updates |

---

## 🔄 Upgrade Paths

### Recommended Upgrade Path

```
v1.0.0 → v1.8.0 (direct upgrade supported)
```

All versions maintain backward compatibility. No breaking changes between v1.x releases.

### Upgrade Steps

```bash
# Stop current service
npm stop

# Pull latest code
git pull origin main

# Install dependencies
npm install

# Run migrations (if any)
npm run migrate

# Start service
npm start
```

---

## 📋 Version Support

| Version | Supported | End of Support |
|---------|-----------|----------------|
| v1.8.x | ✅ Current | - |
| v1.7.x | ✅ Security | 2026-06-01 |
| v1.6.x | ✅ Security | 2026-05-01 |
| v1.5.x | ⚠️ Limited | 2026-04-01 |
| v1.4.x | ⚠️ Limited | 2026-04-01 |
| v1.3.x | ❌ EOL | 2026-03-31 |
| v1.2.x | ❌ EOL | 2026-03-31 |
| v1.1.x | ❌ EOL | 2026-03-31 |
| v1.0.x | ❌ EOL | 2026-03-31 |

**Legend:**
- ✅ Current: Full support, all features
- ⚠️ Limited: Security fixes only
- ❌ EOL: End of life, no support

---

## 🎯 Next Release (v1.9.0)

### Planned Features

- 🔗 Webhook integrations
- 📊 Advanced analytics dashboard
- 🎨 Customizable themes
- 📥 Export collections

### Timeline

- Feature freeze: 2026-03-25
- Beta release: 2026-03-30
- Stable release: 2026-04-05

---

## 简体中文

### 概述

本文档提供 OpenClaw Doc Viewer 社区版所有稳定版本的完整历史记录，按里程碑组织。

---

## 📌 发布时间线

```
v1.0.0 ──→ v1.1.0 ──→ v1.2.0 ──→ v1.3.0 ──→ v1.4.0 ──→ v1.5.0 ──→ v1.6.0 ──→ v1.7.0 ──→ v1.8.0
(3 月 12)  (3 月 12)  (3 月 13)  (3 月 13)  (3 月 14)  (3 月 14)  (3 月 15)  (3 月 15)  (3 月 16)
```

---

## 🏷️ 版本详情

### [v1.0.0] - 2026-03-12 - 初始版本

**主题:** 🎉 基础 - 社区版发布

**核心功能:**
- 目录树导航
- Markdown 渲染 + 代码高亮
- JWT 认证
- 基于角色的访问控制
- 实时更新
- 基础统计

### [v1.1.0] - 2026-03-12 - 搜索与导航

**主题:** 🔍 可发现性与 UX 改进

**新增功能:**
- 全文搜索 (FlexSearch, 1800+ 文档)
- 目录树懒加载
- 面包屑导航
- 响应式设计
- 阅读进度条

### [v1.2.0] - 2026-03-13 - 用户体验

**主题:** 👤 个性化与组织

**新增功能:**
- 头像上传
- 文档收藏夹
- 阅读历史
- 文档分享
- 深色模式

### [v1.3.0] - 2026-03-13 - 生产就绪

**主题:** 🏗️ 基础设施与工具链

**新增功能:**
- 生产级基础设施
- CI/CD 流水线
- Docker 支持
- 测试框架
- 代码质量工具

### [v1.4.0] - 2026-03-14 - 用户文档

**主题:** 📚 完整文档

**新增文档:**
- CONFIGURATION.md
- TROUBLESHOOTING.md
- FAQ.md
- PERFORMANCE.md
- MIGRATION.md
- MAINTAINERS.md
- ROADMAP.md
- TRANSLATION.md

### [v1.5.0] - 2026-03-14 - 自动化

**主题:** 🤖 Dependabot 自动合并

**新增功能:**
- Dependabot 自动合并 (次版本/补丁)
- 自动分配 PR
- 自动化发布

### [v1.6.0] - 2026-03-15 - 浏览器自动化

**主题:** 🌐 中国社交媒体集成

**新增功能:**
- Python 浏览器自动化
- 中国社交媒体支持 (微信/微博/抖音)
- 自动推广策略
- 互动追踪

### [v1.7.0] - 2026-03-15 - 代码清理

**主题:** 🧹 项目清理

**变更:**
- 移除非项目文件
- 目录结构重组
- 文档同步
- 依赖审计

### [v1.8.0] - 2026-03-16 - 稳定版本

**主题:** ⚡ 依赖更新 (11 个合并)

**更新依赖:**
- GitHub Actions: 4 个更新
- 后端包：5 个更新
- 开发包：2 个更新

---

*Last updated: 2026-03-16*
