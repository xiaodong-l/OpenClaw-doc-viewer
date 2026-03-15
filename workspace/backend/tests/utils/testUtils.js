/**
 * 测试工具函数
 */

import { faker } from '@faker-js/faker'

/**
 * 生成随机用户数据
 */
export function generateUserData(overrides = {}) {
  return {
    email: faker.internet.email(),
    username: faker.internet.userName(),
    password: 'Test@123456',
    name: faker.person.fullName(),
    role: 'viewer',
    ...overrides
  }
}

/**
 * 生成随机文档数据
 */
export function generateDocumentData(overrides = {}) {
  return {
    path: `/test/${faker.lorem.slug()}.md`,
    name: faker.lorem.words(3),
    title: faker.lorem.sentence(),
    content: faker.lorem.paragraphs(3),
    ...overrides
  }
}

/**
 * 生成 JWT Token
 */
export async function generateToken(app, user) {
  return app.jwt.sign({
    id: user.id || `user-${faker.string.uuid()}`,
    email: user.email,
    username: user.username,
    role: user.role || 'viewer'
  })
}

/**
 * 创建认证请求头
 */
export async function createAuthHeader(app, user) {
  const token = await generateToken(app, user)
  return {
    Authorization: `Bearer ${token}`
  }
}

/**
 * 延迟函数
 */
export function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * 清理测试数据
 */
export async function cleanupTestData(app) {
  // 清理测试用户
  // 清理测试文档
  // 清理测试权限
}

/**
 * 断言辅助函数
 */
export function assertResponse(response, expectedStatus, expectedShape = {}) {
  expect(response.status).toBe(expectedStatus)
  
  if (expectedShape) {
    const body = response.body
    for (const [key, value] of Object.entries(expectedShape)) {
      if (typeof value === 'function') {
        expect(body[key]).toEqual(expect.any(value))
      } else if (typeof value === 'object') {
        expect(body[key]).toMatchObject(value)
      } else {
        expect(body[key]).toBe(value)
      }
    }
  }
}

/**
 * 测试 API 端点
 */
export function testEndpoint(description, method, path, options = {}) {
  const {
    auth = true,
    status = 200,
    body = {},
    validate
  } = options

  it(description, async () => {
    const app = await getTestApp()
    const headers = auth ? await createAuthHeader(app, { email: 'test@test.com', role: 'admin' }) : {}
    
    const response = await app.inject({
      method,
      url: path,
      headers,
      payload: body
    })

    expect(response.statusCode).toBe(status)
    
    if (validate) {
      validate(JSON.parse(response.body))
    }
  })
}
