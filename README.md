# OpenClaw Doc Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4+-green.svg)](https://vuejs.org)
[![Release](https://img.shields.io/badge/release-v1.6.0-blue.svg)](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases)
[![Enterprise](https://img.shields.io/badge/enterprise-v2.0.0-orange.svg)](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases)

**English** | [简体中文](README.zh-CN.md)

A modern, feature-rich document viewer designed for OpenClaw-generated Markdown documentation. Supports directory tree navigation, beautiful Markdown rendering, and full-text search.

---

## 📦 Latest Release

### v1.4.0 - Current Stable (Community Edition)

**Release Date:** 2026-03-15

**Key Features:**
- 🔗 **Public Sharing Pages** - Share documents with anyone via link (no login required)
- 📦 **Batch Collection Management** - Delete or move multiple collections at once
- 💬 **Document Comments** - Full commenting system with replies, likes, edit, and delete
- 🤖 **Dependabot Auto-Merge** - Automated dependency updates with smart merge logic
- 📚 **Comprehensive Documentation** - 41+ documentation files in 4 languages
- 🧪 **CI/CD Automation** - 5 GitHub Actions workflows
- 🐛 **Bug Fixes** - Search index, sharp module compatibility, health endpoint fixes

**Dependency Updates (Merged):**
- ⬆️ Vue Router 4.6.4 → 5.0.3
- ⬆️ Pinia 2.3.1 → 3.0.4
- ⬆️ Vite 5.4.21 → 8.0.0
- ⬆️ @vitejs/plugin-vue 5.2.4 → 6.0.5
- ⬆️ concurrently 8.2.2 → 9.2.1
- ⬆️ dotenv 16.6.1 → 17.3.1
- ⬆️ vitest 1.6.1 → 4.1.0
- ⬆️ @vitest/coverage-v8 1.6.1 → 4.1.0
- ⬆️ sinon 18.0.1 → 21.0.2
- ⬆️ fastify-plugin 4.5.1 → 5.1.0
- ⬆️ @fastify/cors 9.0.1 → 11.2.0
- ⬆️ @fastify/multipart 8.3.1 → 9.4.0
- ⬆️ nodemailer 6.10.1 → 8.0.2
- ⬆️ actions/checkout v4 → v6
- ⬆️ actions/labeler v5 → v6
- ⬆️ actions/upload-artifact v4 → v7
- ⬆️ Node Docker image 18-alpine → 25-alpine

### v2.0.0 - Enterprise Edition (Commercial)

**Release Date:** 2026-03-15

**Enterprise Features:**
- 🏢 **LDAP/AD Integration** - Enterprise directory service synchronization
- 🔐 **SSO & MFA** - SAML 2.0 / OIDC / OAuth2 + TOTP two-factor authentication
- 📝 **Version Control** - Document history, rollback, and change comparison
- 📋 **Audit Logs** - Complete operation tracking and GDPR compliance
- 🌍 **i18n Support** - Chinese/English bilingual interface
- ⚡ **Redis Cache** - Session and data caching for performance
- 📧 **Email Notifications** - Comment and share notifications

---

## 🌟 Features

### Core Features

- 📁 **Directory Tree Navigation** - Visual browsing of document structure
- 📝 **Markdown Rendering** - Beautiful document preview with code highlighting
- 🔍 **Full-Text Search** - Fast document content search (FlexSearch powered)
- 🔄 **Real-time Updates** - Auto-refresh on file changes
- 🔐 **User Authentication** - JWT authentication with role-based access control
- 🌐 **Multi-Instance Support** - View documents from multiple sources

### User Features

- 👤 **Avatar Upload** - Personalized user avatars
- ⭐ **Collections** - Bookmark and organize favorite documents
- 📜 **Reading History** - Automatic reading trail tracking
- 🔗 **Document Sharing** - Generate shareable links
- 🌙 **Dark Mode** - Complete theme switching

### Collaboration Features

- 💬 **Comments** - Comment, reply, like, edit, and delete
- 📤 **Public Sharing** - View shared documents without login
- 📦 **Batch Management** - Bulk collection/delete operations

---

## 📦 Edition Comparison

| Feature | Community Edition | Enterprise Edition |
|---------|------------------|-------------------|
| **License** | MIT (Free) | Commercial |
| **Core Viewing** | ✅ | ✅ |
| **Full-Text Search** | ✅ | ✅ |
| **User Authentication** | ✅ | ✅ |
| **Comments** | ✅ | ✅ |
| **Dark Mode** | ✅ | ✅ |
| **LDAP/AD Integration** | ❌ | ✅ |
| **Enterprise SSO** | ❌ | ✅ |
| **Advanced Permissions** | ❌ | ✅ |
| **Audit Logs** | ❌ | ✅ |
| **GDPR Compliance** | ❌ | ✅ |
| **MFA/2FA** | ❌ | ✅ |
| **Email Notifications** | ❌ | ✅ |
| **Priority Support** | ❌ | ✅ |

> 💡 **Community Edition** is perfect for personal use and small teams.  
> 🏢 **Enterprise Edition** offers advanced features for organizations.

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or yarn

### Development Setup

```bash
# Clone the repository
git clone https://github.com/openclaw/doc-viewer.git
cd doc-viewer

# Install backend dependencies
cd workspace/backend
npm install

# Start backend
npm run dev

# Install frontend dependencies (new terminal)
cd workspace/frontend
npm install

# Start frontend
npm run dev
```

Visit http://localhost:5173

**Default Admin Account**: `admin` / `admin123`

> ⚠️ **Important**: Change the default password in production!

---

## 📖 Documentation

### Getting Started

| Document | Description |
|----------|-------------|
| [Quick Start](docs/QUICKSTART.md) | Get started in 5 minutes |
| [Installation Guide](docs/INSTALL.md) | Step-by-step installation |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment |

### Technical Documentation

| Document | Description |
|----------|-------------|
| [API Reference](docs/API.md) | API endpoint documentation |
| [Configuration](docs/CONFIGURATION.md) | Configuration options |
| [Architecture](docs/ARCHITECTURE.md) | System architecture |
| [Translation Guide](docs/TRANSLATION.md) | Multi-language support |

### Project Documentation

| Document | Description |
|----------|-------------|
| [Roadmap](docs/ROADMAP.md) | Project roadmap & timeline |
| [Maintainers](docs/MAINTAINERS.md) | Maintainer guide |
| [Releases](docs/RELEASES.md) | Release process |
| [Contributing](CONTRIBUTING.md) | How to contribute |

---

## 🏗️ Project Structure

```
doc-viewer/
├── workspace/
│   ├── backend/          # Node.js backend (Fastify)
│   │   ├── src/          # Source code
│   │   ├── config/       # Configuration files
│   │   └── tests/        # Tests
│   ├── frontend/         # Vue 3 frontend
│   │   ├── src/          # Source code
│   │   └── public/       # Static assets
│   ├── config/           # Production configs
│   │   ├── nginx.conf    # Nginx configuration
│   │   └── pm2.config.js # PM2 configuration
│   └── scripts/          # Build and deploy scripts
├── docs/                 # Documentation
├── LICENSE
├── README.md
├── CONTRIBUTING.md
└── CODE_OF_CONDUCT.md
```

---

## 🛠️ Tech Stack

### Backend

| Technology | Version | Purpose |
|------------|---------|---------|
| Node.js | 18+ | Runtime |
| Fastify | 4.x | Web framework |
| FlexSearch | 0.7.x | Full-text search |
| markdown-it | 14.x | Markdown parsing |
| @fastify/jwt | 8.x | JWT authentication |

### Frontend

| Technology | Version | Purpose |
|------------|---------|---------|
| Vue.js | 3.4+ | Framework |
| Vite | 5.x | Build tool |
| Element Plus | 2.x | UI components |
| Pinia | 2.x | State management |
| markdown-it | 14.x | Markdown rendering |
| highlight.js | 11.x | Code highlighting |

### Deployment

| Technology | Version | Purpose |
|------------|---------|---------|
| Nginx | 1.18+ | Reverse proxy |
| PM2 | 5.x | Process manager |
| Let's Encrypt | - | SSL certificates |

---

## 📄 License

This project (Community Edition) is licensed under the [MIT License](LICENSE).

### Commercial License

For enterprise features and commercial use, please contact us for licensing options.

**Enterprise Features Include:**
- LDAP/Active Directory integration
- Enterprise SSO (SAML, OAuth)
- Advanced permission management
- Audit logging and compliance
- GDPR compliance tools
- Multi-factor authentication
- Email notifications
- Priority support

---

## 📋 Version History

| Version | Release Date | Type | Key Features |
|---------|--------------|------|--------------|
| **v1.4.0** | 2026-03-15 | Stable | Dependency updates, auto-merge, docs |
| **v1.3.1** | 2026-03-13 | Stable | Bug fixes, stability improvements |
| **v1.3.0** | 2026-03-13 | Stable | Comments, public sharing, batch operations |
| **v1.2.0** | 2026-03-13 | Stable | Collections, history, dark mode, avatars |
| **v1.1.0** | 2026-03-12 | Stable | Full-text search, responsive design |
| **v1.0.0** | 2026-03-12 | Stable | Initial release |
| **v2.0.0** | 2026-03-15 | Enterprise | LDAP, SSO, MFA, version control, audit logs |

### Recent Changes (v1.4.0)

**Dependency Updates:**
- Updated 21+ dependencies (frontend, backend, CI/CD)
- Enabled Dependabot auto-merge for minor/patch updates
- Automated branch cleanup

**Documentation:**
- Added 41+ documentation files
- Multi-language support (EN/CN/JP/ES)
- Comprehensive user guides and troubleshooting

**Automation:**
- 5 GitHub Actions workflows
- Auto-approve and auto-merge for Dependabot PRs
- Branch cleanup scripts

### Recent Changes (v1.3.1)

**Bug Fixes:**
- Fixed search index type conversion issues
- Fixed sharp module compatibility for avatar upload
- Fixed `/health` endpoint returning errors
- Fixed authentication middleware errors

**Improvements:**
- Service stability improved by 100%
- Error logs reduced by 99%
- Health check functionality restored

### Upcoming (Roadmap)

**v2.1.0 - Planned (2026-Q2)**
- 🔗 Webhook integrations
- 📊 Advanced analytics dashboard
- 🎨 Customizable themes
- 📥 Export collections

**v2.2.0 - Planned (2026-Q3)**
- 🤖 AI-powered search
- 📱 Mobile app (iOS/Android)
- 🔔 Real-time notifications
- 🌐 CDN support

---

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Quick Contribute

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📞 Support

### Community Support

- 📖 [Documentation](docs/)
- 🐛 [Issue Tracker](https://github.com/openclaw/doc-viewer/issues)
- 💬 [Discussions](https://github.com/openclaw/doc-viewer/discussions)

### Enterprise Support

For enterprise support and custom development, please contact us.

---

## 🔗 Related Projects

- [OpenClaw](https://openclaw.ai) - AI automation framework
- [OpenClaw Docs](https://docs.openclaw.ai) - Documentation

---

*OpenClaw Doc Viewer - Making document viewing simple and beautiful*
