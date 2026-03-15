/**
 * LDAP 管理路由 - v2.0.0
 * LDAP/AD 配置、同步、用户映射
 */

import LDAPService from '../services/ldapService.js'

const ldapService = new LDAPService()

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
  // ========== LDAP 配置管理 ==========

  // 获取 LDAP 配置列表
  fastify.get('/ldap', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const configs = await ldapService.getConfigs()
      reply.send({ configs })
    } catch (err) {
      fastify.log.error({ err }, '获取 LDAP 配置失败')
      reply.code(500).send({ error: '获取 LDAP 配置失败', message: err.message })
    }
  })

  // 获取 LDAP 配置详情
  fastify.get('/ldap/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const config = await ldapService.getConfig(request.params.id)
      if (!config) {
        return reply.code(404).send({ error: '配置不存在' })
      }
      reply.send({ config })
    } catch (err) {
      fastify.log.error({ err }, '获取 LDAP 配置详情失败')
      reply.code(500).send({ error: '获取 LDAP 配置详情失败', message: err.message })
    }
  })

  // 创建 LDAP 配置
  fastify.post('/ldap', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const {
        name, host, port, useSSL, baseDN, bindDN, bindPassword,
        userFilter, userSearchBase, usernameAttribute, emailAttribute,
        displayNameAttribute, syncEnabled, syncInterval, autoCreateUser, defaultRole
      } = request.body

      if (!name || !host || !baseDN) {
        return reply.code(400).send({ error: '缺少必要参数' })
      }

      const config = await ldapService.createConfig({
        name, host, port, useSSL, baseDN, bindDN, bindPassword,
        userFilter, userSearchBase, usernameAttribute, emailAttribute,
        displayNameAttribute, syncEnabled, syncInterval, autoCreateUser, defaultRole
      })

      reply.code(201).send({ message: 'LDAP 配置已创建', config })
    } catch (err) {
      fastify.log.error({ err }, '创建 LDAP 配置失败')
      reply.code(500).send({ error: '创建 LDAP 配置失败', message: err.message })
    }
  })

  // 更新 LDAP 配置
  fastify.put('/ldap/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const config = await ldapService.updateConfig(request.params.id, request.body)
      reply.send({ message: 'LDAP 配置已更新', config })
    } catch (err) {
      fastify.log.error({ err }, '更新 LDAP 配置失败')
      reply.code(500).send({ error: '更新 LDAP 配置失败', message: err.message })
    }
  })

  // 删除 LDAP 配置
  fastify.delete('/ldap/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      await ldapService.deleteConfig(request.params.id)
      reply.send({ message: 'LDAP 配置已删除' })
    } catch (err) {
      fastify.log.error({ err }, '删除 LDAP 配置失败')
      reply.code(500).send({ error: '删除 LDAP 配置失败', message: err.message })
    }
  })

  // 测试 LDAP 连接
  fastify.post('/ldap/:id/test', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const result = await ldapService.testConnection(request.params.id)
      reply.send(result)
    } catch (err) {
      fastify.log.error({ err }, '测试 LDAP 连接失败')
      reply.code(500).send({ error: '测试 LDAP 连接失败', message: err.message })
    }
  })

  // 同步 LDAP 用户
  fastify.post('/ldap/:id/sync', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const result = await ldapService.syncUsers(request.params.id)
      reply.send(result)
    } catch (err) {
      fastify.log.error({ err }, '同步 LDAP 用户失败')
      reply.code(500).send({ error: '同步 LDAP 用户失败', message: err.message })
    }
  })

  // 获取同步日志
  fastify.get('/ldap/:id/logs', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { limit = 50 } = request.query
      const logs = await ldapService.getSyncLogs(request.params.id, parseInt(limit))
      reply.send({ logs })
    } catch (err) {
      fastify.log.error({ err }, '获取同步日志失败')
      reply.code(500).send({ error: '获取同步日志失败', message: err.message })
    }
  })

  // 获取 LDAP 统计
  fastify.get('/ldap/:id/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const stats = await ldapService.getStats(request.params.id)
      reply.send({ stats })
    } catch (err) {
      fastify.log.error({ err }, '获取 LDAP 统计失败')
      reply.code(500).send({ error: '获取 LDAP 统计失败', message: err.message })
    }
  })

  // ========== LDAP 认证 ==========

  // LDAP 登录
  fastify.post('/auth/ldap', {
    preHandler: [] // 不需要认证
  }, async (request, reply) => {
    try {
      const { configId, username, password } = request.body

      if (!configId || !username || !password) {
        return reply.code(400).send({ error: '缺少必要参数' })
      }

      const result = await ldapService.authenticate(configId, username, password)

      if (!result.success) {
        return reply.code(401).send({ error: '认证失败', message: result.message })
      }

      // 生成 JWT token
      const user = {
        id: result.user.userId,
        email: result.user.email,
        username: result.user.username,
        role: 'viewer', // 从 LDAP 配置获取默认角色
        ldap: true
      }

      const token = fastify.jwt.sign(user)
      const refreshToken = fastify.jwt.sign({ ...user, type: 'refresh' }, { expiresIn: '7d' })

      reply.send({
        message: 'LDAP 登录成功',
        user,
        token,
        refreshToken
      })
    } catch (err) {
      fastify.log.error({ err }, 'LDAP 登录失败')
      reply.code(500).send({ error: 'LDAP 登录失败', message: err.message })
    }
  })

  // ========== 用户映射 ==========

  // 获取用户映射列表
  fastify.get('/ldap/:id/mappings', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      await ldapService.initialize()
      const mappings = ldapService.data.mappings.filter(m => m.ldapConfigId === request.params.id)
      reply.send({ mappings })
    } catch (err) {
      fastify.log.error({ err }, '获取用户映射失败')
      reply.code(500).send({ error: '获取用户映射失败', message: err.message })
    }
  })

  // 删除用户映射
  fastify.delete('/ldap/mappings/:mappingId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      await ldapService.initialize()
      const index = ldapService.data.mappings.findIndex(m => m.id === request.params.mappingId)
      
      if (index === -1) {
        return reply.code(404).send({ error: '映射不存在' })
      }

      ldapService.data.mappings.splice(index, 1)
      await ldapService.saveMappings()

      reply.send({ message: '用户映射已删除' })
    } catch (err) {
      fastify.log.error({ err }, '删除用户映射失败')
      reply.code(500).send({ error: '删除用户映射失败', message: err.message })
    }
  })
}

export default registerRoutes
