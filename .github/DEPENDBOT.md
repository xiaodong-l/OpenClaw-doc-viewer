# Dependabot Configuration Guide

**English** | [简体中文](#简体中文)

---

## English

### Overview

This project uses Dependabot for automatic dependency updates with auto-merge enabled for minor and patch updates.

---

## Auto-Merge Rules

### ✅ Auto-Merged

The following updates are automatically merged:

| Type | Updates | Auto-Merge |
|------|---------|------------|
| **Minor** | `v1.2.3` → `v1.3.0` | ✅ Yes |
| **Patch** | `v1.2.3` → `v1.2.4` | ✅ Yes |
| **GitHub Actions** | Any minor/patch | ✅ Yes |
| **Docker** | Minor/patch | ✅ Yes |

### ⚠️ Requires Review

The following updates require manual review:

| Type | Updates | Auto-Merge |
|------|---------|------------|
| **Major** | `v1.x` → `v2.x` | ❌ No |
| **Breaking Changes** | Any breaking change | ❌ No |
| **Security Patches** | Security fixes | ⚠️ Review first |

---

## Configuration

### dependabot.yml

Located at `.github/dependabot.yml`

```yaml
version: 2
updates:
  # Backend
  - package-ecosystem: "npm"
    directory: "/workspace/backend"
    schedule:
      interval: "weekly"
      day: "monday"
      time: "09:00"
    open-pull-requests-limit: 10
    groups:
      backend-minor:
        update-types:
          - "minor"
          - "patch"
```

### Auto-Merge Workflow

Located at `.github/workflows/dependabot-auto-merge.yml`

**Features:**
- Detects minor/patch updates
- Waits for CI checks to pass
- Auto-merges with squash
- Deletes branch after merge
- Skips major version updates

---

## Workflows

### 1. dependabot-auto-merge.yml

- Triggers on Dependabot PRs
- Checks if minor/patch update
- Waits for CI checks
- Auto-merges if all checks pass

### 2. dependabot-auto-approve.yml

- Auto-approves Dependabot PRs
- Required for auto-merge to work

### 3. auto_assign.yml

- Skips Dependabot PRs (already automated)
- Only assigns human-created PRs

---

## Monitoring

### Check Auto-Merge Status

```bash
# View recent Dependabot PRs
gh pr list --author dependabot[bot]

# Check if auto-merge is enabled
gh pr view <number> --json autoMergeRequest
```

### View Logs

- GitHub Actions: https://github.com/xiaodong-l/OpenClaw-doc-viewer/actions
- Filter: `Dependabot Auto-Merge`

---

## Troubleshooting

### Auto-Merge Not Working

**Check:**
1. CI checks are passing
2. PR is from Dependabot
3. It's a minor/patch update
4. No merge conflicts

**Fix:**
```bash
# Manually enable auto-merge
gh pr merge <number> --auto --squash
```

### Too Many PRs

**Reduce frequency:**
```yaml
# In dependabot.yml
schedule:
  interval: "monthly"  # Instead of weekly
```

**Reduce limit:**
```yaml
# In dependabot.yml
open-pull-requests-limit: 5  # Instead of 10
```

---

## Security Considerations

### What's Safe to Auto-Merge

- ✅ Minor version updates (tested)
- ✅ Patch updates (bug fixes)
- ✅ Dev dependencies
- ✅ GitHub Actions (from verified publishers)

### What Needs Review

- ⚠️ Major version updates
- ⚠️ Security-sensitive packages
- ⚠️ Core dependencies (fastify, vue, etc.)
- ⚠️ Packages with many downloads

---

## Best Practices

1. **Monitor Dependabot PRs** - Check daily
2. **Review major updates manually** - Don't auto-merge
3. **Keep CI checks fast** - Auto-merge waits for CI
4. **Group related updates** - Reduce PR noise
5. **Use version ranges** - Allow compatible updates

---

## 简体中文

### 概述

本项目使用 Dependabot 进行自动依赖更新，并为次要版本和补丁版本启用自动合并。

---

## 自动合并规则

### ✅ 自动合并

以下更新会自动合并：

| 类型 | 更新 | 自动合并 |
|------|------|----------|
| **次要版本** | `v1.2.3` → `v1.3.0` | ✅ 是 |
| **补丁版本** | `v1.2.3` → `v1.2.4` | ✅ 是 |
| **GitHub Actions** | 任何次要/补丁 | ✅ 是 |
| **Docker** | 次要/补丁 | ✅ 是 |

### ⚠️ 需要审查

以下更新需要手动审查：

| 类型 | 更新 | 自动合并 |
|------|------|----------|
| **主版本** | `v1.x` → `v2.x` | ❌ 否 |
| **破坏性变更** | 任何破坏性变更 | ❌ 否 |
| **安全补丁** | 安全修复 | ⚠️ 先审查 |

---

## 配置

### dependabot.yml

位于 `.github/dependabot.yml`

### 自动合并工作流

位于 `.github/workflows/dependabot-auto-merge.yml`

**功能:**
- 检测次要/补丁更新
- 等待 CI 检查通过
- 自动合并 (squash)
- 合并后删除分支
- 跳过主版本更新

---

## 监控

### 检查自动合并状态

```bash
# 查看最近的 Dependabot PR
gh pr list --author dependabot[bot]

# 检查是否启用自动合并
gh pr view <number> --json autoMergeRequest
```

### 查看日志

- GitHub Actions: https://github.com/xiaodong-l/OpenClaw-doc-viewer/actions
- 筛选：`Dependabot Auto-Merge`

---

## 故障排除

### 自动合并不工作

**检查:**
1. CI 检查通过
2. PR 来自 Dependabot
3. 是次要/补丁更新
4. 无合并冲突

**修复:**
```bash
# 手动启用自动合并
gh pr merge <number> --auto --squash
```

---

## 安全考虑

### 自动合并安全

- ✅ 次要版本更新 (已测试)
- ✅ 补丁更新 (Bug 修复)
- ✅ 开发依赖
- ✅ GitHub Actions (来自验证发布者)

### 需要审查

- ⚠️ 主版本更新
- ⚠️ 安全敏感包
- ⚠️ 核心依赖 (fastify, vue 等)
- ⚠️ 下载量大的包

---

## 最佳实践

1. **监控 Dependabot PR** - 每日检查
2. **手动审查主版本更新** - 不自动合并
3. **保持 CI 检查快速** - 自动合并等待 CI
4. **分组相关更新** - 减少 PR 噪音
5. **使用版本范围** - 允许兼容更新

---

*Last updated: 2026-03-15*

*For questions, see [CONTRIBUTING.md](CONTRIBUTING.md)*
