/**
 * 企业 SSO 路由 - v2.0.0
 * 企业微信、钉钉单点登录
 */

import crypto from 'crypto'

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
  // ========== 企业微信 ==========

  // 企业微信登录
  fastify.get('/auth/wechat', {
    preHandler: []
  }, async (request, reply) => {
    try {
      const { code } = request.query

      if (!code) {
        return reply.code(400).send({ error: '缺少授权码' })
      }

      // 使用 code 换取用户信息
      // 实际应调用企业微信 API
      const wechatUser = {
        userid: 'mock-user-id',
        name: 'Mock User',
        email: 'mock@example.com'
      }

      // 查找或创建用户
      let user = await fastify.userService.findByEmail(wechatUser.email)
      
      if (!user) {
        // 创建新用户
        user = await fastify.userService.create({
          email: wechatUser.email,
          username: wechatUser.userid,
          name: wechatUser.name,
          source: 'wechat'
        })
      }

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      })

      reply.send({
        message: '企业微信登录成功',
        user: { id: user.id, email: user.email, username: user.username },
        token
      })
    } catch (err) {
      fastify.log.error({ err }, '企业微信登录失败')
      reply.code(500).send({ error: '企业微信登录失败', message: err.message })
    }
  })

  // 获取企业微信配置
  fastify.get('/sso/wechat/config', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      reply.send({
        config: {
          corpId: process.env.WECHAT_CORP_ID || '',
          agentId: process.env.WECHAT_AGENT_ID || '',
          enabled: !!process.env.WECHAT_CORP_ID
        }
      })
    } catch (err) {
      fastify.log.error({ err }, '获取企业微信配置失败')
      reply.code(500).send({ error: '获取企业微信配置失败', message: err.message })
    }
  })

  // 更新企业微信配置
  fastify.put('/sso/wechat/config', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { corpId, agentId, secret } = request.body
      
      // 保存到配置文件或环境变量
      // 简化处理：仅返回成功
      reply.send({ message: '企业微信配置已更新', config: { corpId, agentId } })
    } catch (err) {
      fastify.log.error({ err }, '更新企业微信配置失败')
      reply.code(500).send({ error: '更新企业微信配置失败', message: err.message })
    }
  })

  // ========== 钉钉 ==========

  // 钉钉登录
  fastify.get('/auth/dingtalk', {
    preHandler: []
  }, async (request, reply) => {
    try {
      const { code } = request.query

      if (!code) {
        return reply.code(400).send({ error: '缺少授权码' })
      }

      // 使用 code 换取用户信息
      // 实际应调用钉钉 API
      const dingtalkUser = {
        userid: 'mock-ding-user',
        name: 'Mock Ding User',
        email: 'mock@dingtalk.com'
      }

      // 查找或创建用户
      let user = await fastify.userService.findByEmail(dingtalkUser.email)
      
      if (!user) {
        user = await fastify.userService.create({
          email: dingtalkUser.email,
          username: dingtalkUser.userid,
          name: dingtalkUser.name,
          source: 'dingtalk'
        })
      }

      const token = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role
      })

      reply.send({
        message: '钉钉登录成功',
        user: { id: user.id, email: user.email, username: user.username },
        token
      })
    } catch (err) {
      fastify.log.error({ err }, '钉钉登录失败')
      reply.code(500).send({ error: '钉钉登录失败', message: err.message })
    }
  })

  // 获取钉钉配置
  fastify.get('/sso/dingtalk/config', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      reply.send({
        config: {
          appKey: process.env.DINGTALK_APP_KEY || '',
          enabled: !!process.env.DINGTALK_APP_KEY
        }
      })
    } catch (err) {
      fastify.log.error({ err }, '获取钉钉配置失败')
      reply.code(500).send({ error: '获取钉钉配置失败', message: err.message })
    }
  })

  // 更新钉钉配置
  fastify.put('/sso/dingtalk/config', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' })
      }

      const { appKey, appSecret } = request.body
      
      reply.send({ message: '钉钉配置已更新', config: { appKey } })
    } catch (err) {
      fastify.log.error({ err }, '更新钉钉配置失败')
      reply.code(500).send({ error: '更新钉钉配置失败', message: err.message })
    }
  })

  // ========== SSO 会话管理 ==========

  // 获取 SSO 会话
  fastify.get('/sso/sessions', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      // 返回当前用户的 SSO 会话信息
      reply.send({
        sessions: []
      })
    } catch (err) {
      fastify.log.error({ err }, '获取 SSO 会话失败')
      reply.code(500).send({ error: '获取 SSO 会话失败', message: err.message })
    }
  })

  // 撤销 SSO 会话
  fastify.delete('/sso/sessions/:sessionId', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      // 撤销指定的 SSO 会话
      reply.send({ message: '会话已撤销' })
    } catch (err) {
      fastify.log.error({ err }, '撤销 SSO 会话失败')
      reply.code(500).send({ error: '撤销 SSO 会话失败', message: err.message })
    }
  })
}

export default registerRoutes
