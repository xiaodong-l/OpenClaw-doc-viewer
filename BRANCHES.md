# Branch Guide / 分支指南

**English** | [简体中文](#简体中文)

---

## English

### Overview

This project uses milestone-based branching. Each stable release has a corresponding long-term support branch.

---

## 🌿 Branch Structure

### Active Branches

| Branch | Version | Status | Release Date | Support |
|--------|---------|--------|--------------|---------|
| `main` | v1.8.1 | ✅ Active | 2026-03-16 | Current |
| `release/v1.8.0` | v1.8.0 | ✅ Active | 2026-03-16 | Security |
| `release/v1.7.0` | v1.7.0 | ✅ Active | 2026-03-15 | Security |
| `release/v1.6.0` | v1.6.0 | ✅ Active | 2026-03-15 | Limited |
| `release/v1.5.0` | v1.5.0 | ✅ Active | 2026-03-14 | Limited |
| `release/v1.4.0` | v1.4.0 | ✅ Active | 2026-03-14 | Limited |
| `release/v1.3.0` | v1.3.0 | ✅ Active | 2026-03-13 | LTS |
| `release/v1.2.0` | v1.2.0 | ✅ Active | 2026-03-13 | LTS |
| `release/v1.1.0` | v1.1.0 | ✅ Active | 2026-03-12 | LTS |
| `release/v1.0.0` | v1.0.0 | ✅ Active | 2026-03-12 | LTS |

---

## 📋 Branch Details

### main (v1.8.1)

**Latest stable development branch.**

- **Version:** v1.8.1
- **Theme:** Documentation Complete
- **Features:**
  - All 9 milestone versions documented
  - Comprehensive release notes
  - Privacy info cleaned
  - Timestamps normalized (date only)

**Use for:** New deployments, latest features

---

### release/v1.8.0 (v1.8.0)

**Stable release with dependency updates.**

- **Version:** v1.8.0
- **Theme:** 11 Dependabot Updates Merged
- **Features:**
  - All security patches applied
  - 11 dependency updates
  - Production-ready stable version

**Use for:** Production deployments requiring maximum stability

---

### release/v1.7.0 (v1.7.0)

**Code cleanup release.**

- **Version:** v1.7.0
- **Theme:** Project Hygiene
- **Features:**
  - Non-project files removed
  - Directory structure optimized
  - Documentation synchronized

**Use for:** Clean codebase reference

---

### release/v1.6.0 (v1.6.0)

**Browser automation release.**

- **Version:** v1.6.0
- **Theme:** China Social Media Integration
- **Features:**
  - Python browser automation
  - WeChat/Weibo/Douyin support
  - Auto-promotion strategy

**Use for:** Social media automation projects

---

### release/v1.5.0 (v1.5.0)

**Automation release.**

- **Version:** v1.5.0
- **Theme:** Dependabot Auto-Merge
- **Features:**
  - Automated dependency updates
  - Auto-assign PR action
  - Release automation

**Use for:** Low-maintenance deployments

---

### release/v1.4.0 (v1.4.0)

**Documentation release.**

- **Version:** v1.4.0
- **Theme:** Comprehensive User Documentation
- **Features:**
  - 41+ documentation files
  - Bilingual support (EN/CN)
  - Complete user guides

**Use for:** Documentation reference

---

### release/v1.3.0 (v1.3.0)

**Production-ready release.**

- **Version:** v1.3.0
- **Theme:** Infrastructure & Tooling
- **Features:**
  - CI/CD pipeline
  - Docker support
  - Testing framework
  - Code quality tools

**Use for:** Production deployments (LTS)

---

### release/v1.2.0 (v1.2.0)

**User experience release.**

- **Version:** v1.2.0
- **Theme:** Personalization & Organization
- **Features:**
  - Avatar upload
  - Document collections
  - Reading history
  - Dark mode
  - Document sharing

**Use for:** User-focused deployments (LTS)

---

### release/v1.1.0 (v1.1.0)

**Search & navigation release.**

- **Version:** v1.1.0
- **Theme:** Discoverability
- **Features:**
  - Full-text search (FlexSearch)
  - Directory tree lazy loading
  - Breadcrumb navigation
  - Responsive design

**Use for:** Search-focused deployments (LTS)

---

### release/v1.0.0 (v1.0.0)

**Initial release.**

- **Version:** v1.0.0
- **Theme:** Foundation
- **Features:**
  - Directory tree navigation
  - Markdown rendering
  - JWT authentication
  - Role-based access control
  - Real-time updates

**Use for:** Minimal deployments, learning reference (LTS)

---

## 🔀 Branch Workflow

### Creating a New Release Branch

```bash
# From main
git checkout main
git pull origin main

# Create release branch
git checkout -b release/v1.9.0

# Update version numbers
npm version [major|minor|patch] --no-git-tag-version

# Update documentation
# ...

# Commit and push
git add .
git commit -m "release: v1.9.0"
git push origin release/v1.9.0

# Create tag
git tag -a v1.9.0 -m "Release v1.9.0"
git push origin v1.9.0
```

### Hotfix Process

```bash
# Checkout release branch
git checkout release/v1.8.0

# Create hotfix branch
git checkout -b hotfix/issue-123

# Fix the bug
# ...

# Commit and merge back
git checkout release/v1.8.0
git merge hotfix/issue-123
git push origin release/v1.8.0

# Also merge to main
git checkout main
git merge release/v1.8.0
git push origin main
```

---

## 📊 Version Support Policy

| Support Level | Duration | What's Included |
|---------------|----------|-----------------|
| **Current** | Latest release | All features, bug fixes, security |
| **Security** | 6 months | Security patches only |
| **Limited** | 3 months | Critical fixes only |
| **LTS** | 12 months | Security + critical fixes |

---

## 🏷️ Tag Naming

- **Stable releases:** `v1.8.0`, `v1.8.1`, etc.
- **Pre-releases:** `v1.9.0-beta.1`, `v1.9.0-rc.1`
- **Hotfixes:** `v1.8.0-hotfix.1`

---

## 📝 Documentation Sync

Each release branch contains documentation specific to that version:

- `README.md` - Version-specific features
- `CHANGELOG.md` - Version history
- `docs/` - Version-specific guides
- `docs/releases/` - Release notes (main only)

---

## 简体中文

### 概述

本项目采用基于里程碑的分支策略。每个稳定版本都有对应的长期支持分支。

---

## 🌿 分支结构

### 活跃分支

| 分支 | 版本 | 状态 | 发布日期 | 支持 |
|------|------|------|----------|------|
| `main` | v1.8.1 | ✅ 当前 | 2026-03-16 | 完整支持 |
| `release/v1.8.0` | v1.8.0 | ✅ 活跃 | 2026-03-16 | 安全更新 |
| `release/v1.7.0` | v1.7.0 | ✅ 活跃 | 2026-03-15 | 安全更新 |
| `release/v1.6.0` | v1.6.0 | ✅ 活跃 | 2026-03-15 | 有限支持 |
| `release/v1.5.0` | v1.5.0 | ✅ 活跃 | 2026-03-14 | 有限支持 |
| `release/v1.4.0` | v1.4.0 | ✅ 活跃 | 2026-03-14 | 有限支持 |
| `release/v1.3.0` | v1.3.0 | ✅ 活跃 | 2026-03-13 | LTS |
| `release/v1.2.0` | v1.2.0 | ✅ 活跃 | 2026-03-13 | LTS |
| `release/v1.1.0` | v1.1.0 | ✅ 活跃 | 2026-03-12 | LTS |
| `release/v1.0.0` | v1.0.0 | ✅ 活跃 | 2026-03-12 | LTS |

---

## 📋 分支详情

### main (v1.8.1)

**最新稳定开发分支。**

- **版本:** v1.8.1
- **主题:** 文档完善
- **功能:**
  - 9 个里程碑版本文档完整
  - 完整的发布说明
  - 隐私信息已清理
  - 时间戳规范化（仅日期）

**用途:** 新部署、最新功能

---

### release/v1.8.0 (v1.8.0)

**依赖更新的稳定版本。**

- **版本:** v1.8.0
- **主题:** 11 个 Dependabot 更新合并
- **功能:**
  - 所有安全补丁已应用
  - 11 个依赖更新
  - 生产就绪稳定版本

**用途:** 需要最高稳定性的生产部署

---

### release/v1.7.0 (v1.7.0)

**代码清理版本。**

- **版本:** v1.7.0
- **主题:** 项目清理
- **功能:**
  - 移除非项目文件
  - 目录结构优化
  - 文档同步

**用途:** 干净代码库参考

---

### release/v1.6.0 (v1.6.0)

**浏览器自动化版本。**

- **版本:** v1.6.0
- **主题:** 中国社交媒体集成
- **功能:**
  - Python 浏览器自动化
  - 微信/微博/抖音支持
  - 自动推广策略

**用途:** 社交媒体自动化项目

---

### release/v1.5.0 (v1.5.0)

**自动化版本。**

- **版本:** v1.5.0
- **主题:** Dependabot 自动合并
- **功能:**
  - 自动化依赖更新
  - PR 自动分配
  - 发布自动化

**用途:** 低维护部署

---

### release/v1.4.0 (v1.4.0)

**文档版本。**

- **版本:** v1.4.0
- **主题:** 完整用户文档
- **功能:**
  - 41+ 文档文件
  - 双语支持 (英文/中文)
  - 完整用户指南

**用途:** 文档参考

---

### release/v1.3.0 (v1.3.0)

**生产就绪版本。**

- **版本:** v1.3.0
- **主题:** 基础设施与工具链
- **功能:**
  - CI/CD 流水线
  - Docker 支持
  - 测试框架
  - 代码质量工具

**用途:** 生产部署 (LTS)

---

### release/v1.2.0 (v1.2.0)

**用户体验版本。**

- **版本:** v1.2.0
- **主题:** 个性化与组织
- **功能:**
  - 头像上传
  - 文档收藏夹
  - 阅读历史
  - 深色模式
  - 文档分享

**用途:** 以用户为中心的部署 (LTS)

---

### release/v1.1.0 (v1.1.0)

**搜索与导航版本。**

- **版本:** v1.1.0
- **主题:** 可发现性
- **功能:**
  - 全文搜索 (FlexSearch)
  - 目录树懒加载
  - 面包屑导航
  - 响应式设计

**用途:** 搜索-focused 部署 (LTS)

---

### release/v1.0.0 (v1.0.0)

**初始版本。**

- **版本:** v1.0.0
- **主题:** 基础
- **功能:**
  - 目录树导航
  - Markdown 渲染
  - JWT 认证
  - 基于角色的访问控制
  - 实时更新

**用途:** 最小化部署、学习参考 (LTS)

---

## 🔀 分支工作流

### 创建新的发布分支

```bash
# 从 main 分支
git checkout main
git pull origin main

# 创建发布分支
git checkout -b release/v1.9.0

# 更新版本号
npm version [major|minor|patch] --no-git-tag-version

# 更新文档
# ...

# 提交并推送
git add .
git commit -m "release: v1.9.0"
git push origin release/v1.9.0

# 创建标签
git tag -a v1.9.0 -m "Release v1.9.0"
git push origin v1.9.0
```

### 热修复流程

```bash
# 检出发布分支
git checkout release/v1.8.0

# 创建热修复分支
git checkout -b hotfix/issue-123

# 修复 bug
# ...

# 提交并合并
git checkout release/v1.8.0
git merge hotfix/issue-123
git push origin release/v1.8.0

# 同时合并到 main
git checkout main
git merge release/v1.8.0
git push origin main
```

---

## 📊 版本支持策略

| 支持级别 | 持续时间 | 包含内容 |
|----------|----------|----------|
| **当前** | 最新版本 | 所有功能、Bug 修复、安全 |
| **安全** | 6 个月 | 仅安全补丁 |
| **有限** | 3 个月 | 仅关键修复 |
| **LTS** | 12 个月 | 安全 + 关键修复 |

---

## 🏷️ 标签命名

- **稳定版本:** `v1.8.0`, `v1.8.1` 等
- **预发布:** `v1.9.0-beta.1`, `v1.9.0-rc.1`
- **热修复:** `v1.8.0-hotfix.1`

---

## 📝 文档同步

每个发布分支包含该版本特定的文档：

- `README.md` - 版本特定功能
- `CHANGELOG.md` - 版本历史
- `docs/` - 版本特定指南
- `docs/releases/` - 发布说明 (仅 main)

---

*Last updated: 2026-03-16*
