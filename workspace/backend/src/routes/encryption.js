/**
 * 加密 API 路由 - v2.0.0
 * 敏感数据加密/解密测试
 */

import * as encryption from '../utils/encryption.js'

/**
 * 注册路由
 */
async function registerRoutes(fastify) {
  // 测试加密
  fastify.post('/encryption/test', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!request.user || request.user.role !== 'admin') {
        return reply.code(403).send({ error: '需要管理员权限' })
      }
      
      const { plainText, password } = request.body
      
      if (!plainText) {
        return reply.code(400).send({ error: '请提供明文数据' })
      }
      
      const testPassword = password || encryption.ENCRYPTION_KEY
      const encrypted = encryption.encrypt(plainText, testPassword)
      const decrypted = encryption.decrypt(encrypted, testPassword)
      
      reply.send({
        original: plainText,
        encrypted,
        decrypted,
        match: plainText === decrypted
      })
    } catch (err) {
      fastify.log.error({ err }, '加密测试失败')
      reply.code(500).send({ error: '加密测试失败', message: err.message })
    }
  })

  // 生成安全令牌
  fastify.post('/encryption/token', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { length = 32 } = request.body
      const token = encryption.generateToken(parseInt(length))
      
      reply.send({
        token,
        length: token.length
      })
    } catch (err) {
      fastify.log.error({ err }, '生成令牌失败')
      reply.code(500).send({ error: '生成令牌失败', message: err.message })
    }
  })

  // 哈希测试
  fastify.post('/encryption/hash', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { data, salt } = request.body
      
      if (!data) {
        return reply.code(400).send({ error: '请提供数据' })
      }
      
      const result = encryption.hash(data, salt)
      const verified = encryption.verifyHash(data, result.hash, result.salt)
      
      reply.send({
        ...result,
        verified
      })
    } catch (err) {
      fastify.log.error({ err }, '哈希测试失败')
      reply.code(500).send({ error: '哈希测试失败', message: err.message })
    }
  })

  // 获取加密配置
  fastify.get('/encryption/config', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!request.user || request.user.role !== 'admin') {
        return reply.code(403).send({ error: '需要管理员权限' })
      }
      
      reply.send({
        algorithm: 'aes-256-gcm',
        keyLength: 32,
        ivLength: 16,
        saltLength: 32,
        iterations: 100000,
        authTagLength: 16,
        sensitiveFields: encryption.SENSITIVE_FIELDS
      })
    } catch (err) {
      fastify.log.error({ err }, '获取配置失败')
      reply.code(500).send({ error: '获取配置失败', message: err.message })
    }
  })
}

export default registerRoutes
