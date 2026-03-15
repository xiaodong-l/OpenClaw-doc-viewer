# 贡献指南

感谢你考虑为 OpenClaw Doc Viewer 做出贡献！

## 📋 目录

- [代码规范](#代码规范)
- [开发环境](#开发环境)
- [提交 PR](#提交-pr)
- [报告问题](#报告问题)
- [功能建议](#功能建议)

## 代码规范

### JavaScript/Vue

- 遵循 ESLint 配置
- 使用 ES6+ 语法
- 组件使用 Composition API (Vue 3)
- 添加适当的注释

### Git 提交

```bash
# 格式：<type>(<scope>): <description>
git commit -m "feat(frontend): 添加文档收藏功能"
git commit -m "fix(backend): 修复搜索索引 bug"
git commit -m "docs: 更新 README"
```

**类型:**
- `feat`: 新功能
- `fix`: Bug 修复
- `docs`: 文档更新
- `style`: 代码格式
- `refactor`: 重构
- `test`: 测试
- `chore`: 构建/工具

## 开发环境

### 快速开始

```bash
# 1. Fork 并克隆
git clone https://github.com/YOUR_USERNAME/doc-viewer.git
cd doc-viewer

# 2. 安装依赖
cd workspace/backend && npm install
cd ../frontend && npm install

# 3. 配置环境
cd ../backend
cp .env.example .env
# 编辑 .env 配置

# 4. 启动开发服务
# 终端 1: 后端
cd workspace/backend
npm run dev

# 终端 2: 前端
cd workspace/frontend
npm run dev
```

### 运行测试

```bash
# 后端测试
cd workspace/backend
npm test

# 前端测试
cd workspace/frontend
npm run test
```

## 提交 PR

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

### PR 检查清单

- [ ] 代码通过 ESLint
- [ ] 添加/更新测试
- [ ] 更新文档
- [ ] 通过所有测试

## 报告问题

请在 Issues 中报告问题，并包含：

- 问题描述
- 复现步骤
- 预期行为
- 实际行为
- 环境信息 (Node.js 版本、浏览器等)
- 截图 (如适用)

## 功能建议

欢迎在 Issues 中提出功能建议，请说明：

- 功能描述
- 使用场景
- 预期效果
- 是否有类似方案

## 许可证

提交代码即表示你同意根据 [MIT License](LICENSE) 授权你的贡献。

---

感谢你的贡献！🎉
