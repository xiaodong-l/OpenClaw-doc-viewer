/**
 * Email Service - v2.0.0
 * 邮件发送服务
 */

import NotificationService from '../models/Notification.js'

const notificationService = new NotificationService()

/**
 * 邮件配置
 */
const EMAIL_CONFIG = {
  from: process.env.EMAIL_FROM || 'noreply@doc-viewer.com',
  smtp: {
    host: process.env.SMTP_HOST || 'smtp.example.com',
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  }
}

/**
 * 邮件模板
 */
const EMAIL_TEMPLATES = {
  comment: {
    subject: (data) => `新评论：${data.documentTitle}`,
    html: (data) => `
      <h2>新评论通知</h2>
      <p><strong>${data.commentAuthor}</strong> 在文档 <strong>${data.documentTitle}</strong> 中发表了评论。</p>
      <p><a href="${data.link}">查看文档</a></p>
      <hr/>
      <p style="color: #999; font-size: 12px;">这是系统自动发送的邮件，请勿回复。</p>
    `
  },
  mention: {
    subject: () => `你被 @提及了`,
    html: (data) => `
      <h2>@提及通知</h2>
      <p><strong>${data.mentionedBy}</strong> 在 <strong>${data.mentionedIn}</strong> 中提及了你。</p>
      <p>请及时查看相关评论或文档。</p>
      <hr/>
      <p style="color: #999; font-size: 12px;">这是系统自动发送的邮件，请勿回复。</p>
    `
  },
  share: {
    subject: (data) => `文档分享：${data.documentTitle}`,
    html: (data) => `
      <h2>文档分享</h2>
      <p><strong>${data.sharedBy}</strong> 与你分享了文档 <strong>${data.documentTitle}</strong>。</p>
      <p><a href="${data.link}">查看文档</a></p>
      <hr/>
      <p style="color: #999; font-size: 12px;">这是系统自动发送的邮件，请勿回复。</p>
    `
  },
  version: {
    subject: (data) => `版本更新：${data.documentTitle}`,
    html: (data) => `
      <h2>版本更新</h2>
      <p>文档 <strong>${data.documentTitle}</strong> 已更新到版本 <strong>${data.versionNumber}</strong>。</p>
      <p><a href="${data.link}">查看新版本</a></p>
      <hr/>
      <p style="color: #999; font-size: 12px;">这是系统自动发送的邮件，请勿回复。</p>
    `
  },
  digest: {
    subject: (data) => `${data.period} 通知摘要`,
    html: (data) => `
      <h2>${data.period} 通知摘要</h2>
      <p>你有 ${data.unreadCount} 条未读通知。</p>
      <ul>
        ${data.notifications.map(n => `<li>${n.title}</li>`).join('')}
      </ul>
      <p><a href="${data.link}">查看全部通知</a></p>
      <hr/>
      <p style="color: #999; font-size: 12px;">这是系统自动发送的邮件，请勿回复。</p>
    `
  }
}

/**
 * 邮件服务类
 */
class EmailService {
  constructor() {
    this.initialized = false
    this.transporter = null
  }

  /**
   * 初始化邮件服务
   */
  async initialize() {
    if (this.initialized) return

    // 检查是否配置了 SMTP
    if (!EMAIL_CONFIG.smtp.auth.user || !EMAIL_CONFIG.smtp.auth.pass) {
      console.log('[EmailService] SMTP 未配置，邮件功能已禁用')
      this.initialized = true
      return
    }

    try {
      // 动态导入 nodemailer
      const nodemailer = (await import('nodemailer')).default
      
      this.transporter = nodemailer.createTransport(EMAIL_CONFIG.smtp)
      
      // 验证连接
      await this.transporter.verify()
      console.log('[EmailService] 邮件服务已初始化')
      
      this.initialized = true
    } catch (err) {
      console.error('[EmailService] 邮件服务初始化失败:', err.message)
      this.initialized = true // 即使失败也标记为已初始化，但发送会跳过
    }
  }

  /**
   * 发送邮件
   */
  async send(to, subject, html, template = 'custom') {
    await this.initialize()

    // 记录日志
    const log = await notificationService.logEmail(to, subject, template)

    // 如果未配置 SMTP，只记录日志
    if (!this.transporter) {
      console.log(`[EmailService] 模拟发送 (${template}): ${to} - ${subject}`)
      await notificationService.updateEmailStatus(log.id, 'sent')
      return { success: true, messageId: log.id, simulated: true }
    }

    try {
      const info = await this.transporter.sendMail({
        from: EMAIL_CONFIG.from,
        to,
        subject,
        html,
        headers: {
          'X-Priority': '3',
          'X-Mailer': 'OpenClaw Doc Viewer'
        }
      })

      await notificationService.updateEmailStatus(log.id, 'sent')
      console.log(`[EmailService] 邮件已发送：${info.messageId}`)

      return { success: true, messageId: info.messageId }
    } catch (err) {
      await notificationService.updateEmailStatus(log.id, 'failed', err.message)
      console.error('[EmailService] 邮件发送失败:', err.message)

      return { success: false, error: err.message }
    }
  }

  /**
   * 发送评论通知邮件
   */
  async sendCommentNotification(userEmail, data) {
    const template = EMAIL_TEMPLATES.comment
    return this.send(
      userEmail,
      template.subject(data),
      template.html(data),
      'comment'
    )
  }

  /**
   * 发送 @提及邮件
   */
  async sendMentionNotification(userEmail, data) {
    const template = EMAIL_TEMPLATES.mention
    return this.send(
      userEmail,
      template.subject(data),
      template.html(data),
      'mention'
    )
  }

  /**
   * 发送分享邮件
   */
  async sendShareNotification(userEmail, data) {
    const template = EMAIL_TEMPLATES.share
    return this.send(
      userEmail,
      template.subject(data),
      template.html(data),
      'share'
    )
  }

  /**
   * 发送版本更新邮件
   */
  async sendVersionNotification(userEmail, data) {
    const template = EMAIL_TEMPLATES.version
    return this.send(
      userEmail,
      template.subject(data),
      template.html(data),
      'version'
    )
  }

  /**
   * 发送摘要邮件
   */
  async sendDigestNotification(userEmail, data) {
    const template = EMAIL_TEMPLATES.digest
    return this.send(
      userEmail,
      template.subject(data),
      template.html(data),
      'digest'
    )
  }

  /**
   * 检查是否应该发送邮件
   */
  async shouldSendEmail(userId, notificationType, settings) {
    if (!settings) {
      settings = await notificationService.getSettings(userId)
    }

    // 检查用户设置
    const emailEnabled = {
      comment: settings.emailComments,
      mention: settings.emailMentions,
      share: settings.emailShares,
      version: settings.emailVersions
    }

    if (!emailEnabled[notificationType]) {
      return { shouldSend: false, reason: '用户禁用邮件通知' }
    }

    // 检查是否在安静时段
    if (notificationService.isQuietHours(settings)) {
      return { shouldSend: false, reason: '当前为安静时段' }
    }

    return { shouldSend: true }
  }
}

// 导出单例
export const emailService = new EmailService()
export default emailService
