/**
 * 缓存管理路由 - v2.0.0
 * 缓存控制、统计、清理
 */

import cacheService, { CacheKeys } from '../services/cacheService.js'

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
  // 获取缓存统计
  fastify.get('/cache/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const stats = await cacheService.getStats()
      reply.send({ stats })
    } catch (err) {
      fastify.log.error({ err }, '获取缓存统计失败')
      reply.code(500).send({ error: '获取缓存统计失败', message: err.message })
    }
  })

  // 清空所有缓存
  fastify.delete('/cache/flush', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      await cacheService.flush()
      reply.send({ message: '缓存已清空' })
    } catch (err) {
      fastify.log.error({ err }, '清空缓存失败')
      reply.code(500).send({ error: '清空缓存失败', message: err.message })
    }
  })

  // 清空文档缓存
  fastify.delete('/cache/documents', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      await cacheService.deletePattern('doc:*')
      reply.send({ message: '文档缓存已清空' })
    } catch (err) {
      fastify.log.error({ err }, '清空文档缓存失败')
      reply.code(500).send({ error: '清空文档缓存失败', message: err.message })
    }
  })

  // 清空搜索缓存
  fastify.delete('/cache/search', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      await cacheService.deletePattern('search:*')
      reply.send({ message: '搜索缓存已清空' })
    } catch (err) {
      fastify.log.error({ err }, '清空搜索缓存失败')
      reply.code(500).send({ error: '清空搜索缓存失败', message: err.message })
    }
  })

  // 清空用户缓存
  fastify.delete('/cache/users', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      await cacheService.deletePattern('user:*')
      reply.send({ message: '用户缓存已清空' })
    } catch (err) {
      fastify.log.error({ err }, '清空用户缓存失败')
      reply.code(500).send({ error: '清空用户缓存失败', message: err.message })
    }
  })

  // 测试缓存
  fastify.post('/cache/test', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const testKey = `test:${Date.now()}`
      const testValue = { test: true, timestamp: new Date().toISOString() }

      // 设置缓存
      await cacheService.set(testKey, testValue, 60)
      
      // 获取缓存
      const cached = await cacheService.get(testKey)
      
      // 删除缓存
      await cacheService.delete(testKey)

      reply.send({
        success: cached && cached.test === true,
        cached
      })
    } catch (err) {
      fastify.log.error({ err }, '缓存测试失败')
      reply.code(500).send({ error: '缓存测试失败', message: err.message })
    }
  })
}

export default registerRoutes
