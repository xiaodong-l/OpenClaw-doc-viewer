/**
 * DocumentVersion Model - v2.0.0
 * 文档版本数据模型
 */

import crypto from 'crypto'
import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const VERSIONS_FILE = path.join(__dirname, '../../data/versions.json')
const SNAPSHOTS_DIR = path.join(__dirname, '../../data/version-snapshots')

/**
 * 版本变更类型
 */
export const ChangeType = {
  CREATE: 'create',
  UPDATE: 'update',
  RESTORE: 'restore',
  RENAME: 'rename',
  DELETE: 'delete'
}

/**
 * 文档版本类
 */
export class DocumentVersion {
  constructor(data) {
    this.id = data.id || `ver-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`
    this.documentPath = data.documentPath
    this.versionNumber = data.versionNumber || 1
    this.contentHash = data.contentHash
    this.contentSnapshotPath = data.contentSnapshotPath
    this.contentPreview = data.contentPreview
    this.changeSummary = data.changeSummary
    this.changeType = data.changeType || ChangeType.UPDATE
    this.createdBy = data.createdBy
    this.createdAt = data.createdAt || new Date().toISOString()
  }

  /**
   * 生成内容哈希
   */
  static generateHash(content) {
    return crypto.createHash('sha256').update(content).digest('hex')
  }

  /**
   * 生成内容预览 (前 500 字符)
   */
  static generatePreview(content, maxLength = 500) {
    if (!content) return ''
    const text = content.replace(/[#*`]/g, '').trim()
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text
  }

  /**
   * 转换为安全对象
   */
  toSafeObject() {
    return {
      id: this.id,
      documentPath: this.documentPath,
      versionNumber: this.versionNumber,
      contentHash: this.contentHash,
      contentPreview: this.contentPreview,
      changeSummary: this.changeSummary,
      changeType: this.changeType,
      createdBy: this.createdBy,
      createdAt: this.createdAt,
      hasSnapshot: !!this.contentSnapshotPath
    }
  }
}

/**
 * 版本服务
 */
export class VersionService {
  constructor() {
    this.data = {
      versions: [],
      locks: [],
      diffs: [],
      activityLogs: []
    }
    this.initialized = false
  }

  /**
   * 初始化
   */
  async initialize() {
    if (this.initialized) return

    try {
      await fs.mkdir(SNAPSHOTS_DIR, { recursive: true })
      
      await fs.access(VERSIONS_FILE)
      const content = await fs.readFile(VERSIONS_FILE, 'utf-8')
      this.data = JSON.parse(content)
    } catch (err) {
      this.data = {
        versions: [],
        locks: [],
        diffs: [],
        activityLogs: []
      }
      await this.save()
    }

    this.initialized = true
    await this.cleanupExpiredLocks()
  }

  /**
   * 保存数据
   */
  async save() {
    await fs.writeFile(VERSIONS_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  /**
   * 创建新版本
   */
  async createVersion(documentPath, content, createdBy, changeSummary = '', changeType = ChangeType.UPDATE) {
    await this.initialize()

    // 获取当前最大版本号
    const docVersions = this.data.versions.filter(v => v.documentPath === documentPath)
    const maxVersion = docVersions.reduce((max, v) => Math.max(max, v.versionNumber), 0)
    const newVersionNumber = maxVersion + 1

    // 生成哈希和预览
    const contentHash = DocumentVersion.generateHash(content)
    
    // 检查内容是否变化
    const lastVersion = docVersions.find(v => v.versionNumber === maxVersion)
    if (lastVersion && lastVersion.contentHash === contentHash && changeType !== ChangeType.RESTORE) {
      // 内容无变化，返回现有版本
      return new DocumentVersion(lastVersion)
    }

    // 保存内容快照
    const snapshotFilename = `${crypto.randomBytes(8).toString('hex')}.md`
    const snapshotPath = path.join(SNAPSHOTS_DIR, snapshotFilename)
    await fs.writeFile(snapshotPath, content, 'utf-8')

    // 创建版本
    const version = new DocumentVersion({
      documentPath,
      versionNumber: newVersionNumber,
      contentHash,
      contentSnapshotPath: snapshotPath,
      contentPreview: DocumentVersion.generatePreview(content),
      changeSummary,
      changeType,
      createdBy
    })

    this.data.versions.push(version)
    await this.save()

    // 记录活动日志
    await this.logActivity(documentPath, createdBy, 'version_create', {
      versionNumber: newVersionNumber,
      changeSummary
    })

    return version
  }

  /**
   * 获取文档版本历史
   */
  async getVersions(documentPath, limit = 50) {
    await this.initialize()

    const versions = this.data.versions
      .filter(v => v.documentPath === documentPath)
      .sort((a, b) => b.versionNumber - a.versionNumber)
      .slice(0, limit)

    return versions.map(v => new DocumentVersion(v).toSafeObject())
  }

  /**
   * 获取特定版本
   */
  async getVersion(versionId) {
    await this.initialize()

    const version = this.data.versions.find(v => v.id === versionId)
    if (!version) return null

    return new DocumentVersion(version)
  }

  /**
   * 获取版本内容
   */
  async getVersionContent(versionId) {
    await this.initialize()

    const version = await this.getVersion(versionId)
    if (!version || !version.contentSnapshotPath) return null

    try {
      const content = await fs.readFile(version.contentSnapshotPath, 'utf-8')
      return content
    } catch (err) {
      return null
    }
  }

  /**
   * 获取最新版本号
   */
  async getLatestVersionNumber(documentPath) {
    await this.initialize()

    const versions = this.data.versions.filter(v => v.documentPath === documentPath)
    if (versions.length === 0) return 0

    return Math.max(...versions.map(v => v.versionNumber))
  }

  /**
   * 版本对比
   */
  async diffVersions(fromVersionId, toVersionId) {
    await this.initialize()

    // 检查缓存
    const cached = this.data.diffs.find(d => 
      (d.fromVersionId === fromVersionId && d.toVersionId === toVersionId) ||
      (d.fromVersionId === toVersionId && d.toVersionId === fromVersionId)
    )

    if (cached) {
      return cached.diffJson
    }

    // 获取内容
    const fromContent = await this.getVersionContent(fromVersionId)
    const toContent = await this.getVersionContent(toVersionId)

    if (!fromContent || !toContent) {
      throw new Error('无法获取版本内容')
    }

    // 简单对比 (生产环境应使用 diff 库)
    const diff = this._computeDiff(fromContent, toContent)

    // 缓存结果
    this.data.diffs.push({
      id: `diff-${Date.now()}`,
      fromVersionId,
      toVersionId,
      diffJson: diff,
      createdAt: new Date().toISOString()
    })

    // 保留最近 100 个对比结果
    if (this.data.diffs.length > 100) {
      this.data.diffs = this.data.diffs.slice(-100)
    }

    await this.save()

    return diff
  }

  /**
   * 简单差异计算
   */
  _computeDiff(oldContent, newContent) {
    const oldLines = oldContent.split('\n')
    const newLines = newContent.split('\n')
    
    const added = []
    const removed = []
    const unchanged = []

    let i = 0, j = 0
    while (i < oldLines.length || j < newLines.length) {
      if (i >= oldLines.length) {
        added.push({ line: j + 1, content: newLines[j] })
        j++
      } else if (j >= newLines.length) {
        removed.push({ line: i + 1, content: oldLines[i] })
        i++
      } else if (oldLines[i] === newLines[j]) {
        unchanged.push({ line: i + 1, content: oldLines[i] })
        i++
        j++
      } else {
        removed.push({ line: i + 1, content: oldLines[i] })
        added.push({ line: j + 1, content: newLines[j] })
        i++
        j++
      }
    }

    return {
      added,
      removed,
      unchanged,
      stats: {
        addedLines: added.length,
        removedLines: removed.length,
        unchangedLines: unchanged.length
      }
    }
  }

  /**
   * 回滚到指定版本
   */
  async rollbackToVersion(versionId, rolledBackBy) {
    await this.initialize()

    const version = await this.getVersion(versionId)
    if (!version) {
      throw new Error('版本不存在')
    }

    const content = await this.getVersionContent(versionId)
    if (!content) {
      throw new Error('版本内容不存在')
    }

    // 创建新版本 (restore 类型)
    const newVersion = await this.createVersion(
      version.documentPath,
      content,
      rolledBackBy,
      `回滚到版本 ${version.versionNumber}`,
      ChangeType.RESTORE
    )

    // 记录活动日志
    await this.logActivity(version.documentPath, rolledBackBy, 'version_restore', {
      fromVersion: version.versionNumber,
      toVersion: newVersion.versionNumber
    })

    return newVersion
  }

  /**
   * 锁定文档
   */
  async lockDocument(documentPath, lockedBy, reason = '', duration = 3600) {
    await this.initialize()

    // 检查是否已有锁
    const existingLock = this.data.locks.find(l => 
      l.documentPath === documentPath && !this._isLockExpired(l)
    )

    if (existingLock) {
      throw new Error('文档已被锁定')
    }

    const expiresAt = new Date(Date.now() + duration * 1000).toISOString()

    const lock = {
      id: `lock-${Date.now()}`,
      documentPath,
      lockedBy,
      lockedAt: new Date().toISOString(),
      expiresAt,
      reason,
      autoExpire: true
    }

    this.data.locks.push(lock)
    await this.save()

    // 记录活动日志
    await this.logActivity(documentPath, lockedBy, 'lock', { reason, expiresAt })

    return lock
  }

  /**
   * 解锁文档
   */
  async unlockDocument(documentPath, unlockedBy) {
    await this.initialize()

    const index = this.data.locks.findIndex(l => 
      l.documentPath === documentPath && !this._isLockExpired(l)
    )

    if (index === -1) {
      throw new Error('文档未锁定')
    }

    const lock = this.data.locks[index]
    
    // 只有锁定者或管理员可以解锁
    if (lock.lockedBy !== unlockedBy) {
      // 这里应该检查是否为管理员，简化处理
      // 实际应该从 userService 获取用户角色
    }

    this.data.locks.splice(index, 1)
    await this.save()

    // 记录活动日志
    await this.logActivity(documentPath, unlockedBy, 'unlock', {})

    return true
  }

  /**
   * 获取文档锁定状态
   */
  async getLockStatus(documentPath) {
    await this.initialize()

    const lock = this.data.locks.find(l => 
      l.documentPath === documentPath && !this._isLockExpired(l)
    )

    if (!lock) {
      return { locked: false }
    }

    return {
      locked: true,
      lockedBy: lock.lockedBy,
      lockedAt: lock.lockedAt,
      expiresAt: lock.expiresAt,
      reason: lock.reason
    }
  }

  /**
   * 检查文档是否可编辑
   */
  async canEdit(documentPath, userId) {
    await this.initialize()

    const lockStatus = await this.getLockStatus(documentPath)
    
    if (!lockStatus.locked) {
      return { canEdit: true }
    }

    if (lockStatus.lockedBy === userId) {
      return { canEdit: true }
    }

    return {
      canEdit: false,
      reason: '文档已被其他用户锁定',
      lockedBy: lockStatus.lockedBy,
      expiresAt: lockStatus.expiresAt
    }
  }

  /**
   * 清理过期锁
   */
  async cleanupExpiredLocks() {
    await this.initialize()

    const initialCount = this.data.locks.length
    this.data.locks = this.data.locks.filter(l => !this._isLockExpired(l))
    const removedCount = initialCount - this.data.locks.length

    if (removedCount > 0) {
      await this.save()
    }

    return removedCount
  }

  /**
   * 检查锁是否过期
   */
  _isLockExpired(lock) {
    if (!lock.expiresAt) return false
    return new Date(lock.expiresAt) < new Date()
  }

  /**
   * 记录活动日志
   */
  async logActivity(documentPath, userId, action, details = {}, ip = null, userAgent = null) {
    const log = {
      id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      documentPath,
      userId,
      action,
      details,
      ip,
      userAgent,
      createdAt: new Date().toISOString()
    }

    this.data.activityLogs.push(log)

    // 保留最近 1000 条日志
    if (this.data.activityLogs.length > 1000) {
      this.data.activityLogs = this.data.activityLogs.slice(-1000)
    }
  }

  /**
   * 获取活动日志
   */
  async getActivityLogs(documentPath = null, limit = 100) {
    await this.initialize()

    let logs = this.data.activityLogs

    if (documentPath) {
      logs = logs.filter(l => l.documentPath === documentPath)
    }

    return logs.slice(-limit).reverse()
  }

  /**
   * 删除旧版本 (保留最近 N 个)
   */
  async pruneOldVersions(documentPath, keepCount = 10) {
    await this.initialize()

    const versions = this.data.versions
      .filter(v => v.documentPath === documentPath)
      .sort((a, b) => b.versionNumber - a.versionNumber)

    if (versions.length <= keepCount) {
      return 0
    }

    const toDelete = versions.slice(keepCount)
    
    // 删除快照文件
    for (const version of toDelete) {
      if (version.contentSnapshotPath) {
        try {
          await fs.unlink(version.contentSnapshotPath)
        } catch (err) {
          // 文件可能已不存在
        }
      }
    }

    // 从数据中移除
    const versionIds = new Set(toDelete.map(v => v.id))
    this.data.versions = this.data.versions.filter(v => !versionIds.has(v.id))

    await this.save()

    return toDelete.length
  }
}

export default VersionService
