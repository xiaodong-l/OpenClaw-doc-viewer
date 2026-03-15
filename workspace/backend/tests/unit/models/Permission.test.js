/**
 * Permission 模型单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import { Permission, PermissionService, Role, Action } from '../../../src/models/Permission.js'

describe('Permission Model', () => {
  describe('constructor', () => {
    it('应该创建权限实例', () => {
      const permData = {
        resourceType: 'document',
        resourceId: 'doc-123',
        role: Role.EDITOR,
        actions: [Action.VIEW, Action.EDIT]
      }
      const perm = new Permission(permData)

      expect(perm).toBeInstanceOf(Permission)
      expect(perm.resourceType).toBe('document')
      expect(perm.resourceId).toBe('doc-123')
      expect(perm.role).toBe('editor')
    })

    it('应该生成默认 ID', () => {
      const permData = {
        resourceType: 'document',
        resourceId: 'doc-123',
        role: Role.VIEWER
      }
      const perm = new Permission(permData)

      expect(perm.id).toMatch(/^perm-\w+$/)
    })

    it('应该接受默认 actions', () => {
      const permData = {
        resourceType: 'document',
        resourceId: 'doc-123',
        role: Role.VIEWER
      }
      const perm = new Permission(permData)

      expect(perm.actions).toEqual([Action.VIEW])
    })
  })

  describe('hasAction', () => {
    it('应该检查是否包含指定操作', () => {
      const perm = new Permission({
        resourceType: 'document',
        resourceId: 'doc-123',
        role: Role.EDITOR,
        actions: [Action.VIEW, Action.EDIT]
      })

      expect(perm.hasAction(Action.VIEW)).toBe(true)
      expect(perm.hasAction(Action.EDIT)).toBe(true)
      expect(perm.hasAction(Action.DELETE)).toBe(false)
    })
  })

  describe('addAction', () => {
    it('应该添加操作', () => {
      const perm = new Permission({
        resourceType: 'document',
        resourceId: 'doc-123',
        role: Role.VIEWER,
        actions: [Action.VIEW]
      })

      perm.addAction(Action.COMMENT)
      expect(perm.hasAction(Action.COMMENT)).toBe(true)
    })

    it('不应该添加重复操作', () => {
      const perm = new Permission({
        resourceType: 'document',
        resourceId: 'doc-123',
        role: Role.VIEWER,
        actions: [Action.VIEW]
      })

      perm.addAction(Action.VIEW)
      expect(perm.actions.length).toBe(1)
    })
  })

  describe('removeAction', () => {
    it('应该移除操作', () => {
      const perm = new Permission({
        resourceType: 'document',
        resourceId: 'doc-123',
        role: Role.EDITOR,
        actions: [Action.VIEW, Action.EDIT, Action.DELETE]
      })

      perm.removeAction(Action.DELETE)
      expect(perm.hasAction(Action.DELETE)).toBe(false)
      expect(perm.hasAction(Action.VIEW)).toBe(true)
    })
  })

  describe('toSafeObject', () => {
    it('应该返回安全对象', () => {
      const perm = new Permission({
        resourceType: 'document',
        resourceId: 'doc-123',
        role: Role.EDITOR,
        actions: [Action.VIEW, Action.EDIT]
      })

      const safe = perm.toSafeObject()

      expect(safe.id).toBe(perm.id)
      expect(safe.resourceType).toBe('document')
      expect(safe.resourceId).toBe('doc-123')
      expect(safe.role).toBe('editor')
      expect(safe.actions).toEqual([Action.VIEW, Action.EDIT])
    })
  })
})

describe('PermissionService', () => {
  let service

  beforeEach(async () => {
    service = new PermissionService()
    await service.initialize()
  })

  describe('grant', () => {
    it('应该授予权限', async () => {
      const perm = await service.grant({
        userId: 'user-123',
        resourceType: 'document',
        resourceId: 'doc-456',
        role: Role.EDITOR
      })

      expect(perm).toBeInstanceOf(Permission)
      expect(perm.userId).toBe('user-123')
      expect(perm.resourceType).toBe('document')
      expect(perm.resourceId).toBe('doc-456')
      expect(perm.role).toBe('editor')
    })

    it('相同资源应该更新现有权限', async () => {
      await service.grant({
        userId: 'user-123',
        resourceType: 'document',
        resourceId: 'doc-456',
        role: Role.VIEWER
      })

      const updated = await service.grant({
        userId: 'user-123',
        resourceType: 'document',
        resourceId: 'doc-456',
        role: Role.EDITOR
      })

      expect(updated.role).toBe('editor')
    })
  })

  describe('revoke', () => {
    it('应该撤销权限', async () => {
      const perm = await service.grant({
        userId: 'user-123',
        resourceType: 'document',
        resourceId: 'doc-456',
        role: Role.EDITOR
      })

      await service.revoke(perm.id)
      const found = await service.findById(perm.id)
      expect(found).toBeNull()
    })
  })

  describe('getUserPermissions', () => {
    it('应该获取用户权限列表', async () => {
      await service.grant({
        userId: 'user-123',
        resourceType: 'document',
        resourceId: 'doc-456',
        role: Role.EDITOR
      })

      const perms = await service.getUserPermissions('user-123')
      expect(perms.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('getResourcePermissions', () => {
    it('应该获取资源权限列表', async () => {
      await service.grant({
        userId: 'user-123',
        resourceType: 'document',
        resourceId: 'doc-456',
        role: Role.EDITOR
      })

      const perms = await service.getResourcePermissions('document', 'doc-456')
      expect(perms.length).toBeGreaterThanOrEqual(1)
    })
  })

  describe('canAccess', () => {
    it('应该检查用户是否可以访问资源', async () => {
      await service.grant({
        userId: 'user-123',
        resourceType: 'document',
        resourceId: 'doc-456',
        role: Role.EDITOR,
        actions: [Action.VIEW, Action.EDIT]
      })

      const canView = await service.canAccess('user-123', 'document', 'doc-456', Action.VIEW)
      const canDelete = await service.canAccess('user-123', 'document', 'doc-456', Action.DELETE)

      expect(canView).toBe(true)
      expect(canDelete).toBe(false)
    })
  })
})

describe('Role Enum', () => {
  it('应该包含所有角色', () => {
    expect(Role).toEqual({
      OWNER: 'owner',
      ADMIN: 'admin',
      EDITOR: 'editor',
      VIEWER: 'viewer'
    })
  })
})

describe('Action Enum', () => {
  it('应该包含所有操作', () => {
    expect(Action).toEqual({
      VIEW: 'view',
      EDIT: 'edit',
      DELETE: 'delete',
      SHARE: 'share',
      COMMENT: 'comment',
      MANAGE_PERMISSIONS: 'manage_permissions'
    })
  })
})
