# Translation Guide / 翻译指南

**English** | [简体中文](#简体中文) | [日本語](#日本語) | [Español](#español)

---

## English

### Contributing Translations

We welcome translations for OpenClaw Doc Viewer in all languages!

#### Supported Languages

| Code | Language | Status | File |
|------|----------|--------|------|
| `en` | English | ✅ Complete | README.md |
| `zh-CN` | 简体中文 | ✅ Complete | README.zh-CN.md |
| `ja` | 日本語 | 🔄 In Progress | README.ja.md |
| `es` | Español | 🔄 In Progress | README.es.md |
| `fr` | Français | ⏳ Planned | README.fr.md |
| `de` | Deutsch | ⏳ Planned | README.de.md |
| `ko` | 한국어 | ⏳ Planned | README.ko.md |
| `pt-BR` | Português (BR) | ⏳ Planned | README.pt-BR.md |
| `ru` | Русский | ⏳ Planned | README.ru.md |
| `ar` | العربية | ⏳ Planned | README.ar.md |

#### How to Contribute a Translation

1. **Fork the Repository**
   ```bash
   git clone https://github.com/xiaodong-l/OpenClaw-doc-viewer.git
   cd OpenClaw-doc-viewer
   ```

2. **Create Translation File**
   ```bash
   # Copy English version as base
   cp README.md README.xx.md  # xx = language code
   ```

3. **Translate Content**
   - Translate all text while keeping Markdown formatting
   - Keep code blocks, URLs, and badges unchanged
   - Update the language table in README.md

4. **Test Your Translation**
   - Preview the file on GitHub
   - Check for broken links or formatting issues

5. **Submit Pull Request**
   ```bash
   git add README.xx.md
   git commit -m "docs: Add [Language Name] translation"
   git push origin main
   ```

#### Translation Guidelines

**Do:**
- ✅ Keep technical terms in English if no common translation exists
- ✅ Maintain the same structure and formatting
- ✅ Update screenshots if they contain text
- ✅ Use native speaker review when possible

**Don't:**
- ❌ Change code examples or commands
- ❌ Modify URLs or badge links
- ❌ Remove sections or features
- ❌ Use machine translation without review

#### Translation File Naming

```
README.md           # English (default)
README.zh-CN.md     # Simplified Chinese
README.zh-TW.md     # Traditional Chinese
README.ja.md        # Japanese
README.es.md        # Spanish
README.fr.md        # French
README.de.md        # German
README.ko.md        # Korean
README.pt-BR.md     # Portuguese (Brazil)
README.ru.md        # Russian
README.ar.md        # Arabic (RTL support needed)
README.it.md        # Italian
```

#### UI Translation

For translating the application UI, see `workspace/frontend/src/locales/` (coming soon).

---

## 简体中文

### 贡献翻译

我们欢迎所有语言的 OpenClaw Doc Viewer 翻译！

#### 支持的语言

| 代码 | 语言 | 状态 | 文件 |
|------|------|------|------|
| `en` | English | ✅ 完成 | README.md |
| `zh-CN` | 简体中文 | ✅ 完成 | README.zh-CN.md |
| `ja` | 日本語 | 🔄 进行中 | README.ja.md |
| `es` | Español | 🔄 进行中 | README.es.md |
| `fr` | Français | ⏳ 计划中 | README.fr.md |
| `de` | Deutsch | ⏳ 计划中 | README.de.md |
| `ko` | 한국어 | ⏳ 计划中 | README.ko.md |
| `pt-BR` | Português (BR) | ⏳ 计划中 | README.pt-BR.md |
| `ru` | Русский | ⏳ 计划中 | README.ru.md |
| `ar` | العربية | ⏳ 计划中 | README.ar.md |

#### 如何贡献翻译

1. **Fork 仓库**
   ```bash
   git clone https://github.com/xiaodong-l/OpenClaw-doc-viewer.git
   cd OpenClaw-doc-viewer
   ```

2. **创建翻译文件**
   ```bash
   # 复制英文版作为基础
   cp README.md README.xx.md  # xx = 语言代码
   ```

3. **翻译内容**
   - 翻译所有文本，保持 Markdown 格式
   - 保持代码块、URL 和徽章不变
   - 更新 README.md 中的语言表

4. **测试翻译**
   - 在 GitHub 上预览文件
   - 检查链接或格式问题

5. **提交 PR**
   ```bash
   git add README.xx.md
   git commit -m "docs: Add [语言名称] translation"
   git push origin main
   ```

#### 翻译指南

**应该:**
- ✅ 如果没有通用翻译，技术术语保持英文
- ✅ 保持相同的结构和格式
- ✅ 如果截图包含文字，更新截图
- ✅ 可能情况下使用母语者审查

**不应该:**
- ❌ 更改代码示例或命令
- ❌ 修改 URL 或徽章链接
- ❌ 删除部分或功能
- ❌ 使用机器翻译而不审查

---

## 日本語

### 翻訳の貢献

OpenClaw Doc Viewer のあらゆる言語での翻訳を歓迎します！

#### サポートされている言語

| コード | 言語 | ステータス | ファイル |
|--------|------|------------|----------|
| `en` | English | ✅ 完了 | README.md |
| `zh-CN` | 简体中文 | ✅ 完了 | README.zh-CN.md |
| `ja` | 日本語 | 🔄 進行中 | README.ja.md |

#### 翻訳の貢献方法

1. **リポジトリをフォーク**
2. **翻訳ファイルを作成**
3. **内容を翻訳**
4. **プルリクエストを提出**

詳細は英語版をご覧ください。

---

## Español

### Contribuir con Traducciones

¡Damos la bienvenida a traducciones de OpenClaw Doc Viewer en todos los idiomas!

#### Idiomas Soportados

| Código | Idioma | Estado | Archivo |
|--------|--------|--------|---------|
| `en` | English | ✅ Completado | README.md |
| `zh-CN` | 简体中文 | ✅ Completado | README.zh-CN.md |
| `es` | Español | 🔄 En Progreso | README.es.md |

#### Cómo Contribuir una Traducción

1. **Bifurcar el Repositorio**
2. **Crear Archivo de Traducción**
3. **Traducir Contenido**
4. **Enviar Pull Request**

Ver la versión en inglés para más detalles.

---

## Related Documents / 相关文档

- [Contributing Guide](CONTRIBUTING.md)
- [Code of Conduct](CODE_OF_CONDUCT.md)

---

*Last updated: 2026-03-15*
