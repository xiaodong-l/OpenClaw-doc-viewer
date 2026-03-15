/**
 * 权限管理路由 - v2.0.0
 * 文档权限、组权限、审计日志
 */

import { PermissionService, PermissionRole } from '../models/Permission.js'

const permissionService = new PermissionService()

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
  // 获取文档权限列表
  fastify.get('/permissions', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { path, userId } = request.query

      if (!path && !userId) {
        return reply.code(400).send({ error: '请提供文档路径或用户 ID' })
      }

      let permissions
      if (path) {
        permissions = await permissionService.findByDocument(path)
      } else if (userId) {
        permissions = await permissionService.findByUser(userId)
      }

      reply.send({ permissions })
    } catch (err) {
      fastify.log.error({ err }, '获取权限列表失败')
      reply.code(500).send({ error: '获取权限列表失败', message: err.message })
    }
  })

  // 获取权限统计
  fastify.get('/permissions/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { path } = request.query

      if (!path) {
        return reply.code(400).send({ error: '请提供文档路径' })
      }

      const stats = await permissionService.getStats(path)
      reply.send({ stats })
    } catch (err) {
      fastify.log.error({ err }, '获取权限统计失败')
      reply.code(500).send({ error: '获取权限统计失败', message: err.message })
    }
  })

  // 检查当前用户对文档的权限
  fastify.get('/permissions/check', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { path, action } = request.query
      const userId = request.user.id

      if (!path || !action) {
        return reply.code(400).send({ error: '请提供文档路径和操作类型' })
      }

      // 管理员拥有所有权限
      if (isAdmin(request.user)) {
        return reply.send({ hasPermission: true, role: 'admin' })
      }

      // 检查个人权限
      const hasPermission = await permissionService.checkPermission(path, userId, action)

      // 如果没有个人权限，检查组权限
      if (!hasPermission) {
        const hasGroupPermission = await permissionService.checkGroupPermission(path, userId, action)
        return reply.send({ hasPermission: hasGroupPermission, source: hasGroupPermission ? 'group' : 'none' })
      }

      reply.send({ hasPermission, source: 'user' })
    } catch (err) {
      fastify.log.error({ err }, '检查权限失败')
      reply.code(500).send({ error: '检查权限失败', message: err.message })
    }
  })

  // 授予权限
  fastify.post('/permissions', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { documentPath, userId, role, expiresAt } = request.body

      if (!documentPath || !userId || !role) {
        return reply.code(400).send({ error: '缺少必要参数' })
      }

      if (!Object.values(PermissionRole).includes(role)) {
        return reply.code(400).send({ error: '无效的角色值' })
      }

      await permissionService.grant(documentPath, userId, role, request.user.id, expiresAt)

      reply.send({ message: '权限已授予' })
    } catch (err) {
      fastify.log.error({ err }, '授予权限失败')
      reply.code(500).send({ error: '授予权限失败', message: err.message })
    }
  })

  // 批量授予权限
  fastify.post('/permissions/batch', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { documentPath, permissions } = request.body

      if (!documentPath || !permissions || !Array.isArray(permissions)) {
        return reply.code(400).send({ error: '缺少必要参数' })
      }

      await permissionService.grantBatch(documentPath, permissions, request.user.id)

      reply.send({ message: '批量权限授予成功' })
    } catch (err) {
      fastify.log.error({ err }, '批量授予权限失败')
      reply.code(500).send({ error: '批量授予权限失败', message: err.message })
    }
  })

  // 撤销权限
  fastify.delete('/permissions/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { id } = request.params
      const { documentPath, userId } = request.query

      if (!documentPath || !userId) {
        return reply.code(400).send({ error: '请提供文档路径和用户 ID' })
      }

      await permissionService.revoke(documentPath, userId, request.user.id)

      reply.send({ message: '权限已撤销' })
    } catch (err) {
      fastify.log.error({ err }, '撤销权限失败')
      reply.code(500).send({ error: '撤销权限失败', message: err.message })
    }
  })

  // 获取审计日志
  fastify.get('/permissions/audit', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { documentPath, userId, limit = 100 } = request.query

      const logs = await permissionService.getAuditLogs(documentPath, userId, parseInt(limit))
      reply.send({ logs })
    } catch (err) {
      fastify.log.error({ err }, '获取审计日志失败')
      reply.code(500).send({ error: '获取审计日志失败', message: err.message })
    }
  })

  // 清理过期权限
  fastify.post('/permissions/cleanup', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const count = await permissionService.cleanupExpired()
      reply.send({ message: `已清理 ${count} 条过期权限` })
    } catch (err) {
      fastify.log.error({ err }, '清理过期权限失败')
      reply.code(500).send({ error: '清理过期权限失败', message: err.message })
    }
  })

  // ========== 用户组管理 ==========

  // 创建用户组
  fastify.post('/permissions/groups', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { name, description } = request.body

      if (!name) {
        return reply.code(400).send({ error: '请提供组名称' })
      }

      const group = await permissionService.createGroup(name, description, request.user.id)
      reply.code(201).send({ group })
    } catch (err) {
      fastify.log.error({ err }, '创建用户组失败')
      reply.code(500).send({ error: '创建用户组失败', message: err.message })
    }
  })

  // 获取用户组列表
  fastify.get('/permissions/groups', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const groups = await permissionService.getGroups()
      reply.send({ groups })
    } catch (err) {
      fastify.log.error({ err }, '获取用户组列表失败')
      reply.code(500).send({ error: '获取用户组列表失败', message: err.message })
    }
  })

  // 添加组成员
  fastify.post('/permissions/groups/:groupId/members', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { groupId } = request.params
      const { userId } = request.body

      if (!userId) {
        return reply.code(400).send({ error: '请提供用户 ID' })
      }

      await permissionService.addGroupMember(groupId, userId)
      reply.send({ message: '成员已添加' })
    } catch (err) {
      fastify.log.error({ err }, '添加组成员失败')
      reply.code(500).send({ error: '添加组成员失败', message: err.message })
    }
  })

  // 获取组成员列表
  fastify.get('/permissions/groups/:groupId/members', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { groupId } = request.params
      const members = await permissionService.getGroupMembers(groupId)
      reply.send({ members })
    } catch (err) {
      fastify.log.error({ err }, '获取组成员列表失败')
      reply.code(500).send({ error: '获取组成员列表失败', message: err.message })
    }
  })

  // 授予组权限
  fastify.post('/permissions/groups/:groupId/permissions', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { groupId } = request.params
      const { documentPath, role, expiresAt } = request.body

      if (!documentPath || !role) {
        return reply.code(400).send({ error: '缺少必要参数' })
      }

      await permissionService.grantGroupPermission(documentPath, groupId, role, request.user.id, expiresAt)
      reply.send({ message: '组权限已授予' })
    } catch (err) {
      fastify.log.error({ err }, '授予组权限失败')
      reply.code(500).send({ error: '授予组权限失败', message: err.message })
    }
  })
}

export default registerRoutes
