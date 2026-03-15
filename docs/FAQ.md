# FAQ / 常见问题

**English** | [简体中文](#简体中文) | [日本語](#日本語) | [Español](#español)

---

## English

### General Questions

#### Q: What is OpenClaw Doc Viewer?

**A:** OpenClaw Doc Viewer is a modern, feature-rich document viewing solution designed for Markdown-based documentation systems. It provides beautiful rendering, full-text search, and collaboration features.

#### Q: Is it free to use?

**A:** Yes! The Community Edition is completely free under the MIT License. We also offer an Enterprise Edition with advanced features for organizations.

#### Q: What's the difference between Community and Enterprise editions?

**A:** See our [Editions Comparison](docs/EDITIONS.md) for detailed feature comparison.

---

### Installation & Setup

#### Q: What are the system requirements?

**A:**
- Node.js 18+
- 512MB RAM minimum (1GB recommended)
- 100MB disk space
- Modern web browser (Chrome, Firefox, Safari, Edge)

#### Q: Can I run it on Windows/Mac/Linux?

**A:** Yes! OpenClaw Doc Viewer is cross-platform and works on all major operating systems.

#### Q: How do I upgrade from Community to Enterprise?

**A:** Contact us at enterprise@openclaw.ai for upgrade instructions and licensing.

---

### Troubleshooting

#### Q: Why am I getting "Cannot connect to server" error?

**A:** Check the following:
1. Ensure backend server is running (`npm run dev` or `pm2 start`)
2. Verify the API URL in frontend configuration
3. Check firewall settings
4. Review server logs for errors

#### Q: Search is not working. What should I do?

**A:** Try these steps:
1. Restart the backend server
2. Clear browser cache
3. Check if documents are in configured ROOT_DIRS
4. Review search index in server logs

#### Q: How do I reset the admin password?

**A:** You can reset it by:
1. Stop the server
2. Edit `workspace/backend/data/users.json`
3. Change the password hash (use bcrypt)
4. Restart server

Or use the password reset feature if email is configured.

---

### Development

#### Q: How can I contribute?

**A:** See our [Contributing Guide](CONTRIBUTING.md) for detailed instructions.

#### Q: Can I use this in my commercial project?

**A:** Yes! The MIT License allows commercial use. For enterprise features, contact enterprise@openclaw.ai.

#### Q: How do I report a bug?

**A:** Please use our [Issue Template](https://github.com/xiaodong-l/OpenClaw-doc-viewer/issues/new?template=bug_report.md).

---

## 简体中文

### 一般问题

#### 问：什么是 OpenClaw Doc Viewer？

**答：** OpenClaw Doc Viewer 是一个现代化的、功能丰富的文档查看解决方案，专为基于 Markdown 的文档系统设计。它提供美观的渲染、全文搜索和协作功能。

#### 问：使用免费吗？

**答：** 是的！社区版在 MIT 许可证下完全免费。我们还为企业提供高级功能的企业版。

#### 问：社区版和企业版有什么区别？

**答：** 查看我们的 [版本对比](docs/EDITIONS.md) 了解详细功能对比。

---

### 安装与设置

#### 问：系统要求是什么？

**答：**
- Node.js 18+
- 最低 512MB 内存 (推荐 1GB)
- 100MB 磁盘空间
- 现代浏览器 (Chrome, Firefox, Safari, Edge)

#### 问：可以在 Windows/Mac/Linux 上运行吗？

**答：** 可以！OpenClaw Doc Viewer 是跨平台的，支持所有主要操作系统。

#### 问：如何从社区版升级到企业版？

**答：** 请联系 enterprise@openclaw.ai 获取升级说明和许可信息。

---

### 故障排除

#### 问：为什么显示"无法连接到服务器"错误？

**答：** 检查以下内容：
1. 确保后端服务器正在运行 (`npm run dev` 或 `pm2 start`)
2. 验证前端配置中的 API URL
3. 检查防火墙设置
4. 查看服务器日志中的错误

#### 问：搜索不工作，怎么办？

**答：** 尝试以下步骤：
1. 重启后端服务器
2. 清除浏览器缓存
3. 检查文档是否在配置的 ROOT_DIRS 中
4. 查看服务器日志中的搜索索引

#### 问：如何重置管理员密码？

**答：** 可以通过以下方式重置：
1. 停止服务器
2. 编辑 `workspace/backend/data/users.json`
3. 更改密码哈希 (使用 bcrypt)
4. 重启服务器

如果配置了邮件，也可以使用密码重置功能。

---

### 开发

#### 问：如何贡献？

**答：** 查看我们的 [贡献指南](CONTRIBUTING.md) 获取详细说明。

#### 问：可以在商业项目中使用吗？

**答：** 可以！MIT 许可证允许商业使用。如需企业功能，请联系 enterprise@openclaw.ai。

#### 问：如何报告 bug？

**答：** 请使用我们的 [Issue 模板](https://github.com/xiaodong-l/OpenClaw-doc-viewer/issues/new?template=bug_report.md)。

---

## 日本語

### 一般的な質問

#### Q: OpenClaw Doc Viewer とは何ですか？

**A:** OpenClaw Doc Viewer は、Markdown ベースのドキュメントシステムのために設計された、モダンで機能豊富なドキュメントビューイングソリューションです。

#### Q: 無料で使用できますか？

**A:** はい！コミュニティ版は MIT ライセンスの下で完全に無料です。

---

## Español

### Preguntas Generales

#### P: ¿Qué es OpenClaw Doc Viewer?

**R:** OpenClaw Doc Viewer es una solución moderna y rica en funciones para visualizar documentos diseñada para sistemas de documentación basados en Markdown.

#### P: ¿Es gratis de usar?

**R:** ¡Sí! La Edición Comunitaria es completamente gratuita bajo la Licencia MIT.

---

## Related Documents / 相关文档

- [Installation Guide](docs/INSTALL.md)
- [Quick Start](docs/QUICKSTART.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)
- [Support](.github/SUPPORT.md)

---

*Last updated: 2026-03-15*

*Still have questions? [Contact us](.github/SUPPORT.md) or [open an issue](https://github.com/xiaodong-l/OpenClaw-doc-viewer/issues).*
