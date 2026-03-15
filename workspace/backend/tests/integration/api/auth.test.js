/**
 * 认证 API 集成测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import request from 'supertest'
import { getTestApp } from '../../setup.js'
import { generateUserData } from '../../utils/testUtils.js'

describe('Auth API', () => {
  let app
  let server
  let baseUrl

  beforeEach(async () => {
    const testApp = await getTestApp()
    server = await testApp.listen({ port: 0, host: 'localhost' })
    const address = server.address()
    baseUrl = `http://${address.address}:${address.port}`
  })

  afterEach(async () => {
    if (server) {
      await server.close()
    }
  })

  describe('POST /api/v2/auth/register', () => {
    it('应该注册新用户', async () => {
      const userData = generateUserData()
      
      const response = await request(baseUrl)
        .post('/api/v2/auth/register')
        .send(userData)
        .expect(201)

      expect(response.body).toHaveProperty('message')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(userData.email)
      expect(response.body.user).not.toHaveProperty('passwordHash')
    })

    it('重复邮箱应该返回 409', async () => {
      const userData = generateUserData()
      
      await request(baseUrl)
        .post('/api/v2/auth/register')
        .send(userData)
        .expect(201)

      await request(baseUrl)
        .post('/api/v2/auth/register')
        .send(userData)
        .expect(409)
    })

    it('缺少邮箱应该返回 400', async () => {
      const userData = generateUserData()
      delete userData.email

      await request(baseUrl)
        .post('/api/v2/auth/register')
        .send(userData)
        .expect(400)
    })

    it('弱密码应该返回 400', async () => {
      const userData = generateUserData({ password: '123' })

      await request(baseUrl)
        .post('/api/v2/auth/register')
        .send(userData)
        .expect(400)
    })
  })

  describe('POST /api/v2/auth/login', () => {
    let testUser

    beforeEach(async () => {
      const userData = generateUserData({ password: 'Test@123456' })
      const response = await request(baseUrl)
        .post('/api/v2/auth/register')
        .send(userData)
      testUser = response.body.user
    })

    it('应该登录成功', async () => {
      const response = await request(baseUrl)
        .post('/api/v2/auth/login')
        .send({
          email: testUser.email,
          password: 'Test@123456'
        })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
      expect(response.body).toHaveProperty('user')
      expect(response.body.user.email).toBe(testUser.email)
    })

    it('错误密码应该返回 401', async () => {
      await request(baseUrl)
        .post('/api/v2/auth/login')
        .send({
          email: testUser.email,
          password: 'Wrong@123456'
        })
        .expect(401)
    })

    it('不存在的邮箱应该返回 401', async () => {
      await request(baseUrl)
        .post('/api/v2/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'Test@123456'
        })
        .expect(401)
    })
  })

  describe('GET /api/v2/auth/me', () => {
    let token

    beforeEach(async () => {
      const userData = generateUserData({ password: 'Test@123456' })
      await request(baseUrl).post('/api/v2/auth/register').send(userData)
      
      const loginResponse = await request(baseUrl)
        .post('/api/v2/auth/login')
        .send({ email: userData.email, password: 'Test@123456' })
      
      token = loginResponse.body.token
    })

    it('应该获取当前用户信息', async () => {
      const response = await request(baseUrl)
        .get('/api/v2/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)

      expect(response.body).toHaveProperty('user')
      expect(response.body.user).not.toHaveProperty('passwordHash')
    })

    it('未授权应该返回 401', async () => {
      await request(baseUrl)
        .get('/api/v2/auth/me')
        .expect(401)
    })

    it('无效 token 应该返回 401', async () => {
      await request(baseUrl)
        .get('/api/v2/auth/me')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401)
    })
  })

  describe('POST /api/v2/auth/refresh', () => {
    let refreshToken

    beforeEach(async () => {
      const userData = generateUserData({ password: 'Test@123456' })
      await request(baseUrl).post('/api/v2/auth/register').send(userData)
      
      const loginResponse = await request(baseUrl)
        .post('/api/v2/auth/login')
        .send({ email: userData.email, password: 'Test@123456' })
      
      refreshToken = loginResponse.body.refreshToken
    })

    it('应该刷新 token', async () => {
      const response = await request(baseUrl)
        .post('/api/v2/auth/refresh')
        .send({ refreshToken })
        .expect(200)

      expect(response.body).toHaveProperty('token')
      expect(response.body).toHaveProperty('refreshToken')
    })

    it('无效 refreshToken 应该返回 401', async () => {
      await request(baseUrl)
        .post('/api/v2/auth/refresh')
        .send({ refreshToken: 'invalid-refresh-token' })
        .expect(401)
    })
  })

  describe('POST /api/v2/auth/logout', () => {
    let token

    beforeEach(async () => {
      const userData = generateUserData({ password: 'Test@123456' })
      await request(baseUrl).post('/api/v2/auth/register').send(userData)
      
      const loginResponse = await request(baseUrl)
        .post('/api/v2/auth/login')
        .send({ email: userData.email, password: 'Test@123456' })
      
      token = loginResponse.body.token
    })

    it('应该登出成功', async () => {
      await request(baseUrl)
        .post('/api/v2/auth/logout')
        .set('Authorization', `Bearer ${token}`)
        .expect(200)
    })
  })
})
