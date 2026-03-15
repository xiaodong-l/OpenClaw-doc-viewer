# OpenClaw Doc Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4+-green.svg)](https://vuejs.org)
[![Release](https://img.shields.io/badge/release-v1.3.0-blue.svg)](https://github.com/openclaw/doc-viewer/releases)

**English** | [简体中文](README.zh-CN.md)

A modern, feature-rich document viewer designed for OpenClaw-generated Markdown documentation. Supports directory tree navigation, beautiful Markdown rendering, and full-text search.

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

| Document | Description |
|----------|-------------|
| [Installation Guide](docs/INSTALL.md) | Step-by-step installation |
| [Deployment Guide](docs/DEPLOYMENT.md) | Production deployment |
| [Quick Start](docs/QUICKSTART.md) | Get started in 5 minutes |
| [API Reference](docs/API.md) | API endpoint documentation |
| [Configuration](docs/CONFIGURATION.md) | Configuration options |

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
