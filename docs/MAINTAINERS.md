# Maintainers Guide / 维护者指南

**English** | [简体中文](#简体中文)

---

## English

### Overview

This guide is for maintainers and core contributors of OpenClaw Doc Viewer.

---

## 👥 Maintainer Roles

### Core Maintainers

- **@xiaodong-l** - Project Lead, Architecture
- **[Open Positions]** - Looking for contributors!

### Role Responsibilities

| Role | Responsibilities | Access Level |
|------|-----------------|--------------|
| **Contributor** | Code, docs, translations | PR submission |
| **Reviewer** | Code review, issue triage | Review PRs |
| **Maintainer** | Merge PRs, releases | Write access |
| **Core Maintainer** | Roadmap, architecture | Admin access |

---

## 🔧 Daily Maintenance Tasks

### Issue Triage

1. **Review new issues daily**
   - Label appropriately (bug, enhancement, question)
   - Assign to milestone if applicable
   - Request additional info if needed

2. **Respond within 48 hours**
   - Acknowledge bug reports
   - Provide guidance on questions
   - Thank contributors

3. **Close stale issues**
   - Issues inactive for 90+ days
   - Missing information after 14 days

### Pull Request Review

1. **Review within 72 hours**
   - Check code quality
   - Verify tests pass
   - Ensure documentation updated

2. **Merge criteria**
   - ✅ All CI checks pass
   - ✅ Code follows style guide
   - ✅ Tests added/updated
   - ✅ Documentation updated
   - ✅ No security issues

3. **Release preparation**
   - Update CHANGELOG.md
   - Create release notes
   - Tag version appropriately

### Community Management

1. **GitHub Discussions**
   - Answer questions
   - Highlight good contributions
   - Moderate discussions

2. **Social Media**
   - Share releases
   - Highlight community projects
   - Engage with users

---

## 📦 Release Process

### Version Numbering

We follow [Semantic Versioning](https://semver.org/):

```
MAJOR.MINOR.PATCH
  │     │     │
  │     │     └─ Bug fixes (backwards compatible)
  │     └─────── New features (backwards compatible)
  └───────────── Breaking changes
```

### Release Checklist

#### Patch Release (Bug Fixes)

- [ ] All critical bugs fixed
- [ ] Tests passing
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] GitHub release published

#### Minor Release (Features)

- [ ] All features complete
- [ ] Documentation updated
- [ ] Tests passing
- [ ] CHANGELOG updated
- [ ] Version bumped
- [ ] Git tag created
- [ ] GitHub release published
- [ ] Blog post (if significant)

#### Major Release (Breaking Changes)

- [ ] Migration guide written
- [ ] Deprecation notices sent
- [ ] All above checklist items
- [ ] Upgrade guide published
- [ ] Community announcement

### Publishing a Release

```bash
# 1. Update version in package.json
npm version [major|minor|patch]

# 2. Push with tags
git push origin main --tags

# 3. Create GitHub release
# Go to GitHub → Releases → Create new release

# 4. Publish to npm (if applicable)
npm publish
```

---

## 🐛 Bug Triage

### Severity Levels

| Level | Description | Response Time |
|-------|-------------|---------------|
| **Critical** | Data loss, security, crash | < 24 hours |
| **High** | Major feature broken | < 48 hours |
| **Medium** | Minor bug, workaround exists | < 1 week |
| **Low** | Cosmetic, minor inconvenience | < 1 month |

### Bug Response Template

```markdown
Thank you for reporting this issue!

**Status:** [Confirmed/Needs Info/Not Reproducible]
**Severity:** [Critical/High/Medium/Low]
**Assigned to:** [Maintainer name]

**Next Steps:**
- [ ] Reproduce the issue
- [ ] Identify root cause
- [ ] Develop fix
- [ ] Add test
- [ ] Release in version X.X.X

We'll keep you updated on the progress!
```

---

## 🌍 Translation Management

### Adding New Languages

1. **Verify quality**
   - Native speaker review
   - Technical accuracy
   - Consistent terminology

2. **Update documentation**
   - Add to language table
   - Update i18n config
   - Test UI rendering

3. **Maintain quality**
   - Regular reviews
   - Update with new features
   - Community feedback

---

## 📊 Metrics to Track

### Project Health

- ⭐ Stars growth
- 🍴 Forks count
- 👥 Contributors count
- 🐛 Issues open/closed ratio
- ⏱️ Average issue resolution time

### Release Quality

- 🐞 Post-release bugs
- 📈 Adoption rate
- 🔄 Rollback frequency
- ⭐ User satisfaction

---

## 🤝 Becoming a Maintainer

### Path to Maintainership

1. **Start contributing**
   - Submit quality PRs
   - Help with issues
   - Engage with community

2. **Demonstrate expertise**
   - Deep understanding of codebase
   - Consistent contributions
   - Good judgment

3. **Show leadership**
   - Help other contributors
   - Take initiative
   - Align with project vision

4. **Nomination**
   - Existing maintainers nominate
   - Community input welcomed
   - Formal vote

### Expectations

- Regular participation (at least monthly)
- Follow code of conduct
- Respectful communication
- Quality over speed

---

## 📞 Communication

### Internal (Maintainers)

- **Weekly sync**: Video call (optional)
- **Slack/Discord**: Day-to-day discussion
- **Email**: Formal decisions

### External (Community)

- **GitHub Issues**: Bug reports, feature requests
- **GitHub Discussions**: Questions, ideas
- **Twitter/X**: Announcements
- **Discord**: Community chat

---

## 简体中文

### 概述

本指南面向 OpenClaw Doc Viewer 的维护者和核心贡献者。

---

## 👥 维护者角色

### 核心维护者

- **@xiaodong-l** - 项目负责人，架构
- **[虚位以待]** - 寻找贡献者！

### 角色职责

| 角色 | 职责 | 访问级别 |
|------|------|----------|
| **贡献者** | 代码、文档、翻译 | 提交 PR |
| **审查者** | 代码审查、问题分类 | 审查 PR |
| **维护者** | 合并 PR、发布 | 写入权限 |
| **核心维护者** | 路线图、架构 | 管理员权限 |

---

## 🔧 日常维护任务

### 问题分类

1. **每日审查新问题**
   - 适当标记 (bug、enhancement、question)
   - 分配到里程碑 (如适用)
   - 需要时请求更多信息

2. **48 小时内响应**
   - 确认 bug 报告
   - 提供问题指导
   - 感谢贡献者

3. **关闭过期问题**
   - 90+ 天无活动的问题
   - 14 天后缺少信息的问题

### PR 审查

1. **72 小时内审查**
   - 检查代码质量
   - 验证测试通过
   - 确保文档更新

2. **合并标准**
   - ✅ 所有 CI 检查通过
   - ✅ 代码遵循风格指南
   - ✅ 添加/更新测试
   - ✅ 文档已更新
   - ✅ 无安全问题

3. **发布准备**
   - 更新 CHANGELOG.md
   - 创建发布说明
   - 适当标记版本

---

## 📦 发布流程

### 版本号规则

我们遵循 [语义化版本](https://semver.org/lang/zh-CN/)：

```
主版本。次版本.补丁版本
  │       │       │
  │       │       └─ Bug 修复 (向后兼容)
  │       └───────── 新功能 (向后兼容)
  └───────────────── 破坏性变更
```

### 发布检查清单

#### 补丁发布 (Bug 修复)

- [ ] 所有关键 bug 已修复
- [ ] 测试通过
- [ ] CHANGELOG 已更新
- [ ] 版本号已提升
- [ ] Git 标签已创建
- [ ] GitHub 发布已发布

#### 次版本发布 (功能)

- [ ] 所有功能完成
- [ ] 文档已更新
- [ ] 测试通过
- [ ] CHANGELOG 已更新
- [ ] 版本号已提升
- [ ] Git 标签已创建
- [ ] GitHub 发布已发布
- [ ] 博客文章 (如重要)

#### 主版本发布 (破坏性变更)

- [ ] 迁移指南已编写
- [ ] 弃用通知已发送
- [ ] 以上所有检查项
- [ ] 升级指南已发布
- [ ] 社区公告

---

## 🤝 成为维护者

### 成为维护者的路径

1. **开始贡献**
   - 提交高质量 PR
   - 帮助解决问题
   - 参与社区

2. **展示专业知识**
   - 深入理解代码库
   - 持续贡献
   - 良好判断

3. **展现领导力**
   - 帮助其他贡献者
   - 主动承担
   - 与项目愿景一致

4. **提名**
   - 现有维护者提名
   - 欢迎社区意见
   - 正式投票

### 期望

- 定期参与 (至少每月)
- 遵循行为准则
- 尊重沟通
- 质量优于速度

---

*Last updated: 2026-03-15*
