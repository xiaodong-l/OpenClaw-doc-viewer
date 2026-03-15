/**
 * 加密 API 集成测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { getTestApp } from '../../setup.js'
import { generateUserData } from '../../utils/testUtils.js'

describe('Encryption API', () => {
  let app
  let server
  let baseUrl
  let authToken

  beforeEach(async () => {
    const testApp = await getTestApp()
    server = await testApp.listen({ port: 0, host: 'localhost' })
    const address = server.address()
    baseUrl = `http://${address.address}:${address.port}`

    // 注册并登录获取 token
    const userData = generateUserData({ password: 'Test@123456', role: 'admin' })
    await request(baseUrl).post('/api/v2/auth/register').send(userData)
    
    const loginResponse = await request(baseUrl)
      .post('/api/v2/auth/login')
      .send({ email: userData.email, password: 'Test@123456' })
    
    authToken = loginResponse.body.token
  })

  afterEach(async () => {
    if (server) {
      await server.close()
    }
  })

  describe('POST /api/v2/encryption/test', () => {
    it('应该测试加密解密功能', async () => {
      const response = await request(baseUrl)
        .post('/api/v2/encryption/test')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: 'Hello, World!' })
        .expect(200)

      expect(response.body).toHaveProperty('original', 'Hello, World!')
      expect(response.body).toHaveProperty('encrypted')
      expect(response.body).toHaveProperty('decrypted', 'Hello, World!')
      expect(response.body).toHaveProperty('match', true)
    })

    it('未授权应该返回 401', async () => {
      await request(baseUrl)
        .post('/api/v2/encryption/test')
        .send({ data: 'test' })
        .expect(401)
    })
  })

  describe('POST /api/v2/encryption/encrypt', () => {
    it('应该加密数据', async () => {
      const testData = 'Sensitive data to encrypt'
      
      const response = await request(baseUrl)
        .post('/api/v2/encryption/encrypt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: testData })
        .expect(200)

      expect(response.body).toHaveProperty('encrypted')
      expect(response.body.encrypted).not.toBe(testData)
      expect(typeof response.body.encrypted).toBe('string')
    })

    it('缺少数据应该返回 400', async () => {
      await request(baseUrl)
        .post('/api/v2/encryption/encrypt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
    })
  })

  describe('POST /api/v2/encryption/decrypt', () => {
    let encryptedData

    beforeEach(async () => {
      const encryptResponse = await request(baseUrl)
        .post('/api/v2/encryption/encrypt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: 'Test data' })
      
      encryptedData = encryptResponse.body.encrypted
    })

    it('应该解密数据', async () => {
      const response = await request(baseUrl)
        .post('/api/v2/encryption/decrypt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ encrypted: encryptedData })
        .expect(200)

      expect(response.body).toHaveProperty('decrypted', 'Test data')
    })

    it('无效密文应该返回 400', async () => {
      await request(baseUrl)
        .post('/api/v2/encryption/decrypt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ encrypted: 'invalid-encrypted-data' })
        .expect(400)
    })

    it('缺少密文应该返回 400', async () => {
      await request(baseUrl)
        .post('/api/v2/encryption/decrypt')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400)
    })
  })

  describe('POST /api/v2/encryption/hash', () => {
    it('应该生成哈希', async () => {
      const testData = 'Data to hash'
      
      const response = await request(baseUrl)
        .post('/api/v2/encryption/hash')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: testData })
        .expect(200)

      expect(response.body).toHaveProperty('hash')
      expect(response.body.hash.length).toBe(64) // SHA256 hex
    })

    it('相同数据应该生成不同哈希 (因为盐)', async () => {
      const testData = 'Same data'
      
      const response1 = await request(baseUrl)
        .post('/api/v2/encryption/hash')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: testData })
      
      const response2 = await request(baseUrl)
        .post('/api/v2/encryption/hash')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: testData })

      expect(response1.body.hash).not.toBe(response2.body.hash)
    })
  })

  describe('POST /api/v2/encryption/verify', () => {
    let hash

    beforeEach(async () => {
      const hashResponse = await request(baseUrl)
        .post('/api/v2/encryption/hash')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: 'Test data' })
      
      hash = hashResponse.body.hash
    })

    it('应该验证数据', async () => {
      const response = await request(baseUrl)
        .post('/api/v2/encryption/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: 'Test data', hash })
        .expect(200)

      expect(response.body).toHaveProperty('match', true)
    })

    it('错误数据应该验证失败', async () => {
      const response = await request(baseUrl)
        .post('/api/v2/encryption/verify')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ data: 'Wrong data', hash })
        .expect(200)

      expect(response.body).toHaveProperty('match', false)
    })
  })

  describe('GET /api/v2/encryption/config', () => {
    it('应该获取加密配置', async () => {
      const response = await request(baseUrl)
        .get('/api/v2/encryption/config')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200)

      expect(response.body).toHaveProperty('config')
      expect(response.body.config).toHaveProperty('algorithm', 'aes-256-gcm')
      expect(response.body.config).toHaveProperty('keyDerivation', 'pbkdf2')
      expect(response.body.config).toHaveProperty('iterations', 100000)
    })
  })
})
