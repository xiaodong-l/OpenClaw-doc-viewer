# OpenClaw Doc Viewer

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.4+-green.svg)](https://vuejs.org)
[![Release](https://img.shields.io/badge/release-v1.3.1-blue.svg)](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases)
[![Enterprise](https://img.shields.io/badge/enterprise-v2.0.0-orange.svg)](https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases)

[English](README.md) | [简体中文](README.zh-CN.md) | [日本語](README.ja.md) | **Español**

Un visor de documentos moderno y rico en funciones diseñado para documentación Markdown generada por OpenClaw. Soporta navegación por árbol de directorios, renderizado hermoso de Markdown y búsqueda de texto completo.

---

## 🌍 Soporte Multi-idioma

Este proyecto soporta internacionalización (i18n) multi-idioma:

| Idioma | Estado | Archivo |
|--------|--------|---------|
| 🇺🇸 English | ✅ Completado | README.md |
| 🇨🇳 简体中文 | ✅ Completado | README.zh-CN.md |
| 🇯🇵 日本語 | 🔄 En progreso | README.ja.md |
| 🇪🇸 Español | 🔄 En progreso | README.es.md |
| 🇫🇷 Français | ⏳ Planificado | README.fr.md |
| 🇩🇪 Deutsch | ⏳ Planificado | README.de.md |

**¿Quieres contribuir con traducciones?** ¡Consulta nuestra [Guía de Contribución](CONTRIBUTING.md)!

---

## 📦 Última Versión

### v1.3.1 - Versión Estable Actual (Edición Comunitaria)

**Fecha de Lanzamiento:** 2026-03-13

**Características Principales:**
- 🔗 **Páginas Públicas de Compartir** - Comparte documentos con cualquiera mediante enlace (sin inicio de sesión)
- 📦 **Gestión Lote de Colecciones** - Elimina o mueve múltiples colecciones a la vez
- 💬 **Comentarios de Documentos** - Sistema completo de comentarios con respuestas, me gusta, editar y eliminar
- 🐛 **Corrección de Errores** - Índice de búsqueda, compatibilidad del módulo sharp, correcciones de endpoint de salud

### v2.0.0 - Edición Empresarial (Comercial)

**Fecha de Lanzamiento:** 2026-03-15

**Características Empresariales:**
- 🏢 **Integración LDAP/AD** - Sincronización de servicios de directorio empresarial
- 🔐 **SSO y MFA** - SAML 2.0 / OIDC / OAuth2 + autenticación de dos factores TOTP
- 📝 **Control de Versiones** - Historial de documentos, rollback y comparación de cambios
- 📋 **Registros de Auditoría** - Seguimiento completo de operaciones y cumplimiento GDPR
- 🌍 **Soporte i18n** - Interfaz bilingüe chino/inglés
- ⚡ **Caché Redis** - Caché de sesiones y datos para rendimiento
- 📧 **Notificaciones por Email** - Notificaciones de comentarios y compartidos

---

## 🚀 Inicio Rápido

```bash
# Clonar repositorio
git clone https://github.com/xiaodong-l/OpenClaw-doc-viewer.git
cd doc-viewer

# Instalar backend
cd workspace/backend && npm install && npm run dev

# Instalar frontend (nueva terminal)
cd workspace/frontend && npm install && npm run dev
```

Visita http://localhost:5173

**Cuenta de Administrador Predeterminada:** `admin` / `admin123`

---

## 📖 Documentación

| Documento | Descripción |
|-----------|-------------|
| [Guía de Instalación](docs/INSTALL.md) | Instalación paso a paso |
| [Guía de Despliegue](docs/DEPLOYMENT.md) | Despliegue en producción |
| [Inicio Rápido](docs/QUICKSTART.md) | Comienza en 5 minutos |
| [Referencia API](docs/API.md) | Documentación de endpoints API |
| [Guía de Configuración](docs/CONFIGURATION.md) | Opciones de configuración |
| [Arquitectura](docs/ARCHITECTURE.md) | Arquitectura del sistema |

---

## 🤝 Contribuir

¡Damos la bienvenida a contribuciones! Consulta nuestra [Guía de Contribución](CONTRIBUTING.md) para más detalles.

### Contribuir Traducciones

Si deseas agregar una nueva traducción de idioma:

1. Crea un archivo `README.xx.md` (xx es el código de idioma)
2. Traduce basado en el README.md existente
3. Agrega a la tabla de idiomas
4. Crea un PR

---

## 📄 Licencia

Este proyecto (Edición Comunitaria) está licenciado bajo la [Licencia MIT](LICENSE).

---

*OpenClaw Doc Viewer - Haciendo la visualización de documentos simple y hermosa*
