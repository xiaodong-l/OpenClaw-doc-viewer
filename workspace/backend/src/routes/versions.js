/**
 * 版本管理路由 - v2.0.0
 * 文档版本历史、对比、回滚
 */

import VersionService, { ChangeType } from '../models/DocumentVersion.js'

const versionService = new VersionService()

/**
 * 检查是否为管理员
 */
function isAdmin(user) {
  return user && user.role === 'admin'
}

/**
 * 注册路由
 */
async function registerRoutes(fastify) {
  // 获取版本历史
  fastify.get('/versions', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { path, limit = 50 } = request.query

      if (!path) {
        return reply.code(400).send({ error: '请提供文档路径' })
      }

      const versions = await versionService.getVersions(path, parseInt(limit))
      reply.send({ versions })
    } catch (err) {
      fastify.log.error({ err }, '获取版本历史失败')
      reply.code(500).send({ error: '获取版本历史失败', message: err.message })
    }
  })

  // 获取特定版本详情
  fastify.get('/versions/:versionId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const version = await versionService.getVersion(request.params.versionId)
      
      if (!version) {
        return reply.code(404).send({ error: '版本不存在' })
      }

      reply.send({ version: version.toSafeObject() })
    } catch (err) {
      fastify.log.error({ err }, '获取版本详情失败')
      reply.code(500).send({ error: '获取版本详情失败', message: err.message })
    }
  })

  // 获取版本内容
  fastify.get('/versions/:versionId/content', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const content = await versionService.getVersionContent(request.params.versionId)
      
      if (!content) {
        return reply.code(404).send({ error: '版本内容不存在' })
      }

      reply.send({ content })
    } catch (err) {
      fastify.log.error({ err }, '获取版本内容失败')
      reply.code(500).send({ error: '获取版本内容失败', message: err.message })
    }
  })

  // 创建新版本
  fastify.post('/versions', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { documentPath, content, changeSummary = '' } = request.body

      if (!documentPath || !content) {
        return reply.code(400).send({ error: '缺少必要参数' })
      }

      // 检查文档锁定状态
      const canEdit = await versionService.canEdit(documentPath, request.user.id)
      if (!canEdit.canEdit) {
        return reply.code(403).send({ 
          error: '无法创建版本',
          message: canEdit.reason,
          lockedBy: canEdit.lockedBy
        })
      }

      const version = await versionService.createVersion(
        documentPath,
        content,
        request.user.id,
        changeSummary
      )

      reply.code(201).send({
        message: '版本已创建',
        version: version.toSafeObject()
      })
    } catch (err) {
      fastify.log.error({ err }, '创建版本失败')
      reply.code(500).send({ error: '创建版本失败', message: err.message })
    }
  })

  // 版本对比
  fastify.get('/versions/:fromId/diff/:toId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { fromId, toId } = request.params

      const diff = await versionService.diffVersions(fromId, toId)

      reply.send({ diff })
    } catch (err) {
      fastify.log.error({ err }, '版本对比失败')
      reply.code(500).send({ error: '版本对比失败', message: err.message })
    }
  })

  // 回滚到指定版本
  fastify.post('/versions/:versionId/rollback', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { versionId } = request.params
      const { reason } = request.body

      // 检查权限
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const newVersion = await versionService.rollbackToVersion(
        versionId,
        request.user.id
      )

      reply.send({
        message: '已回滚到指定版本',
        version: newVersion.toSafeObject()
      })
    } catch (err) {
      fastify.log.error({ err }, '回滚版本失败')
      reply.code(500).send({ error: '回滚版本失败', message: err.message })
    }
  })

  // ========== 文档锁定 ==========

  // 锁定文档
  fastify.post('/locks', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { documentPath, reason = '', duration = 3600 } = request.body

      if (!documentPath) {
        return reply.code(400).send({ error: '请提供文档路径' })
      }

      // 检查是否已锁定
      const lockStatus = await versionService.getLockStatus(documentPath)
      if (lockStatus.locked) {
        return reply.code(409).send({
          error: '文档已被锁定',
          lockedBy: lockStatus.lockedBy,
          expiresAt: lockStatus.expiresAt
        })
      }

      const lock = await versionService.lockDocument(
        documentPath,
        request.user.id,
        reason,
        parseInt(duration)
      )

      reply.code(201).send({
        message: '文档已锁定',
        lock: {
          id: lock.id,
          lockedBy: lock.lockedBy,
          lockedAt: lock.lockedAt,
          expiresAt: lock.expiresAt,
          reason: lock.reason
        }
      })
    } catch (err) {
      fastify.log.error({ err }, '锁定文档失败')
      reply.code(500).send({ error: '锁定文档失败', message: err.message })
    }
  })

  // 解锁文档
  fastify.delete('/locks/:documentPath', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { documentPath } = request.params
      const decodedPath = decodeURIComponent(documentPath)

      await versionService.unlockDocument(decodedPath, request.user.id)

      reply.send({ message: '文档已解锁' })
    } catch (err) {
      fastify.log.error({ err }, '解锁文档失败')
      reply.code(500).send({ error: '解锁文档失败', message: err.message })
    }
  })

  // 获取锁定状态
  fastify.get('/locks/:documentPath', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { documentPath } = request.params
      const decodedPath = decodeURIComponent(documentPath)

      const lockStatus = await versionService.getLockStatus(decodedPath)
      reply.send(lockStatus)
    } catch (err) {
      fastify.log.error({ err }, '获取锁定状态失败')
      reply.code(500).send({ error: '获取锁定状态失败', message: err.message })
    }
  })

  // 检查编辑权限
  fastify.get('/locks/:documentPath/can-edit', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { documentPath } = request.params
      const decodedPath = decodeURIComponent(documentPath)

      const result = await versionService.canEdit(decodedPath, request.user.id)
      reply.send(result)
    } catch (err) {
      fastify.log.error({ err }, '检查编辑权限失败')
      reply.code(500).send({ error: '检查编辑权限失败', message: err.message })
    }
  })

  // ========== 活动日志 ==========

  // 获取活动日志
  fastify.get('/activity', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { path, limit = 100 } = request.query

      const logs = await versionService.getActivityLogs(path, parseInt(limit))
      reply.send({ logs })
    } catch (err) {
      fastify.log.error({ err }, '获取活动日志失败')
      reply.code(500).send({ error: '获取活动日志失败', message: err.message })
    }
  })

  // ========== 管理功能 ==========

  // 清理过期锁
  fastify.post('/locks/cleanup', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const count = await versionService.cleanupExpiredLocks()
      reply.send({ message: `已清理 ${count} 个过期锁` })
    } catch (err) {
      fastify.log.error({ err }, '清理过期锁失败')
      reply.code(500).send({ error: '清理过期锁失败', message: err.message })
    }
  })

  // 删除旧版本
  fastify.post('/versions/prune', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { documentPath, keepCount = 10 } = request.body

      if (!documentPath) {
        return reply.code(400).send({ error: '请提供文档路径' })
      }

      const count = await versionService.pruneOldVersions(documentPath, parseInt(keepCount))
      reply.send({ message: `已删除 ${count} 个旧版本` })
    } catch (err) {
      fastify.log.error({ err }, '删除旧版本失败')
      reply.code(500).send({ error: '删除旧版本失败', message: err.message })
    }
  })
}

export default registerRoutes
