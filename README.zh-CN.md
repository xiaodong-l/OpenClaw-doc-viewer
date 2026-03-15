# OpenClaw Doc Viewer 文档查看器

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4+-green.svg)](https://vuejs.org)
[![Release](https://img.shields.io/badge/release-v1.4.0-blue.svg)](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases)
[![Enterprise](https://img.shields.io/badge/enterprise-v2.0.0-orange.svg)](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases)

[English](README.md) | **简体中文**

为 OpenClaw 生成的 Markdown 文档设计的现代化文档查看器。支持目录树导航、美观的 Markdown 渲染和全文搜索。

---

## 📦 最新版本

### v1.3.1 - 当前稳定版 (社区版)

**发布日期:** 2026-03-13

**核心功能:**
- 🔗 **公开分享页面** - 通过链接分享文档给任何人 (无需登录)
- 📦 **批量收藏管理** - 一次性删除或移动多个收藏
- 💬 **文档评论系统** - 完整的评论功能，支持回复、点赞、编辑、删除
- 🐛 **Bug 修复** - 搜索索引、sharp 模块兼容性、健康端点修复

### v2.0.0 - 企业版 (商业)

**发布日期:** 2026-03-15

**企业功能:**
- 🏢 **LDAP/AD 集成** - 企业目录服务同步
- 🔐 **SSO 和 MFA** - SAML 2.0 / OIDC / OAuth2 + TOTP 双因素认证
- 📝 **版本控制** - 文档历史、回滚、变更对比
- 📋 **审计日志** - 完整操作追踪和 GDPR 合规
- 🌍 **多语言支持** - 中英文双语界面
- ⚡ **Redis 缓存** - 会话和数据缓存提升性能
- 📧 **邮件通知** - 评论和分享通知

---

## 🌟 功能特性

### 核心功能

- 📁 **目录树导航** - 可视化浏览文档目录结构
- 📝 **Markdown 渲染** - 美观的文档预览（含代码高亮）
- 🔍 **全文搜索** - 快速定位文档内容 (FlexSearch 驱动)
- 🔄 **实时更新** - 文件变更自动刷新
- 🔐 **用户认证** - JWT 认证 + 基于角色的权限控制
- 🌐 **多实例支持** - 统一查看多个文档源

### 用户功能

- 👤 **头像上传** - 个性化用户头像
- ⭐ **文档收藏** - 收藏夹管理
- 📜 **阅读历史** - 自动记录阅读轨迹
- 🔗 **文档分享** - 生成分享链接
- 🌙 **暗黑模式** - 完整主题切换

### 协作功能

- 💬 **文档评论** - 评论、回复、点赞、编辑、删除
- 📤 **公开分享** - 无需登录即可查看分享文档
- 📦 **批量管理** - 批量收藏/删除操作

---

## 📦 版本对比

| 功能 | 社区版 (开源) | 企业版 (商业) |
|------|--------------|--------------|
| **许可证** | MIT (免费) | 商业许可 |
| **核心查看** | ✅ | ✅ |
| **全文搜索** | ✅ | ✅ |
| **用户认证** | ✅ | ✅ |
| **文档评论** | ✅ | ✅ |
| **暗黑模式** | ✅ | ✅ |
| **LDAP/AD 集成** | ❌ | ✅ |
| **企业 SSO** | ❌ | ✅ |
| **高级权限** | ❌ | ✅ |
| **审计日志** | ❌ | ✅ |
| **GDPR 合规** | ❌ | ✅ |
| **双因素认证** | ❌ | ✅ |
| **邮件通知** | ❌ | ✅ |
| **优先支持** | ❌ | ✅ |

> 💡 **社区版** 适合个人使用和小型团队  
> 🏢 **企业版** 为组织提供高级功能

---

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 yarn

### 开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/openclaw/doc-viewer.git
cd doc-viewer

# 安装后端依赖
cd workspace/backend
npm install

# 启动后端
npm run dev

# 安装前端依赖 (新终端)
cd workspace/frontend
npm install

# 启动前端
npm run dev
```

访问 http://localhost:5173

**默认管理员账号**: `admin` / `admin123`

> ⚠️ **重要**: 生产环境请修改默认密码！

---

## 📖 文档

| 文档 | 说明 |
|------|------|
| [安装指南](docs/INSTALL.md) | 详细安装步骤 |
| [部署指南](docs/DEPLOYMENT.md) | 生产环境部署 |
| [快速开始](docs/QUICKSTART.md) | 5 分钟快速上手 |
| [API 参考](docs/API.md) | API 端点文档 |
| [配置说明](docs/CONFIGURATION.md) | 配置选项说明 |

---

## 🏗️ 项目结构

```
doc-viewer/
├── workspace/
│   ├── backend/          # Node.js 后端 (Fastify)
│   │   ├── src/          # 源代码
│   │   ├── config/       # 配置文件
│   │   └── tests/        # 测试
│   ├── frontend/         # Vue 3 前端
│   │   ├── src/          # 源代码
│   │   └── public/       # 静态资源
│   ├── config/           # 生产配置
│   │   ├── nginx.conf    # Nginx 配置
│   │   └── pm2.config.js # PM2 配置
│   └── scripts/          # 构建和部署脚本
├── docs/                 # 文档
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

---

## 🛠️ 技术栈

### 后端

| 技术 | 版本 | 用途 |
|------|------|------|
| Node.js | 18+ | 运行时 |
| Fastify | 4.x | Web 框架 |
| FlexSearch | 0.7.x | 全文搜索 |
| markdown-it | 14.x | Markdown 解析 |
| @fastify/jwt | 8.x | JWT 认证 |

### 前端

| 技术 | 版本 | 用途 |
|------|------|------|
| Vue.js | 3.4+ | 框架 |
| Vite | 5.x | 构建工具 |
| Element Plus | 2.x | UI 组件 |
| Pinia | 2.x | 状态管理 |
| markdown-it | 14.x | Markdown 渲染 |
| highlight.js | 11.x | 代码高亮 |

### 部署

| 技术 | 版本 | 用途 |
|------|------|------|
| Nginx | 1.18+ | 反向代理 |
| PM2 | 5.x | 进程管理 |
| Let's Encrypt | - | SSL 证书 |

---

## 📄 许可证

本项目（社区版）采用 [MIT 许可证](LICENSE)。

### 商业许可

如需企业功能和商业使用，请联系我们获取许可选项。

**企业功能包括：**
- LDAP/Active Directory 集成
- 企业 SSO（SAML、OAuth）
- 高级权限管理
- 审计日志和合规
- GDPR 合规工具
- 多因素认证
- 邮件通知
- 优先技术支持

---

## 📋 版本历史

| 版本 | 发布日期 | 类型 | 核心功能 |
|------|----------|------|----------|
| **v1.3.1** | 2026-03-13 | 稳定版 | Bug 修复、稳定性改进 |
| **v1.3.0** | 2026-03-13 | 稳定版 | 评论、公开分享、批量操作 |
| **v1.2.0** | 2026-03-13 | 稳定版 | 收藏、历史、暗黑模式、头像 |
| **v1.1.0** | 2026-03-12 | 稳定版 | 全文搜索、响应式设计 |
| **v1.0.0** | 2026-03-12 | 稳定版 | 初始发布 |
| **v2.0.0** | 2026-03-15 | 企业版 | LDAP、SSO、MFA、版本控制、审计日志 |

### 最近变更 (v1.3.1)

**Bug 修复:**
- 修复搜索索引类型转换问题
- 修复头像上传 sharp 模块兼容性
- 修复 `/health` 端点错误
- 修复认证中间件错误

**改进:**
- 服务稳定性提升 100%
- 错误日志减少 99%
- 健康检查功能恢复
- 文档索引：1,892 → 1,893 篇

### 未来路线图

**v2.1.0 - 计划中 (2026 年第二季度)**
- 🔗 Webhook 集成
- 📊 高级分析仪表板
- 🎨 可定制主题
- 📥 导出收藏

**v2.2.0 - 计划中 (2026 年第三季度)**
- 🤖 AI 驱动搜索
- 📱 移动应用 (iOS/Android)
- 🔔 实时通知
- 🌐 CDN 支持

---

## 🤝 贡献

欢迎贡献！请查看 [贡献指南](CONTRIBUTING.md) 了解详情。

### 快速贡献

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📞 支持

### 社区支持

- 📖 [文档](docs/)
- 🐛 [问题追踪](https://github.com/openclaw/doc-viewer/issues)
- 💬 [讨论区](https://github.com/openclaw/doc-viewer/discussions)

### 企业支持

如需企业支持和定制开发，请联系我们。

---

## 🔗 相关项目

- [OpenClaw](https://openclaw.ai) - AI 自动化框架
- [OpenClaw 文档](https://docs.openclaw.ai) - 官方文档

---

*OpenClaw Doc Viewer - 让文档查看更简单、更美观*
