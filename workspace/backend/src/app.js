import Fastify from 'fastify'
import cors from '@fastify/cors'
import jwt from '@fastify/jwt'
import staticPlugin from '@fastify/static'
import path from 'path'
import { fileURLToPath } from 'url'
import config from './config/index.js'
import { FileScanner } from './services/fileScanner.js'
import { parseMarkdown, parseMarkdownWithToc } from './services/markdownParser.js'
import UserService from './services/userService.js'
import { PermissionService } from './services/permissionService.js'
import { getSearchIndex } from './services/searchIndex.js'
import securityMiddleware from './middleware/security.js'
import authMiddleware from './middleware/auth.js'
import fileRoutes from './routes/files.js'
import searchRoutes from './routes/search.js'
import statsRoutes from './routes/stats.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/user.js'
import collectionsRoutes from './routes/collections.js'
import sharesRoutes from './routes/shares.js'
import commentsRoutes from './routes/comments.js'
// v2.0.0 新用户管理路由
import authV2Routes from './routes/authV2.js'
import usersV2Routes from './routes/usersV2.js'
// v2.0.0 权限管理路由
import permissionsV2Routes from './routes/permissions.js'
import permissionPlugin from './middleware/permission.js'
// v2.0.0 MFA 路由
import mfaV2Routes from './routes/mfa.js'
// v2.0.0 加密工具路由
import encryptionV2Routes from './routes/encryption.js'
// v2.0.0 Phase 2 版本管理路由
import versionsV2Routes from './routes/versions.js'
// v2.0.0 Phase 2 通知管理路由
import notificationsV2Routes from './routes/notifications.js'
// v2.0.0 Phase 3 LDAP/SSO 路由
import ldapV2Routes from './routes/ldap.js'
import enterpriseSSORoutes from './routes/enterprise-sso.js'
// v2.0.0 Phase 3 缓存服务路由
import cacheV2Routes from './routes/cache.js'
// v2.0.0 Phase 3 GDPR 合规路由
import gdprV2Routes from './routes/gdpr.js'
// v2.0.0 Phase 3 i18n 中间件
import i18nMiddleware from './middleware/i18n.js'

// 兼容旧版 auth.js (如果存在)
let legacyAuthRoutes = null
try {
  legacyAuthRoutes = await import('./routes/auth.js')
} catch (e) {
  // 忽略
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export async function buildApp(options = {}) {
  const logger = options.logger || {
    level: config.log.level,
    transport: {
      target: 'pino/file',
      options: {
        destination: path.join(__dirname, '../logs/app.log'),
        mkdir: true
      }
    }
  }

  // 创建 Fastify 实例
  const fastify = Fastify({
    logger,
    bodyLimit: 1024 * 1024, // 1MB
    pluginTimeout: 30000
  })

  // 注册 CORS
  await fastify.register(cors, {
    origin: true,
    credentials: true
  })

  // 注册安全中间件
  await fastify.register(securityMiddleware)

  // 注册 JWT
  await fastify.register(jwt, {
    secret: config.jwt.secret,
    sign: { expiresIn: '24h' }
  })

  // 注册认证中间件
  await fastify.register(authMiddleware, {
    userService: null // 稍后设置
  })

  // 添加 Markdown 解析器到 fastify 实例
  fastify.decorate('markdown', {
    parseMarkdown,
    parseMarkdownWithToc
  })

  // 创建并初始化用户服务
  const userService = new UserService(config)
  await userService.initialize()
  fastify.decorate('userService', userService)

  // 注册 i18n 中间件
  await i18nMiddleware(fastify)

  // 创建并初始化权限服务
  const permissionService = new PermissionService(config)
  await permissionService.initialize()
  fastify.decorate('permissionService', permissionService)

  // 更新认证中间件的 userService 引用
  fastify.authMiddlewareOptions = { userService }

  // 创建文件扫描器
  const fileScanner = new FileScanner(config)
  fastify.decorate('fileScanner', fileScanner)

  // 初始化文件扫描器
  await fileScanner.initialize()

  // 创建搜索索引
  const searchIndex = getSearchIndex(config)
  fastify.decorate('searchIndex', searchIndex)
  
  // 初始化搜索索引
  await searchIndex.initialize()
  
  // 从文件扫描器导入文档到搜索索引
  const documents = await fileScanner.getAllDocuments()
  let indexedCount = 0
  for (const doc of documents) {
    try {
      await searchIndex.add({
        id: searchIndex.generateId(doc.path),
        path: doc.path,
        name: doc.name,
        title: doc.title || doc.name,
        content: doc.content || '',
        excerpt: doc.excerpt,
        updatedAt: doc.updatedAt
      })
      indexedCount++
    } catch (err) {
      fastify.log.error(`[SearchIndex] Failed to index ${doc.path}: ${err.message}`)
    }
  }
  fastify.log.info(`[SearchIndex] Indexed ${indexedCount}/${documents.length} documents`)

  // 注册认证路由
  await fastify.register(authRoutes, {
    prefix: '/api/v1',
    userService
  })

  // 注册文件路由 (添加权限检查)
  await fastify.register(fileRoutes, {
    prefix: '/api/v1',
    fileScanner,
    permissionService
  })

  await fastify.register(searchRoutes, {
    prefix: '/api/v1',
    fileScanner,
    searchIndex
  })

  await fastify.register(statsRoutes, {
    prefix: '/api/v1',
    fileScanner
  })

  await fastify.register(userRoutes, {
    prefix: '/api/v1',
    userService
  })

  await fastify.register(collectionsRoutes, {
    prefix: '/api/v1',
    userService
  })

  await fastify.register(sharesRoutes, {
    prefix: '/api/v1',
    userService
  })

  // v1.3.0 评论功能
  await fastify.register(commentsRoutes, {
    prefix: '/api/v1',
    userService
  })

  // v2.0.0 用户管理路由
  await fastify.register(authV2Routes, {
    prefix: '/api/v2'
  })

  await fastify.register(usersV2Routes, {
    prefix: '/api/v2'
  })

  // v2.0.0 权限管理路由
  await fastify.register(permissionPlugin)
  await fastify.register(permissionsV2Routes, {
    prefix: '/api/v2'
  })

  // v2.0.0 MFA 路由
  await fastify.register(mfaV2Routes, {
    prefix: '/api/v2'
  })

  // v2.0.0 加密工具路由
  await fastify.register(encryptionV2Routes, {
    prefix: '/api/v2'
  })

  // v2.0.0 Phase 2 版本管理路由
  await fastify.register(versionsV2Routes, {
    prefix: '/api/v2'
  })

  // v2.0.0 Phase 2 通知管理路由
  await fastify.register(notificationsV2Routes, {
    prefix: '/api/v2'
  })

  // v2.0.0 Phase 3 LDAP/AD 集成路由
  await fastify.register(ldapV2Routes, {
    prefix: '/api/v2'
  })

  // v2.0.0 Phase 3 企业 SSO 路由
  await fastify.register(enterpriseSSORoutes, {
    prefix: '/api/v2'
  })

  // v2.0.0 Phase 3 缓存服务路由
  await fastify.register(cacheV2Routes, {
    prefix: '/api/v2'
  })

  // v2.0.0 Phase 3 GDPR 合规路由
  await fastify.register(gdprV2Routes, {
    prefix: '/api/v2'
  })

  // 健康检查
  fastify.get('/health', async () => {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      docsIndexed: fileScanner.documents.size
    }
  })

  // 根路径
  fastify.get('/', async () => {
    return {
      name: 'OpenClaw Doc Viewer API',
      version: '2.0.0-alpha',
      endpoints: {
        v1: {
          files: '/api/v1/files',
          search: '/api/v1/search',
          stats: '/api/v1/stats',
          collections: '/api/v1/collections',
          shares: '/api/v1/shares',
          comments: '/api/v1/comments'
        },
        v2: {
          auth: '/api/v2/auth',
          users: '/api/v2/users'
        },
        health: '/health'
      }
    }
  })

  // 404 处理
  fastify.setNotFoundHandler((request, reply) => {
    reply.code(404).send({
      success: false,
      error: {
        code: 'NOT_FOUND',
        message: 'Endpoint not found'
      }
    })
  })

  // 错误处理
  fastify.setErrorHandler((error, request, reply) => {
    request.log.error(error)
    
    reply.code(error.statusCode || 500).send({
      success: false,
      error: {
        code: error.code || 'INTERNAL_ERROR',
        message: error.message
      }
    })
  })

  // 优雅关闭
  const closeListeners = ['SIGINT', 'SIGTERM']
  for (const signal of closeListeners) {
    process.on(signal, async () => {
      fastify.log.info({ signal }, 'Closing application')
      await fileScanner.close()
      await fastify.close()
      process.exit(0)
    })
  }

  return fastify
}

export default buildApp
