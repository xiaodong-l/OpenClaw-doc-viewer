# Code Review Guide

**English** | [简体中文](#简体中文)

---

## English

### Overview

This guide outlines the code review process for OpenClaw Doc Viewer.

---

## 📋 Review Process

### For Contributors

1. **Before Submitting**
   - [ ] Code follows style guide (ESLint/Prettier)
   - [ ] Tests added/updated
   - [ ] Documentation updated
   - [ ] No console.log or debugging code
   - [ ] Commit messages are clear

2. **PR Description**
   - [ ] Clear description of changes
   - [ ] Related issues linked
   - [ ] Screenshots (if UI changes)
   - [ ] Testing steps provided

3. **After Submission**
   - [ ] Respond to reviewer comments
   - [ ] Make requested changes
   - [ ] Re-run tests if needed

### For Reviewers

1. **Initial Check**
   - [ ] PR template completed
   - [ ] CI/CD checks passing
   - [ ] No merge conflicts
   - [ ] Appropriate labels added

2. **Code Review**
   - [ ] Code quality and style
   - [ ] Functionality correctness
   - [ ] Test coverage
   - [ ] Security considerations
   - [ ] Performance impact

3. **Feedback**
   - [ ] Constructive comments
   - [ ] Clear suggestions
   - [ ] Timely response (< 72 hours)

---

## ✅ Review Checklist

### Code Quality

- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Proper error handling
- [ ] Clear variable names
- [ ] Comments where needed

### Functionality

- [ ] Works as described
- [ ] Edge cases handled
- [ ] No breaking changes (or documented)
- [ ] Backwards compatible

### Testing

- [ ] Tests included
- [ ] Tests passing
- [ ] Good coverage
- [ ] Manual testing done

### Documentation

- [ ] Code documented
- [ ] README updated (if needed)
- [ ] CHANGELOG updated (if needed)
- [ ] API docs updated (if applicable)

### Security

- [ ] No hardcoded secrets
- [ ] Input validation
- [ ] No SQL injection risks
- [ ] No XSS vulnerabilities
- [ ] Authentication/authorization correct

### Performance

- [ ] No obvious performance issues
- [ ] Efficient algorithms
- [ ] Proper caching
- [ ] No memory leaks

---

## 🎯 Review Guidelines

### Be Constructive

✅ **Do:**
- "Consider using a more descriptive variable name here"
- "This could be simplified by..."
- "Great work on the tests!"

❌ **Don't:**
- "This is wrong"
- "Why did you do it this way?"
- No positive feedback

### Be Timely

- **First response**: Within 72 hours
- **Follow-up**: Within 24 hours
- **Final decision**: Within 1 week

### Be Respectful

- Assume good intentions
- Focus on code, not person
- Explain reasoning
- Accept feedback gracefully

---

## 📊 Review Outcomes

### Approve

Code is ready to merge.

### Request Changes

Issues must be addressed before merging.

### Comment

Suggestions for improvement, but not blocking.

---

## 🔧 Tools

### Automated Checks

- ESLint
- Prettier
- Unit tests
- Build verification

### Manual Review

- Code quality
- Architecture decisions
- User experience
- Documentation

---

## 简体中文

### 概述

本指南概述 OpenClaw Doc Viewer 的代码审查流程。

---

## 📋 审查流程

### 贡献者

1. **提交前**
   - [ ] 代码遵循风格指南
   - [ ] 测试已添加/更新
   - [ ] 文档已更新
   - [ ] 无 console.log 或调试代码
   - [ ] 提交消息清晰

2. **PR 描述**
   - [ ] 清晰的变更说明
   - [ ] 链接相关问题
   - [ ] 截图 (如 UI 变更)
   - [ ] 提供测试步骤

3. **提交后**
   - [ ] 回复审查意见
   - [ ] 完成请求的变更
   - [ ] 如需要重新运行测试

### 审查者

1. **初步检查**
   - [ ] PR 模板完成
   - [ ] CI/CD 检查通过
   - [ ] 无合并冲突
   - [ ] 添加适当标签

2. **代码审查**
   - [ ] 代码质量和风格
   - [ ] 功能正确性
   - [ ] 测试覆盖
   - [ ] 安全考虑
   - [ ] 性能影响

3. **反馈**
   - [ ] 建设性评论
   - [ ] 清晰建议
   - [ ] 及时响应 (< 72 小时)

---

## ✅ 审查检查清单

### 代码质量

- [ ] 遵循编码标准
- [ ] 无代码重复
- [ ] 适当的错误处理
- [ ] 清晰的变量名
- [ ] 需要处有注释

### 功能

- [ ] 按描述工作
- [ ] 处理边界情况
- [ ] 无破坏性变更 (或已记录)
- [ ] 向后兼容

### 测试

- [ ] 包含测试
- [ ] 测试通过
- [ ] 良好覆盖
- [ ] 完成手动测试

### 文档

- [ ] 代码有文档
- [ ] README 已更新 (如需要)
- [ ] CHANGELOG 已更新 (如需要)
- [ ] API 文档已更新 (如适用)

### 安全

- [ ] 无硬编码密钥
- [ ] 输入验证
- [ ] 无 SQL 注入风险
- [ ] 无 XSS 漏洞
- [ ] 认证/授权正确

### 性能

- [ ] 无明显性能问题
- [ ] 高效算法
- [ ] 适当缓存
- [ ] 无内存泄漏

---

## 🎯 审查指南

### 建设性

✅ **应该:**
- "考虑使用更具描述性的变量名"
- "这可以通过...简化"
- "测试做得很好！"

❌ **不应该:**
- "这是错的"
- "你为什么这样做？"
- 无正面反馈

### 及时性

- **首次响应**: 72 小时内
- **跟进**: 24 小时内
- **最终决定**: 1 周内

### 尊重

- 假设善意
- 关注代码，不针对人
- 解释原因
- 优雅接受反馈

---

## 📊 审查结果

### 批准

代码已准备好合并。

### 请求变更

必须在合并前解决问题。

### 评论

改进建议，但不阻止合并。

---

*Last updated: 2026-03-15*

*For more details, see [CONTRIBUTING.md](CONTRIBUTING.md)*
