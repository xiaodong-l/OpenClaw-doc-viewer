# Release Guide / 发布指南

**English** | [简体中文](#简体中文)

---

## English

### Overview

This guide covers the complete release process for OpenClaw Doc Viewer.

---

## 📋 Pre-Release Checklist

### Code Quality

- [ ] All tests passing (`npm test`)
- [ ] Code linting passes (`npm run lint`)
- [ ] No console errors in development
- [ ] Performance benchmarks met
- [ ] Security scan completed (`npm audit`)

### Documentation

- [ ] CHANGELOG.md updated
- [ ] README.md version badges updated
- [ ] API docs updated (if applicable)
- [ ] Migration guide (for breaking changes)
- [ ] Release notes drafted

### Testing

- [ ] Manual testing completed
- [ ] Regression tests passed
- [ ] Cross-browser testing (frontend)
- [ ] Cross-platform testing (backend)
- [ ] Load testing (if applicable)

---

## 🚀 Release Steps

### Step 1: Version Bump

```bash
# Navigate to project
cd /path/to/doc-viewer

# Update version in package.json files
# Backend
cd workspace/backend
npm version [major|minor|patch] --no-git-tag-version

# Frontend
cd ../frontend
npm version [major|minor|patch] --no-git-tag-version

# Update root package.json if exists
cd ../..
```

### Step 2: Update CHANGELOG

Edit `CHANGELOG.md`:

```markdown
## [1.4.0] - 2026-04-15

### Added
- New feature 1
- New feature 2

### Changed
- Improved X
- Updated Y

### Fixed
- Bug fix 1
- Bug fix 2

### Deprecated
- Feature X (will be removed in v2.0.0)

### Removed
- Old feature Z

### Security
- Security fix 1
```

### Step 3: Update Version Badges

In `README.md` and `README.*.md`:

```markdown
<!-- Before -->
[![Release](https://img.shields.io/badge/release-v1.3.1-blue.svg)](...)

<!-- After -->
[![Release](https://img.shields.io/badge/release-v1.4.0-blue.svg)](...)
```

### Step 4: Commit Changes

```bash
git add .
git commit -m "chore: Release v1.4.0

- Update version numbers
- Update CHANGELOG
- Update documentation

Release notes: [link to release notes]"
```

### Step 5: Create Git Tag

```bash
# Create annotated tag
git tag -a v1.4.0 -m "Release v1.4.0"

# Push with tags
git push origin main --tags
```

### Step 6: GitHub Release

1. Go to https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases
2. Click "Create a new release"
3. Select tag: `v1.4.0`
4. Title: `OpenClaw Doc Viewer v1.4.0`
5. Add release notes (see template below)
6. Check "Set as latest release" (for stable)
7. Click "Publish release"

### Release Notes Template

```markdown
# OpenClaw Doc Viewer v1.4.0

## 🎉 What's New

Brief overview of major changes.

## ✨ Features

### Feature 1
Description and screenshots.

### Feature 2
Description and screenshots.

## 🐛 Bug Fixes

- Fixed issue #123
- Fixed issue #456

## 📦 Installation

```bash
git clone https://github.com/xiaodong-l/OpenClaw-doc-viewer.git
cd OpenClaw-doc-viewer
# Follow installation guide
```

## 📝 Documentation

- [Installation Guide](docs/INSTALL.md)
- [Quick Start](docs/QUICKSTART.md)
- [API Reference](docs/API.md)

## 🔗 Links

- [Full Changelog](CHANGELOG.md#140---2026-04-15)
- [Documentation](https://github.com/xiaodong-l/OpenClaw-doc-viewer/tree/v1.4.0/docs)
- [Previous Release](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases/tag/v1.3.1)

## 👥 Contributors

Thanks to everyone who contributed!

@contributor1 @contributor2

---

**Full Changelog**: https://github.com/xiaodong-l/OpenClaw-doc-viewer/compare/v1.3.1...v1.4.0
```

### Step 7: Post-Release

- [ ] Monitor for issues
- [ ] Respond to user feedback
- [ ] Update project website
- [ ] Announce on social media
- [ ] Update Discord/Slack channels

---

## 🔄 Release Types

### Patch Release (v1.3.1 → v1.3.2)

**When:** Bug fixes only

**Process:**
1. Fix critical bugs
2. Quick testing
3. Release immediately

**Timeline:** 1-2 days

### Minor Release (v1.3.0 → v1.4.0)

**When:** New features (backwards compatible)

**Process:**
1. Feature freeze 1 week before
2. Beta testing (optional)
3. Full testing
4. Documentation update

**Timeline:** 1-2 weeks

### Major Release (v1.x → v2.0.0)

**When:** Breaking changes

**Process:**
1. Deprecation notices (1-2 months ahead)
2. Beta releases
3. Migration guide
4. Extended testing
5. Community feedback

**Timeline:** 1-3 months

---

## 📊 Release Schedule

### Regular Cadence

| Release Type | Frequency | When |
|--------------|-----------|------|
| Patch | As needed | Bug fixes |
| Minor | Monthly | First Tuesday |
| Major | Quarterly | Q2, Q4 |

### Example Calendar

```
March 2026
├── Week 1: Feature freeze
├── Week 2: Testing
├── Week 3: Documentation
└── Week 4: Release (v1.4.0) ✅ COMPLETED

April 2026
├── Week 1-2: Development
├── Week 3: Beta testing
└── Week 4: Release (v1.5.0)
```

---

## 📝 Recent Releases

### v1.4.0 - 2026-03-15

**Type:** Minor Release (Stable)

**Changes:**
- 21+ dependency updates merged
- Dependabot auto-merge enabled
- 41+ documentation files added
- CI/CD automation improved

**Stats:**
- Files changed: 157
- Commits: 32
- Languages: 4 (EN/CN/JP/ES)

### v1.3.1 - 2026-03-13

**Type:** Patch Release (Stable)

**Changes:**
- Search index type conversion fix
- Sharp module compatibility
- Health endpoint fix
- Authentication middleware fix

**Stats:**
- Service stability: +100%
- Error logs: -99%

---

## 🚨 Hotfix Process

### Critical Bug in Production

1. **Create hotfix branch**
   ```bash
   git checkout -b hotfix/issue-123 main
   ```

2. **Fix the bug**
   - Minimal changes only
   - Add test if possible

3. **Test thoroughly**
   - Reproduce original issue
   - Verify fix
   - Check for regressions

4. **Release hotfix**
   ```bash
   git commit -m "fix: Critical bug fix for issue #123"
   git tag -a v1.3.2-hotfix -m "Hotfix v1.3.2"
   git push origin main --tags
   ```

5. **Merge back to develop**
   ```bash
   git checkout develop
   git merge hotfix/issue-123
   ```

---

## 简体中文

### 概述

本指南涵盖 OpenClaw Doc Viewer 的完整发布流程。

---

## 📋 发布前检查清单

### 代码质量

- [ ] 所有测试通过 (`npm test`)
- [ ] 代码 linting 通过 (`npm run lint`)
- [ ] 开发环境无控制台错误
- [ ] 达到性能基准
- [ ] 完成安全扫描 (`npm audit`)

### 文档

- [ ] CHANGELOG.md 已更新
- [ ] README.md 版本徽章已更新
- [ ] API 文档已更新 (如适用)
- [ ] 迁移指南 (破坏性变更)
- [ ] 发布说明草稿

### 测试

- [ ] 手动测试完成
- [ ] 回归测试通过
- [ ] 跨浏览器测试 (前端)
- [ ] 跨平台测试 (后端)
- [ ] 负载测试 (如适用)

---

## 🚀 发布步骤

### 步骤 1: 提升版本号

```bash
# 进入项目目录
cd /path/to/doc-viewer

# 更新 package.json 中的版本号
# 后端
cd workspace/backend
npm version [major|minor|patch] --no-git-tag-version

# 前端
cd ../frontend
npm version [major|minor|patch] --no-git-tag-version
```

### 步骤 2: 更新 CHANGELOG

编辑 `CHANGELOG.md`

### 步骤 3: 更新版本徽章

在 `README.md` 和 `README.*.md` 中更新版本徽章

### 步骤 4: 提交更改

```bash
git add .
git commit -m "chore: Release v1.4.0"
```

### 步骤 5: 创建 Git 标签

```bash
git tag -a v1.4.0 -m "Release v1.4.0"
git push origin main --tags
```

### 步骤 6: GitHub 发布

1. 访问 GitHub Releases 页面
2. 创建新发布
3. 选择标签
4. 填写发布说明
5. 发布

### 步骤 7: 发布后

- [ ] 监控问题
- [ ] 响应用户反馈
- [ ] 更新项目网站
- [ ] 社交媒体宣布
- [ ] 更新 Discord/Slack 频道

---

## 🔄 发布类型

### 补丁发布 (v1.3.1 → v1.3.2)

**时机:** 仅 Bug 修复

**时间线:** 1-2 天

### 次版本发布 (v1.3.0 → v1.4.0)

**时机:** 新功能 (向后兼容)

**时间线:** 1-2 周

### 主版本发布 (v1.x → v2.0.0)

**时机:** 破坏性变更

**时间线:** 1-3 个月

---

## 🚨 热修复流程

### 生产环境关键 Bug

1. 创建热修复分支
2. 修复 bug
3. 彻底测试
4. 发布热修复
5. 合并回开发分支

---

*Last updated: 2026-03-15*
