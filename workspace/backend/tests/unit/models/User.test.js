/**
 * User 模型单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { User, UserService } from '../../../src/models/User.js'
import { generateUserData } from '../../utils/testUtils.js'

describe('User Model', () => {
  describe('constructor', () => {
    it('应该创建用户实例', () => {
      const userData = generateUserData()
      const user = new User(userData)

      expect(user).toBeInstanceOf(User)
      expect(user.email).toBe(userData.email)
      expect(user.username).toBe(userData.username)
      expect(user.role).toBe('viewer')
    })

    it('应该生成默认 ID', () => {
      const userData = generateUserData()
      const user = new User(userData)

      expect(user.id).toMatch(/^user-\w+$/)
    })

    it('应该使用提供的 ID', () => {
      const userData = generateUserData({ id: 'custom-id-123' })
      const user = new User(userData)

      expect(user.id).toBe('custom-id-123')
    })

    it('应该设置默认角色为 viewer', () => {
      const userData = generateUserData()
      const user = new User(userData)

      expect(user.role).toBe('viewer')
    })

    it('应该允许自定义角色', () => {
      const userData = generateUserData({ role: 'admin' })
      const user = new User(userData)

      expect(user.role).toBe('admin')
    })
  })

  describe('toSafeObject', () => {
    it('应该返回不含密码的对象', () => {
      const userData = generateUserData()
      const user = new User(userData)
      const safe = user.toSafeObject()

      expect(safe.email).toBe(userData.email)
      expect(safe.username).toBe(userData.username)
      expect(safe.passwordHash).toBeUndefined()
      expect(safe.mfaSecret).toBeUndefined()
    })

    it('应该包含基本用户信息', () => {
      const userData = generateUserData()
      const user = new User(userData)
      const safe = user.toSafeObject()

      expect(safe).toHaveProperty('id')
      expect(safe).toHaveProperty('email')
      expect(safe).toHaveProperty('username')
      expect(safe).toHaveProperty('role')
      expect(safe).toHaveProperty('status')
      expect(safe).toHaveProperty('createdAt')
    })
  })

  describe('isAdmin', () => {
    it('管理员应该返回 true', () => {
      const user = new User(generateUserData({ role: 'admin' }))
      expect(user.isAdmin()).toBe(true)
    })

    it('非管理员应该返回 false', () => {
      const user = new User(generateUserData({ role: 'viewer' }))
      expect(user.isAdmin()).toBe(false)
    })
  })

  describe('isActive', () => {
    it('活跃用户应该返回 true', () => {
      const user = new User(generateUserData({ status: 'active' }))
      expect(user.isActive()).toBe(true)
    })

    it('非活跃用户应该返回 false', () => {
      const user = new User(generateUserData({ status: 'inactive' }))
      expect(user.isActive()).toBe(false)
    })
  })
})

describe('UserService', () => {
  let service

  beforeEach(async () => {
    service = new UserService()
    await service.initialize()
  })

  describe('create', () => {
    it('应该创建新用户', async () => {
      const userData = generateUserData()
      const user = await service.create(userData)

      expect(user).toBeInstanceOf(User)
      expect(user.email).toBe(userData.email)
      expect(user.username).toBe(userData.username)
    })

    it('应该哈希密码', async () => {
      const userData = generateUserData()
      const user = await service.create(userData)

      expect(user.passwordHash).toBeDefined()
      expect(user.passwordHash).not.toBe(userData.password)
      expect(user.passwordHash.length).toBeGreaterThan(50)
    })

    it('重复邮箱应该抛出错误', async () => {
      const userData = generateUserData()
      await service.create(userData)

      await expect(service.create(userData))
        .rejects
        .toThrow('邮箱已存在')
    })
  })

  describe('findById', () => {
    it('应该通过 ID 查找用户', async () => {
      const userData = generateUserData()
      const created = await service.create(userData)
      const found = await service.findById(created.id)

      expect(found).toBeInstanceOf(User)
      expect(found.id).toBe(created.id)
      expect(found.email).toBe(created.email)
    })

    it('不存在的 ID 应该返回 null', async () => {
      const found = await service.findById('non-existent-id')
      expect(found).toBeNull()
    })
  })

  describe('findByEmail', () => {
    it('应该通过邮箱查找用户', async () => {
      const userData = generateUserData()
      const created = await service.create(userData)
      const found = await service.findByEmail(userData.email)

      expect(found).toBeInstanceOf(User)
      expect(found.email).toBe(userData.email)
    })

    it('不存在的邮箱应该返回 null', async () => {
      const found = await service.findByEmail('nonexistent@test.com')
      expect(found).toBeNull()
    })
  })

  describe('verifyPassword', () => {
    it('正确密码应该验证通过', async () => {
      const userData = generateUserData({ password: 'Test@123456' })
      const user = await service.create(userData)
      const valid = await User.verifyPassword('Test@123456', user.passwordHash)

      expect(valid).toBe(true)
    })

    it('错误密码应该验证失败', async () => {
      const userData = generateUserData({ password: 'Test@123456' })
      const user = await service.create(userData)
      const valid = await User.verifyPassword('Wrong@123456', user.passwordHash)

      expect(valid).toBe(false)
    })
  })

  describe('update', () => {
    it('应该更新用户信息', async () => {
      const userData = generateUserData()
      const user = await service.create(userData)
      
      const updated = await service.update(user.id, {
        name: 'Updated Name',
        status: 'inactive'
      })

      expect(updated.name).toBe('Updated Name')
      expect(updated.status).toBe('inactive')
      expect(updated.email).toBe(user.email) // 不变
    })

    it('不存在的 ID 应该抛出错误', async () => {
      await expect(service.update('non-existent-id', { name: 'Test' }))
        .rejects
        .toThrow('用户不存在')
    })
  })

  describe('delete', () => {
    it('应该删除用户', async () => {
      const userData = generateUserData()
      const user = await service.create(userData)
      
      await service.delete(user.id)
      
      const found = await service.findById(user.id)
      expect(found).toBeNull()
    })
  })

  describe('list', () => {
    it('应该返回用户列表', async () => {
      // 创建 3 个测试用户
      for (let i = 0; i < 3; i++) {
        await service.create(generateUserData())
      }

      const result = await service.list()
      expect(result.users.length).toBeGreaterThanOrEqual(3)
      expect(result.total).toBeGreaterThanOrEqual(3)
    })

    it('应该支持分页', async () => {
      const result = await service.list({ limit: 2, offset: 0 })
      expect(result.users.length).toBeLessThanOrEqual(2)
    })
  })
})
