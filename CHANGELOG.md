# Changelog

All notable changes to OpenClaw Doc Viewer (Community Edition) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Planned

- 🔗 Webhook integrations
- 📊 Advanced analytics dashboard
- 🎨 Customizable themes

---

## [1.8.0] - 2026-03-16 - Stable Release

### Added

- 🤖 Merged 11 dependabot dependency updates
- ⚡ Improved build performance with updated tooling

### Changed

- ⬆️ actions/setup-node: v4 → v6
- ⬆️ codecov/codecov-action: v3 → v5
- ⬆️ actions/upload-artifact: v4 → v7
- ⬆️ actions/checkout: v4 → v6
- ⬆️ fastify: 4.29.1 → 5.8.2
- ⬆️ @fastify/jwt: 8.0.1 → 10.0.0
- ⬆️ @fastify/static: 8.0.0 → 9.0.0
- ⬆️ redis: 4.7.1 → 5.11.0
- ⬆️ @faker-js/faker: 8.4.1 → 10.3.0
- ⬆️ lint-staged: 15.5.2 → 16.4.0

### Security

- 🔒 All security patches applied
- 🔒 No known vulnerabilities in dependencies

---

## [1.7.0] - 2026-03-15 - Code Cleanup

### Changed

- 🧹 Removed non-project files from repository
- 🧹 Reorganized workspace directory structure
- 🧹 Synced documentation with codebase
- 🧹 Audited and cleaned unused dependencies

### Improved

- 📦 Reduced repository size
- ⚡ Improved build times
- 🏗️ Better separation of concerns

---

## [1.6.0] - 2026-03-15 - Browser Automation

### Added

- 🐍 Python browser automation with Playwright
- 🌐 China social media integration (WeChat, Weibo, Douyin)
- 📢 Auto-promotion strategy for content publishing
- 📊 Engagement tracking (likes, shares, comments)

### Changed

- 📝 Added social media automation documentation
- 🔧 Added browser automation examples

---

## [1.5.0] - 2026-03-14 - Automation

### Added

- 🤖 Dependabot auto-merge for minor/patch updates
- 👤 Auto-assign action for PRs
- 🚀 Automated GitHub releases

### Changed

- ⚙️ Configured dependabot.yml for auto-merge
- 📝 Added automation documentation

---

## [1.4.0] - 2026-03-14 - User Documentation

### Added

- 📚 CONFIGURATION.md - All configuration options
- 📚 TROUBLESHOOTING.md - Common issues and solutions
- 📚 FAQ.md - Frequently asked questions
- 📚 PERFORMANCE.md - Performance optimization guide
- 📚 MIGRATION.md - Migration from previous versions
- 📚 MAINTAINERS.md - Maintainer guidelines
- 📚 ROADMAP.md - Future development plans
- 📚 TRANSLATION.md - Translation contribution guide

### Changed

- 🌐 All documentation bilingual (EN/CN)
- 📝 Added code examples in all guides
- 🖼️ Added screenshots and diagrams

---

## [1.3.0] - 2026-03-13 - Production Ready

### Added

- 🏗️ Production infrastructure and tooling
- 🔄 CI/CD pipeline with GitHub Actions
- 🐳 Docker support for container deployment
- 🧪 Testing framework (Vitest + Playwright)
- ✨ Code quality tools (ESLint, Prettier, lint-staged)

### Changed

- ⚙️ GitHub Actions: CI, CD, auto-assign, stale, labeler
- 🐳 Multi-stage Docker builds
- 🧪 Unit, integration, E2E tests
- 🔧 Husky hooks, commitlint

---

## [1.2.0] - 2026-03-13 - User Experience

### Added

- 👤 Avatar upload - Custom profile pictures
- ⭐ Document collections - Bookmark and organize favorites
- 📜 Reading history - Automatic tracking of viewed documents
- 🔗 Document sharing - Generate shareable links with expiration
- 🌙 Dark mode - Complete theme switching

### Changed

- ♻️ Redesigned user settings page
- ♻️ Enhanced collection management UI

### Fixed

- 🐛 Avatar upload size validation
- 🐛 History tracking for shared documents

---

## [1.1.0] - 2026-03-12 - Search & Navigation

### Added

- 🔍 Full-text search - FlexSearch integration (1800+ documents)
- 🌳 Directory tree lazy loading - Load directories on demand
- 🍞 Breadcrumb navigation - Clear navigation path
- 📱 Responsive design - Mobile-friendly interface
- 📖 Reading progress - Table of contents and progress bar

### Changed

- ♻️ Improved search performance
- ♻️ Enhanced tree navigation UX

### Fixed

- 🐛 Search highlighting in large documents
- 🐛 Breadcrumb overflow on mobile

---

## [1.0.0] - 2026-03-12 - Initial Release

### Added

- 🎉 Initial release - Community Edition
- 📁 Directory tree navigation
- 📝 Markdown rendering with code highlighting
- 🔐 JWT authentication
- 👥 Role-based access control (Admin, Editor, Viewer)
- 🔄 Real-time file updates
- 🌐 Multi-instance support
- 📊 Basic statistics

---

## [1.3.1] - 2026-03-13

### Fixed

- 🐛 **Search Index Type Conversion** - Fixed `a.split is not a function` error in FlexSearch
- 🐛 **Sharp Module Compatibility** - Made sharp optional dependency for avatar upload
- 🐛 **Health Endpoint** - Fixed `/health` returning `Cannot read properties of undefined`
- 🐛 **Authentication Middleware** - Fixed `preHandler hook should be a function` error

### Changed

- ♻️ Added `String()` type conversion in search index
- ♻️ Made sharp module optional with availability check
- ♻️ Changed `fileScanner.index.count()` to `fileScanner.documents.size`
- ♻️ Used `fastify-plugin` for global decorator availability

### Improved

- ⬆️ Service stability: +100% (from crash loop to stable)
- ⬇️ Error logs: -99% (from 200+/min to <5/min)
- ✅ Health check: Restored
- ✅ Document index: 1,892 → 1,893 documents

---

## [1.3.0] - 2026-03-13

### Added

- 🆕 **Public Sharing Pages** - Share documents with anyone via link (no login required)
- 🆕 **Batch Collection Management** - Delete or move multiple collections at once
- 🆕 **Document Comments** - Full commenting system with replies, likes, edit, and delete
- 🆕 **Comment Notifications** - Get notified when someone replies to your comments

### Changed

- ♻️ Improved comment UI with markdown support
- ♻️ Enhanced sharing page design

### Fixed

- 🐛 Fixed comment pagination issue
- 🐛 Fixed sharing link expiration display

---

## [1.2.0] - 2026-03-13

### Added

- 👤 **Avatar Upload** - Users can upload custom profile avatars
- ⭐ **Document Collections** - Bookmark and organize favorite documents
- 📜 **Reading History** - Automatically track reading history
- 🔗 **Document Sharing** - Generate shareable links with expiration
- 🌙 **Dark Mode** - Complete theme switching between light and dark

### Changed

- ♻️ Redesigned user settings page
- ♻️ Improved collection management UI

### Fixed

- 🐛 Fixed avatar upload size validation
- 🐛 Fixed history tracking for shared documents

---

## [1.1.0] - 2026-03-12

### Added

- 🔍 **Full-Text Search** - Fast document search using FlexSearch (1800+ documents)
- 🌳 **Directory Tree Lazy Loading** - Load directories on demand for better performance
- 🍞 **Breadcrumb Navigation** - Clear navigation path
- 📱 **Responsive Design** - Mobile-friendly interface
- 📖 **Preview Enhancements** - Table of contents and reading progress bar

### Changed

- ♻️ Improved search performance
- ♻️ Enhanced tree navigation UX

### Fixed

- 🐛 Fixed search highlighting in large documents
- 🐛 Fixed breadcrumb overflow on mobile

---

## [1.0.0] - 2026-03-12

### Added

- 🎉 **Initial Release**
- 📁 Directory tree navigation
- 📝 Markdown rendering with code highlighting
- 🔐 JWT authentication
- 👥 Role-based access control (Admin, Editor, Viewer)
- 🔄 Real-time file updates
- 🌐 Multi-instance support
- 📊 Basic statistics

---

## Version History

| Version | Release Date | Key Features |
|---------|--------------|--------------|
| 1.3.0 | 2026-03-13 | Comments, Public Sharing, Batch Operations |
| 1.2.0 | 2026-03-13 | Collections, History, Dark Mode, Avatars |
| 1.1.0 | 2026-03-12 | Full-Text Search, Responsive Design |
| 1.0.0 | 2026-03-12 | Initial Release |

---

## Enterprise Edition

### [2.0.0-GA] - 2026-03-15

**General Availability Release** - Enterprise Edition

#### Added

- 🏢 **LDAP/AD Integration** - Enterprise directory service synchronization
- 🔐 **SSO Support** - SAML 2.0 / OIDC / OAuth2 integration
- 🔒 **Multi-Factor Authentication** - TOTP-based 2FA
- 📝 **Version Control** - Document history, rollback, change comparison
- 📋 **Audit Logs** - Operation tracking, access logs, permission change logs
- 🌍 **i18n Support** - Chinese/English bilingual interface
- ⚡ **Redis Cache** - Session and data caching
- 📧 **Email Notifications** - Comment and share notifications
- 📊 **User Management** - Admin/Editor/Viewer roles
- 🔗 **Enterprise IM** - WeChat Work/DingTalk login

#### Statistics

- **New Code:** ~18,000 lines
- **New Files:** 70
- **New API Endpoints:** 54
- **Test Cases:** 81
- **Test Coverage:** ~75% (core modules 95%+)

---

## Upcoming (Roadmap)

### [2.1.0] - Planned (2026-Q2)

- 🔗 Webhook integrations
- 📊 Advanced analytics dashboard
- 🎨 Customizable themes
- 📥 Export collections

### [2.2.0] - Planned (2026-Q3)

- 🤖 AI-powered search
- 📱 Mobile app (iOS/Android)
- 🔔 Real-time notifications
- 🌐 CDN support

---

## Enterprise Edition

For Enterprise Edition changelog, please contact enterprise@openclaw.ai

---

*For more details, see our [Release Notes](docs/).*
