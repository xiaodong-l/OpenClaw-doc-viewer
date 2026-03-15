/**
 * 通知管理路由 - v2.0.0
 * 站内通知、邮件通知、通知设置
 */

import NotificationService, { NotificationType } from '../models/Notification.js'
import emailService from '../services/emailService.js'

const notificationService = new NotificationService()

/**
 * 注册路由
 */
async function registerRoutes(fastify) {
  // 获取通知列表
  fastify.get('/notifications', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { unread, type, limit = 50, offset = 0 } = request.query

      const notifications = await notificationService.getUserNotifications(
        request.user.id,
        {
          unread: unread === 'true',
          type,
          limit: parseInt(limit),
          offset: parseInt(offset)
        }
      )

      reply.send({ notifications })
    } catch (err) {
      fastify.log.error({ err }, '获取通知列表失败')
      reply.code(500).send({ error: '获取通知列表失败', message: err.message })
    }
  })

  // 获取未读通知数量
  fastify.get('/notifications/unread-count', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const count = await notificationService.getUnreadCount(request.user.id)
      reply.send({ count })
    } catch (err) {
      fastify.log.error({ err }, '获取未读数量失败')
      reply.code(500).send({ error: '获取未读数量失败', message: err.message })
    }
  })

  // 获取通知统计
  fastify.get('/notifications/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const stats = await notificationService.getStats(request.user.id)
      reply.send({ stats })
    } catch (err) {
      fastify.log.error({ err }, '获取通知统计失败')
      reply.code(500).send({ error: '获取通知统计失败', message: err.message })
    }
  })

  // 标记通知为已读
  fastify.patch('/notifications/:id/read', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const notification = await notificationService.markAsRead(
        request.params.id,
        request.user.id
      )

      reply.send({ notification })
    } catch (err) {
      fastify.log.error({ err }, '标记已读失败')
      reply.code(500).send({ error: '标记已读失败', message: err.message })
    }
  })

  // 批量标记已读
  fastify.post('/notifications/read-all', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { type } = request.body
      const count = await notificationService.markAllAsRead(request.user.id)
      reply.send({ message: `已标记 ${count} 条通知为已读` })
    } catch (err) {
      fastify.log.error({ err }, '批量标记失败')
      reply.code(500).send({ error: '批量标记失败', message: err.message })
    }
  })

  // 删除通知
  fastify.delete('/notifications/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      await notificationService.delete(request.params.id, request.user.id)
      reply.send({ message: '通知已删除' })
    } catch (err) {
      fastify.log.error({ err }, '删除通知失败')
      reply.code(500).send({ error: '删除通知失败', message: err.message })
    }
  })

  // ========== 通知设置 ==========

  // 获取通知设置
  fastify.get('/notifications/settings', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const settings = await notificationService.getSettings(request.user.id)
      reply.send({ settings })
    } catch (err) {
      fastify.log.error({ err }, '获取通知设置失败')
      reply.code(500).send({ error: '获取通知设置失败', message: err.message })
    }
  })

  // 更新通知设置
  fastify.put('/notifications/settings', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const updates = request.body
      const settings = await notificationService.updateSettings(
        request.user.id,
        updates
      )
      reply.send({ settings })
    } catch (err) {
      fastify.log.error({ err }, '更新通知设置失败')
      reply.code(500).send({ error: '更新通知设置失败', message: err.message })
    }
  })

  // ========== 测试功能 ==========

  // 发送测试通知
  fastify.post('/notifications/test', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { type = 'comment', sendEmail = false } = request.body

      // 创建测试通知
      const notification = await notificationService.create(
        request.user.id,
        type,
        '测试通知',
        '这是一条测试通知',
        null,
        { test: true }
      )

      // 如果请求发送邮件
      if (sendEmail) {
        const user = await fastify.userService.findById(request.user.id)
        if (user && user.email) {
          await emailService.send(
            user.email,
            '测试通知',
            '<h2>测试通知</h2><p>这是一条测试邮件。</p>',
            'test'
          )
        }
      }

      reply.send({
        message: '测试通知已发送',
        notification: notification.toSafeObject()
      })
    } catch (err) {
      fastify.log.error({ err }, '发送测试通知失败')
      reply.code(500).send({ error: '发送测试通知失败', message: err.message })
    }
  })

  // ========== 管理功能 ==========

  // 清理旧通知
  fastify.post('/notifications/cleanup', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!request.user || request.user.role !== 'admin') {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const count = await notificationService.cleanupOldNotifications()
      reply.send({ message: `已清理 ${count} 条旧通知` })
    } catch (err) {
      fastify.log.error({ err }, '清理旧通知失败')
      reply.code(500).send({ error: '清理旧通知失败', message: err.message })
    }
  })

  // 获取邮件日志 (Admin)
  fastify.get('/notifications/email-logs', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!request.user || request.user.role !== 'admin') {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { limit = 100 } = request.query
      await notificationService.initialize()
      const logs = notificationService.data.emailLogs.slice(-parseInt(limit)).reverse()
      reply.send({ logs })
    } catch (err) {
      fastify.log.error({ err }, '获取邮件日志失败')
      reply.code(500).send({ error: '获取邮件日志失败', message: err.message })
    }
  })
}

export default registerRoutes
