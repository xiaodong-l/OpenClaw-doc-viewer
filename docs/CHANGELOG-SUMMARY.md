# Dependency Update Summary / 依赖更新摘要

**Date:** 2026-03-15  
**Release:** v1.4.0

---

## English

### Overview

This document summarizes all dependency updates merged in v1.4.0.

---

## 📦 Merged Updates (21 Total)

### Frontend Dependencies

| Package | From | To | Type | Status |
|---------|------|-----|------|--------|
| vue-router | 4.6.4 | 5.0.3 | Major | ✅ Merged |
| pinia | 2.3.1 | 3.0.4 | Major | ✅ Merged |
| vite | 5.4.21 | 8.0.0 | Major | ✅ Merged |
| @vitejs/plugin-vue | 5.2.4 | 6.0.5 | Major | ✅ Merged |
| concurrently | 8.2.2 | 9.2.1 | Major | ✅ Merged |
| dotenv | 16.6.1 | 17.3.1 | Major | ✅ Merged |
| vitest | 1.6.1 | 4.1.0 | Major | ✅ Merged |
| @vitest/coverage-v8 | 1.6.1 | 4.1.0 | Major | ✅ Merged |

### Backend Dependencies

| Package | From | To | Type | Status |
|---------|------|-----|------|--------|
| sinon | 18.0.1 | 21.0.2 | Major | ✅ Merged |
| fastify-plugin | 4.5.1 | 5.1.0 | Major | ✅ Merged |
| @fastify/cors | 9.0.1 | 11.2.0 | Major | ✅ Merged |
| @fastify/multipart | 8.3.1 | 9.4.0 | Major | ✅ Merged |
| nodemailer | 6.10.1 | 8.0.2 | Major | ✅ Merged |

### CI/CD Dependencies

| Package | From | To | Type | Status |
|---------|------|-----|------|--------|
| actions/checkout | v4 | v6 | Major | ✅ Merged |
| actions/labeler | v5 | v6 | Major | ✅ Merged |
| actions/upload-artifact | v4 | v7 | Major | ✅ Merged |
| node (Docker) | 18-alpine | 25-alpine | Major | ✅ Merged |

---

## ⚠️ Closed (Conflicts - Will Recreate)

| Package | From | To | Type | Status |
|---------|------|-----|------|--------|
| fastify | 4.29.1 | 5.8.2 | Major | ⚠️ Closed |
| eslint | 9.39.4 | 10.0.3 | Major | ⚠️ Closed |
| @fastify/jwt | 8.0.1 | 10.0.0 | Major | ⚠️ Closed |
| vite (frontend) | 5.4.21 | 8.0.0 | Major | ⚠️ Closed |

> **Note:** These PRs were closed due to merge conflicts. Dependabot will recreate them with updated base branches.

---

## 🤖 Automation Enabled

### Dependabot Auto-Merge

**Configuration:** `.github/dependabot.yml`

**Rules:**
- ✅ Auto-merge minor version updates
- ✅ Auto-merge patch version updates
- ❌ Manual review for major version updates

**Workflows:**
- `dependabot-auto-approve.yml` - Auto-approve Dependabot PRs
- `dependabot-auto-merge.yml` - Smart merge logic with CI wait
- `auto_assign.yml` - Skip automated PRs

---

## 📊 Statistics

| Metric | Count |
|--------|-------|
| **Total PRs** | 25 |
| **Merged** | 21 |
| **Closed** | 4 |
| **Frontend Updates** | 8 |
| **Backend Updates** | 5 |
| **CI/CD Updates** | 4 |
| **Auto-Merged** | 21 |

---

## 🧪 Testing Recommendations

### Frontend

```bash
cd workspace/frontend
npm install
npm run dev
npm run test
```

**Test:**
- Navigation and routing
- State management (Pinia)
- Build process (Vite)

### Backend

```bash
cd workspace/backend
npm install
npm run dev
npm test
```

**Test:**
- API endpoints
- Authentication (JWT)
- CORS configuration
- File upload (multipart)
- Email notifications

### CI/CD

**Test:**
- GitHub Actions workflows
- Docker builds
- Artifact uploads

---

## 🔗 Related Files

- `CHANGELOG.md` - Full changelog
- `README.md` - Version badges updated
- `docs/RELEASES.md` - Release guide updated
- `.github/dependabot.yml` - Dependabot configuration
- `.github/workflows/dependabot-*.yml` - Auto-merge workflows

---

## 简体中文

### 概述

本文档总结了 v1.4.0 中合并的所有依赖更新。

---

## 📦 已合并更新 (共 21 个)

### 前端依赖

| 包 | 从 | 到 | 类型 | 状态 |
|----|-----|-----|------|------|
| vue-router | 4.6.4 | 5.0.3 | 主版本 | ✅ 已合并 |
| pinia | 2.3.1 | 3.0.4 | 主版本 | ✅ 已合并 |
| vite | 5.4.21 | 8.0.0 | 主版本 | ✅ 已合并 |
| @vitejs/plugin-vue | 5.2.4 | 6.0.5 | 主版本 | ✅ 已合并 |
| concurrently | 8.2.2 | 9.2.1 | 主版本 | ✅ 已合并 |
| dotenv | 16.6.1 | 17.3.1 | 主版本 | ✅ 已合并 |
| vitest | 1.6.1 | 4.1.0 | 主版本 | ✅ 已合并 |
| @vitest/coverage-v8 | 1.6.1 | 4.1.0 | 主版本 | ✅ 已合并 |

### 后端依赖

| 包 | 从 | 到 | 类型 | 状态 |
|----|-----|-----|------|------|
| sinon | 18.0.1 | 21.0.2 | 主版本 | ✅ 已合并 |
| fastify-plugin | 4.5.1 | 5.1.0 | 主版本 | ✅ 已合并 |
| @fastify/cors | 9.0.1 | 11.2.0 | 主版本 | ✅ 已合并 |
| @fastify/multipart | 8.3.1 | 9.4.0 | 主版本 | ✅ 已合并 |
| nodemailer | 6.10.1 | 8.0.2 | 主版本 | ✅ 已合并 |

### CI/CD 依赖

| 包 | 从 | 到 | 类型 | 状态 |
|----|-----|-----|------|------|
| actions/checkout | v4 | v6 | 主版本 | ✅ 已合并 |
| actions/labeler | v5 | v6 | 主版本 | ✅ 已合并 |
| actions/upload-artifact | v4 | v7 | 主版本 | ✅ 已合并 |
| node (Docker) | 18-alpine | 25-alpine | 主版本 | ✅ 已合并 |

---

## ⚠️ 已关闭 (冲突 - 将重新创建)

| 包 | 从 | 到 | 类型 | 状态 |
|----|-----|-----|------|------|
| fastify | 4.29.1 | 5.8.2 | 主版本 | ⚠️ 已关闭 |
| eslint | 9.39.4 | 10.0.3 | 主版本 | ⚠️ 已关闭 |
| @fastify/jwt | 8.0.1 | 10.0.0 | 主版本 | ⚠️ 已关闭 |
| vite (frontend) | 5.4.21 | 8.0.0 | 主版本 | ⚠️ 已关闭 |

> **注意:** 这些 PR 因合并冲突而关闭。Dependabot 将使用更新后的基础分支重新创建它们。

---

## 🤖 已启用的自动化

### Dependabot 自动合并

**配置:** `.github/dependabot.yml`

**规则:**
- ✅ 自动合并次要版本更新
- ✅ 自动合并补丁版本更新
- ❌ 主版本更新需要手动审查

**工作流:**
- `dependabot-auto-approve.yml` - 自动批准 Dependabot PR
- `dependabot-auto-merge.yml` - 智能合并逻辑 (等待 CI)
- `auto_assign.yml` - 跳过自动化 PR

---

## 📊 统计

| 指标 | 数量 |
|------|------|
| **总 PR 数** | 25 |
| **已合并** | 21 |
| **已关闭** | 4 |
| **前端更新** | 8 |
| **后端更新** | 5 |
| **CI/CD 更新** | 4 |
| **自动合并** | 21 |

---

## 🧪 测试建议

### 前端

```bash
cd workspace/frontend
npm install
npm run dev
npm run test
```

**测试:**
- 导航和路由
- 状态管理 (Pinia)
- 构建过程 (Vite)

### 后端

```bash
cd workspace/backend
npm install
npm run dev
npm test
```

**测试:**
- API 端点
- 认证 (JWT)
- CORS 配置
- 文件上传 (multipart)
- 邮件通知

### CI/CD

**测试:**
- GitHub Actions 工作流
- Docker 构建
- Artifact 上传

---

## 🔗 相关文件

- `CHANGELOG.md` - 完整更新日志
- `README.md` - 版本徽章已更新
- `docs/RELEASES.md` - 发布指南已更新
- `.github/dependabot.yml` - Dependabot 配置
- `.github/workflows/dependabot-*.yml` - 自动合并工作流

---

*Last updated: 2026-03-15*
