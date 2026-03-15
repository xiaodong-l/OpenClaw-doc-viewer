/**
 * Notification Model - v2.0.0
 * 通知数据模型
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const NOTIFICATIONS_FILE = path.join(__dirname, '../../data/notifications.json')

/**
 * 通知类型
 */
export const NotificationType = {
  COMMENT: 'comment',
  MENTION: 'mention',
  SHARE: 'share',
  VERSION: 'version',
  LOCK: 'lock',
  PERMISSION: 'permission'
}

/**
 * 通知类
 */
export class Notification {
  constructor(data) {
    this.id = data.id || `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    this.userId = data.userId
    this.type = data.type
    this.title = data.title
    this.content = data.content
    this.link = data.link
    this.data = data.data || {}
    this.isRead = data.isRead || false
    this.readAt = data.readAt
    this.expiresAt = data.expiresAt
    this.createdAt = data.createdAt || new Date().toISOString()
  }

  /**
   * 标记为已读
   */
  markAsRead() {
    this.isRead = true
    this.readAt = new Date().toISOString()
  }

  /**
   * 检查是否过期
   */
  isExpired() {
    if (!this.expiresAt) return false
    return new Date(this.expiresAt) < new Date()
  }

  /**
   * 转换为安全对象
   */
  toSafeObject() {
    return {
      id: this.id,
      type: this.type,
      title: this.title,
      content: this.content,
      link: this.link,
      data: this.data,
      isRead: this.isRead,
      readAt: this.readAt,
      createdAt: this.createdAt,
      isExpired: this.isExpired()
    }
  }

  /**
   * 获取通知图标
   */
  getIcon() {
    const icons = {
      [NotificationType.COMMENT]: 'comment',
      [NotificationType.MENTION]: 'at',
      [NotificationType.SHARE]: 'share',
      [NotificationType.VERSION]: 'version',
      [NotificationType.LOCK]: 'lock',
      [NotificationType.PERMISSION]: 'key'
    }
    return icons[this.type] || 'bell'
  }

  /**
   * 获取通知优先级
   */
  getPriority() {
    const priorities = {
      [NotificationType.MENTION]: 'high',
      [NotificationType.PERMISSION]: 'high',
      [NotificationType.COMMENT]: 'normal',
      [NotificationType.SHARE]: 'normal',
      [NotificationType.VERSION]: 'low',
      [NotificationType.LOCK]: 'low'
    }
    return priorities[this.type] || 'normal'
  }
}

/**
 * 通知服务
 */
export class NotificationService {
  constructor() {
    this.data = {
      notifications: [],
      settings: [],
      emailLogs: []
    }
    this.initialized = false
  }

  /**
   * 初始化
   */
  async initialize() {
    if (this.initialized) return

    try {
      await fs.access(NOTIFICATIONS_FILE)
      const content = await fs.readFile(NOTIFICATIONS_FILE, 'utf-8')
      this.data = JSON.parse(content)
    } catch (err) {
      this.data = {
        notifications: [],
        settings: [],
        emailLogs: []
      }
      await this.save()
    }

    this.initialized = true
    await this.cleanupOldNotifications()
  }

  /**
   * 保存数据
   */
  async save() {
    await fs.writeFile(NOTIFICATIONS_FILE, JSON.stringify(this.data, null, 2), 'utf-8')
  }

  /**
   * 创建通知
   */
  async create(userId, type, title, content, link = null, data = {}, expiresAt = null) {
    await this.initialize()

    const notification = new Notification({
      userId,
      type,
      title,
      content,
      link,
      data,
      expiresAt
    })

    this.data.notifications.push(notification)
    await this.save()

    return notification
  }

  /**
   * 获取用户通知列表
   */
  async getUserNotifications(userId, options = {}) {
    await this.initialize()

    const {
      unread = false,
      type = null,
      limit = 50,
      offset = 0
    } = options

    let notifications = this.data.notifications.filter(n => n.userId === userId)

    if (unread) {
      notifications = notifications.filter(n => !n.isRead && !n.isExpired())
    }

    if (type) {
      notifications = notifications.filter(n => n.type === type)
    }

    // 过滤过期通知
    notifications = notifications.filter(n => !n.isExpired())

    // 排序 (最新的在前)
    notifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

    // 分页
    const paginated = notifications.slice(offset, offset + limit)

    return paginated.map(n => new Notification(n).toSafeObject())
  }

  /**
   * 获取未读通知数量
   */
  async getUnreadCount(userId) {
    await this.initialize()

    return this.data.notifications.filter(n =>
      n.userId === userId &&
      !n.isRead &&
      !n.isExpired()
    ).length
  }

  /**
   * 标记通知为已读
   */
  async markAsRead(notificationId, userId) {
    await this.initialize()

    const notification = this.data.notifications.find(n =>
      n.id === notificationId && n.userId === userId
    )

    if (!notification) {
      throw new Error('通知不存在')
    }

    notification.markAsRead()
    await this.save()

    return new Notification(notification).toSafeObject()
  }

  /**
   * 批量标记已读
   */
  async markAllAsRead(userId) {
    await this.initialize()

    const notifications = this.data.notifications.filter(n =>
      n.userId === userId && !n.isRead
    )

    for (const notification of notifications) {
      notification.markAsRead()
    }

    await this.save()

    return notifications.length
  }

  /**
   * 删除通知
   */
  async delete(notificationId, userId) {
    await this.initialize()

    const index = this.data.notifications.findIndex(n =>
      n.id === notificationId && n.userId === userId
    )

    if (index === -1) {
      throw new Error('通知不存在')
    }

    this.data.notifications.splice(index, 1)
    await this.save()
  }

  /**
   * 获取用户通知设置
   */
  async getSettings(userId) {
    await this.initialize()

    let settings = this.data.settings.find(s => s.userId === userId)

    if (!settings) {
      // 创建默认设置
      settings = {
        id: `settings-${userId}`,
        userId,
        emailComments: true,
        emailMentions: true,
        emailShares: true,
        emailVersions: false,
        inAppComments: true,
        inAppMentions: true,
        inAppShares: true,
        inAppVersions: true,
        digestEnabled: false,
        digestFrequency: 'daily',
        quietHoursStart: '22:00',
        quietHoursEnd: '08:00',
        updatedAt: new Date().toISOString()
      }

      this.data.settings.push(settings)
      await this.save()
    }

    return settings
  }

  /**
   * 更新通知设置
   */
  async updateSettings(userId, updates) {
    await this.initialize()

    let settings = this.data.settings.find(s => s.userId === userId)

    if (!settings) {
      settings = {
        id: `settings-${userId}`,
        userId,
        updatedAt: new Date().toISOString()
      }
      this.data.settings.push(settings)
    }

    // 更新字段
    Object.assign(settings, updates, {
      userId,
      id: settings.id,
      updatedAt: new Date().toISOString()
    })

    await this.save()

    return settings
  }

  /**
   * 发送评论通知
   */
  async notifyComment(documentPath, documentTitle, commentAuthor, targetUserId) {
    return this.create(
      targetUserId,
      NotificationType.COMMENT,
      `新评论：${documentTitle}`,
      `${commentAuthor} 在文档中发表了评论`,
      `/document?path=${encodeURIComponent(documentPath)}`,
      { documentPath, documentTitle, commentAuthor }
    )
  }

  /**
   * 发送 @提及通知
   */
  async notifyMention(mentionedBy, mentionedIn, targetUserId) {
    return this.create(
      targetUserId,
      NotificationType.MENTION,
      `你被 @提及了`,
      `${mentionedBy} 在 ${mentionedIn} 中提及了你`,
      null,
      { mentionedBy, mentionedIn }
    )
  }

  /**
   * 发送分享通知
   */
  async notifyShare(documentTitle, sharedBy, targetUserId) {
    return this.create(
      targetUserId,
      NotificationType.SHARE,
      `文档已分享：${documentTitle}`,
      `${sharedBy} 与你分享了文档`,
      null,
      { documentTitle, sharedBy }
    )
  }

  /**
   * 发送版本通知
   */
  async notifyVersion(documentPath, documentTitle, versionNumber, createdBy, targetUserId) {
    return this.create(
      targetUserId,
      NotificationType.VERSION,
      `版本更新：${documentTitle}`,
      `版本 ${versionNumber} 已创建`,
      `/document?path=${encodeURIComponent(documentPath)}&version=${versionNumber}`,
      { documentPath, documentTitle, versionNumber, createdBy }
    )
  }

  /**
   * 清理旧通知
   */
  async cleanupOldNotifications() {
    await this.initialize()

    const initialCount = this.data.notifications.length
    
    // 删除 90 天前的已读通知
    const ninetyDaysAgo = new Date()
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
    
    this.data.notifications = this.data.notifications.filter(n => {
      if (n.isRead) {
        const createdAt = new Date(n.createdAt)
        return createdAt > ninetyDaysAgo
      }
      return true
    })

    const removedCount = initialCount - this.data.notifications.length

    if (removedCount > 0) {
      await this.save()
    }

    return removedCount
  }

  /**
   * 记录邮件日志
   */
  async logEmail(recipient, subject, template, status = 'pending') {
    await this.initialize()

    const log = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      recipient,
      subject,
      template,
      status,
      createdAt: new Date().toISOString()
    }

    this.data.emailLogs.push(log)

    // 保留最近 1000 条日志
    if (this.data.emailLogs.length > 1000) {
      this.data.emailLogs = this.data.emailLogs.slice(-1000)
    }

    return log
  }

  /**
   * 更新邮件状态
   */
  async updateEmailStatus(emailId, status, errorMessage = null) {
    await this.initialize()

    const log = this.data.emailLogs.find(l => l.id === emailId)
    if (!log) return

    log.status = status
    if (errorMessage) log.errorMessage = errorMessage
    if (status === 'sent') log.sentAt = new Date().toISOString()

    await this.save()
  }

  /**
   * 检查是否在安静时段
   */
  isQuietHours(settings) {
    if (!settings.quietHoursStart || !settings.quietHoursEnd) return false

    const now = new Date()
    const currentTime = now.getHours() * 60 + now.getMinutes()
    
    const [startHour, startMin] = settings.quietHoursStart.split(':').map(Number)
    const [endHour, endMin] = settings.quietHoursEnd.split(':').map(Number)
    
    const startTime = startHour * 60 + startMin
    const endTime = endHour * 60 + endMin

    if (startTime > endTime) {
      // 跨夜时段 (如 22:00 - 08:00)
      return currentTime >= startTime || currentTime < endTime
    } else {
      return currentTime >= startTime && currentTime < endTime
    }
  }

  /**
   * 获取通知统计
   */
  async getStats(userId) {
    await this.initialize()

    const notifications = this.data.notifications.filter(n => n.userId === userId && !n.isExpired())
    const unread = notifications.filter(n => !n.isRead).length
    const total = notifications.length

    const byType = {}
    for (const type of Object.values(NotificationType)) {
      byType[type] = notifications.filter(n => n.type === type).length
    }

    return {
      total,
      unread,
      read: total - unread,
      byType
    }
  }
}

export default NotificationService
