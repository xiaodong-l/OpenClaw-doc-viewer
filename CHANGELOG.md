# Changelog

All notable changes to OpenClaw Doc Viewer (Community Edition) will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
