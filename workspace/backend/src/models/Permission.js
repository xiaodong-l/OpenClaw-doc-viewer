/**
 * Permission Model - v2.0.0
 * 权限数据模型
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_FILE = path.join(__dirname, '../../data/permissions.json')

/**
 * 权限角色枚举
 */
const PermissionRole = {
  OWNER: 'owner',
  EDITOR: 'editor',
  VIEWER: 'viewer'
}

/**
 * 权限操作枚举
 */
const PermissionAction = {
  VIEW: 'view',
  EDIT: 'edit',
  MANAGE: 'manage',
  DELETE: 'delete'
}

/**
 * 权限类
 */
class Permission {
  constructor(data) {
    this.id = data.id || `perm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.documentPath = data.documentPath
    this.userId = data.userId
    this.role = data.role || PermissionRole.VIEWER
    this.grantedBy = data.grantedBy
    this.grantedAt = data.grantedAt || new Date().toISOString()
    this.expiresAt = data.expiresAt
  }

  /**
   * 检查是否过期
   */
  isExpired() {
    if (!this.expiresAt) return false
    return new Date(this.expiresAt) < new Date()
  }

  /**
   * 检查是否有指定操作权限
   */
  hasPermission(action) {
    if (this.isExpired()) return false

    const rolePermissions = {
      [PermissionRole.OWNER]: [PermissionAction.VIEW, PermissionAction.EDIT, PermissionAction.MANAGE, PermissionAction.DELETE],
      [PermissionRole.EDITOR]: [PermissionAction.VIEW, PermissionAction.EDIT],
      [PermissionRole.VIEWER]: [PermissionAction.VIEW]
    }

    return rolePermissions[this.role]?.includes(action) || false
  }

  /**
   * 转换为安全对象
   */
  toSafeObject() {
    return {
      id: this.id,
      documentPath: this.documentPath,
      userId: this.userId,
      role: this.role,
      grantedBy: this.grantedBy,
      grantedAt: this.grantedAt,
      expiresAt: this.expiresAt,
      isExpired: this.isExpired()
    }
  }

  /**
   * 更新权限
   */
  update(data, updatedBy) {
    if (data.role) this.role = data.role
    if (data.expiresAt !== undefined) this.expiresAt = data.expiresAt
    this.grantedBy = updatedBy
  }
}

/**
 * 权限服务 (JSON 文件存储 - 临时方案)
 */
class PermissionService {
  constructor() {
    this.data = {
      permissions: [],
      groups: [],
      groupMembers: [],
      groupPermissions: [],
      auditLogs: [],
      defaultPermissions: []
    }
    this.initialized = false
  }

  /**
   * 初始化加载数据
   */
  async initialize() {
    if (this.initialized) return

    try {
      await fs.access(DATA_FILE)
      const content = await fs.readFile(DATA_FILE, 'utf-8')
      this.data = JSON.parse(content)
    } catch (err) {
      // 文件不存在，创建初始数据
      this.data = {
        permissions: [],
        groups: [],
        groupMembers: [],
        groupPermissions: [],
        auditLogs: [],
        defaultPermissions: []
      }
      await this.save()
    }

    this.initialized = true
  }

  /**
   * 保存数据
   */
  async save() {
    await fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  /**
   * 获取文档权限列表
   */
  async findByDocument(documentPath) {
    await this.initialize()
    return this.data.permissions
      .filter(p => p.documentPath === documentPath && !this._isExpired(p))
      .map(p => new Permission(p).toSafeObject())
  }

  /**
   * 获取用户权限列表
   */
  async findByUser(userId) {
    await this.initialize()
    return this.data.permissions
      .filter(p => p.userId === userId && !this._isExpired(p))
      .map(p => new Permission(p).toSafeObject())
  }

  /**
   * 检查用户对文档的权限
   */
  async checkPermission(documentPath, userId, action) {
    await this.initialize()

    // 查找用户对该文档的权限
    const permission = this.data.permissions.find(p =>
      p.documentPath === documentPath &&
      p.userId === userId &&
      !this._isExpired(p)
    )

    if (!permission) return false

    const perm = new Permission(permission)
    return perm.hasPermission(action)
  }

  /**
   * 授予权限
   */
  async grant(documentPath, userId, role, grantedBy, expiresAt = null) {
    await this.initialize()

    // 检查是否已存在
    const existingIndex = this.data.permissions.findIndex(p =>
      p.documentPath === documentPath && p.userId === userId
    )

    if (existingIndex !== -1) {
      // 更新现有权限
      const oldPerm = this.data.permissions[existingIndex]
      this.data.permissions[existingIndex] = {
        ...oldPerm,
        role,
        grantedBy,
        expiresAt
      }

      // 记录审计日志
      await this._logAudit(documentPath, userId, 'update', oldPerm.role, role, grantedBy)
    } else {
      // 创建新权限
      const permission = new Permission({
        documentPath,
        userId,
        role,
        grantedBy,
        expiresAt
      })

      this.data.permissions.push(permission)

      // 记录审计日志
      await this._logAudit(documentPath, userId, 'grant', null, role, grantedBy)
    }

    await this.save()
  }

  /**
   * 撤销权限
   */
  async revoke(documentPath, userId, revokedBy) {
    await this.initialize()

    const index = this.data.permissions.findIndex(p =>
      p.documentPath === documentPath && p.userId === userId
    )

    if (index === -1) {
      throw new Error('权限不存在')
    }

    const oldRole = this.data.permissions[index].role
    this.data.permissions.splice(index, 1)

    // 记录审计日志
    await this._logAudit(documentPath, userId, 'revoke', oldRole, null, revokedBy)

    await this.save()
  }

  /**
   * 批量授予权限
   */
  async grantBatch(documentPath, permissions, grantedBy) {
    await this.initialize()

    for (const perm of permissions) {
      await this.grant(documentPath, perm.userId, perm.role, grantedBy, perm.expiresAt)
    }
  }

  /**
   * 获取权限统计
   */
  async getStats(documentPath) {
    await this.initialize()

    const perms = this.data.permissions.filter(p =>
      p.documentPath === documentPath && !this._isExpired(p)
    )

    const byRole = {
      owner: perms.filter(p => p.role === PermissionRole.OWNER).length,
      editor: perms.filter(p => p.role === PermissionRole.EDITOR).length,
      viewer: perms.filter(p => p.role === PermissionRole.VIEWER).length
    }

    const expiring = perms.filter(p => {
      if (!p.expiresAt) return false
      const expires = new Date(p.expiresAt)
      const now = new Date()
      const daysUntilExpiry = (expires - now) / (1000 * 60 * 60 * 24)
      return daysUntilExpiry <= 7 && daysUntilExpiry > 0
    }).length

    return {
      total: perms.length,
      byRole,
      expiringSoon: expiring
    }
  }

  /**
   * 清理过期权限
   */
  async cleanupExpired() {
    await this.initialize()

    const initialCount = this.data.permissions.length
    this.data.permissions = this.data.permissions.filter(p => !this._isExpired(p))
    const removedCount = initialCount - this.data.permissions.length

    if (removedCount > 0) {
      await this.save()
    }

    return removedCount
  }

  /**
   * 记录审计日志
   */
  async _logAudit(documentPath, userId, action, oldRole, newRole, changedBy, reason = null) {
    const log = {
      id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentPath,
      userId,
      action,
      oldRole,
      newRole,
      changedBy,
      changedAt: new Date().toISOString(),
      reason
    }

    this.data.auditLogs.push(log)

    // 保留最近 1000 条日志
    if (this.data.auditLogs.length > 1000) {
      this.data.auditLogs = this.data.auditLogs.slice(-1000)
    }
  }

  /**
   * 检查是否过期
   */
  _isExpired(permission) {
    if (!permission.expiresAt) return false
    return new Date(permission.expiresAt) < new Date()
  }

  /**
   * 获取审计日志
   */
  async getAuditLogs(documentPath = null, userId = null, limit = 100) {
    await this.initialize()

    let logs = this.data.auditLogs

    if (documentPath) {
      logs = logs.filter(l => l.documentPath === documentPath)
    }
    if (userId) {
      logs = logs.filter(l => l.userId === userId)
    }

    return logs.slice(-limit).reverse()
  }

  /**
   * 创建用户组
   */
  async createGroup(name, description, createdBy) {
    await this.initialize()

    const existing = this.data.groups.find(g => g.name === name)
    if (existing) {
      throw new Error('用户组名称已存在')
    }

    const group = {
      id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name,
      description,
      createdBy,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    this.data.groups.push(group)
    await this.save()

    return group
  }

  /**
   * 获取用户组列表
   */
  async getGroups() {
    await this.initialize()
    return this.data.groups
  }

  /**
   * 添加组成员
   */
  async addGroupMember(groupId, userId) {
    await this.initialize()

    const existing = this.data.groupMembers.find(m =>
      m.groupId === groupId && m.userId === userId
    )

    if (existing) {
      throw new Error('用户已在组中')
    }

    const member = {
      id: `member-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      groupId,
      userId,
      joinedAt: new Date().toISOString()
    }

    this.data.groupMembers.push(member)
    await this.save()
  }

  /**
   * 获取组成员列表
   */
  async getGroupMembers(groupId) {
    await this.initialize()
    return this.data.groupMembers
      .filter(m => m.groupId === groupId)
      .map(m => ({ userId: m.userId, joinedAt: m.joinedAt }))
  }

  /**
   * 授予组权限
   */
  async grantGroupPermission(documentPath, groupId, role, grantedBy, expiresAt = null) {
    await this.initialize()

    const existingIndex = this.data.groupPermissions.findIndex(p =>
      p.documentPath === documentPath && p.groupId === groupId
    )

    if (existingIndex !== -1) {
      this.data.groupPermissions[existingIndex] = {
        ...this.data.groupPermissions[existingIndex],
        role,
        grantedBy,
        expiresAt
      }
    } else {
      this.data.groupPermissions.push({
        id: `gperm-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        documentPath,
        groupId,
        role,
        grantedBy,
        grantedAt: new Date().toISOString(),
        expiresAt
      })
    }

    await this.save()
  }

  /**
   * 检查组成员对文档的权限
   */
  async checkGroupPermission(documentPath, userId, action) {
    await this.initialize()

    // 查找用户所在的所有组
    const userGroups = this.data.groupMembers
      .filter(m => m.userId === userId)
      .map(m => m.groupId)

    // 查找这些组对文档的权限
    const groupPerms = this.data.groupPermissions.filter(p =>
      userGroups.includes(p.groupId) &&
      p.documentPath === documentPath &&
      !this._isExpired(p)
    )

    if (groupPerms.length === 0) return false

    // 取最高权限
    const rolePriority = {
      [PermissionRole.OWNER]: 3,
      [PermissionRole.EDITOR]: 2,
      [PermissionRole.VIEWER]: 1
    }

    const highestRole = groupPerms.reduce((highest, p) =>
      rolePriority[p.role] > rolePriority[highest] ? p.role : highest
    , PermissionRole.VIEWER)

    const perm = new Permission({ role: highestRole })
    return perm.hasPermission(action)
  }
}

export {
  Permission,
  PermissionService,
  PermissionRole,
  PermissionAction
}
