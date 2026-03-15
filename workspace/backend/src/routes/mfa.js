/**
 * MFA 路由 - v2.0.0
 * 多因素认证管理
 */

import mfaService from '../services/mfa.js'
import { UserService } from '../models/User.js'

/**
 * 获取用户服务实例
 */
async function getUserService() {
  const userService = new UserService()
  await userService.initialize()
  return userService
}

/**
 * 注册路由
 */
async function registerRoutes(fastify) {
  // 获取 MFA 状态
  fastify.get('/mfa/status', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userService = await getUserService()
      const user = await userService.findById(request.user.id)
      
      reply.send({
        mfaEnabled: user.mfaEnabled,
        mfaConfigured: !!user.mfaSecret
      })
    } catch (err) {
      fastify.log.error({ err }, '获取 MFA 状态失败')
      reply.code(500).send({ error: '获取 MFA 状态失败', message: err.message })
    }
  })

  // 生成 MFA 密钥和 QR Code
  fastify.post('/mfa/setup', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const secret = mfaService.generateSecret()
      const qrData = mfaService.generateQRCodeDataURI(
        secret,
        'OpenClaw Doc Viewer',
        request.user.email
      )
      
      const backupCodes = mfaService.generateBackupCodes()
      
      // 临时存储密钥 (等待用户确认)
      const tempSecretKey = `mfa-setup-${request.user.id}-${Date.now()}`
      await fastify.redis?.setex(tempSecretKey, 300, JSON.stringify({ secret, backupCodes }))
      
      reply.send({
        secret,
        qrCodeUrl: qrData.qrCodeUrl,
        otpauthUrl: qrData.otpauthUrl,
        backupCodes,
        message: '请使用认证器应用扫描二维码，然后输入验证码确认启用'
      })
    } catch (err) {
      fastify.log.error({ err }, '生成 MFA 密钥失败')
      reply.code(500).send({ error: '生成 MFA 密钥失败', message: err.message })
    }
  })

  // 确认启用 MFA
  fastify.post('/mfa/enable', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { token, secret } = request.body
      
      if (!token || !secret) {
        return reply.code(400).send({ error: '请提供验证码和密钥' })
      }
      
      // 验证验证码
      const result = mfaService.verifyTOTP(secret, token)
      
      if (!result.valid) {
        return reply.code(400).send({ error: '验证码无效，请重试' })
      }
      
      // 启用 MFA
      await mfaService.enableMFA(fastify.userService, request.user.id, secret)
      
      reply.send({
        message: 'MFA 已成功启用',
        mfaEnabled: true
      })
    } catch (err) {
      fastify.log.error({ err }, '启用 MFA 失败')
      reply.code(500).send({ error: '启用 MFA 失败', message: err.message })
    }
  })

  // 禁用 MFA
  fastify.post('/mfa/disable', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { token, backupCode } = request.body
      
      const user = await fastify.userService.findById(request.user.id)
      
      if (!user.mfaEnabled) {
        return reply.code(400).send({ error: 'MFA 未启用' })
      }
      
      // 验证当前密码或备份码
      let verified = false
      
      if (backupCode) {
        // TODO: 验证备份代码
        verified = true
      } else if (token) {
        const result = mfaService.verifyMFALogin(user, token)
        verified = result.valid
      }
      
      if (!verified) {
        return reply.code(400).send({ error: '验证失败' })
      }
      
      // 禁用 MFA
      await mfaService.disableMFA(fastify.userService, request.user.id)
      
      reply.send({
        message: 'MFA 已禁用',
        mfaEnabled: false
      })
    } catch (err) {
      fastify.log.error({ err }, '禁用 MFA 失败')
      reply.code(500).send({ error: '禁用 MFA 失败', message: err.message })
    }
  })

  // 生成新的备份代码
  fastify.post('/mfa/backup-codes', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { token } = request.body
      
      const user = await fastify.userService.findById(request.user.id)
      
      if (!user.mfaEnabled) {
        return reply.code(400).send({ error: 'MFA 未启用' })
      }
      
      // 验证 MFA
      const result = mfaService.verifyMFALogin(user, token)
      if (!result.valid) {
        return reply.code(400).send({ error: '验证失败' })
      }
      
      // 生成新的备份代码
      const backupCodes = mfaService.generateBackupCodes()
      
      reply.send({
        backupCodes,
        message: '请妥善保存新的备份代码，旧代码将失效'
      })
    } catch (err) {
      fastify.log.error({ err }, '生成备份代码失败')
      reply.code(500).send({ error: '生成备份代码失败', message: err.message })
    }
  })

  // MFA 登录验证 (用于登录流程)
  fastify.post('/mfa/verify', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { token } = request.body
      
      const user = await fastify.userService.findById(request.user.id)
      const result = mfaService.verifyMFALogin(user, token)
      
      if (!result.valid) {
        return reply.code(400).send({ error: result.error })
      }
      
      // 生成新的 JWT Token (包含 MFA 验证标记)
      const newToken = fastify.jwt.sign({
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        mfaVerified: true
      })
      
      reply.send({
        message: 'MFA 验证成功',
        token: newToken
      })
    } catch (err) {
      fastify.log.error({ err }, 'MFA 验证失败')
      reply.code(500).send({ error: 'MFA 验证失败', message: err.message })
    }
  })
}

export default registerRoutes
