/**
 * MFA/2FA 服务 - v2.0.0
 * 多因素认证支持 (TOTP)
 */

import crypto from 'crypto'

/**
 * TOTP 配置
 */
const TOTP_CONFIG = {
  period: 30,      // 30 秒有效期
  digits: 6,       // 6 位验证码
  algorithm: 'sha1',
  window: 1        // 允许前后 1 个时间窗口 (共 3 个)
}

/**
 * Base32 编码表
 */
const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'

/**
 * MFA 服务类
 */
class MFAService {
  /**
   * 生成 MFA 密钥
   */
  generateSecret() {
    const bytes = crypto.randomBytes(20)
    let secret = ''
    
    for (let i = 0; i < bytes.length; i++) {
      const byte = bytes[i]
      for (let j = 0; j < 8; j += 5) {
        const index = ((byte << j) & 0xFF) >> 3
        secret += BASE32_ALPHABET[Math.floor(index)]
      }
    }
    
    return secret.toUpperCase().replace(/=/g, '').substring(0, 32)
  }

  /**
   * 生成 TOTP 验证码
   */
  generateTOTP(secret, timestamp = Date.now()) {
    const period = Math.floor(timestamp / 1000 / TOTP_CONFIG.period)
    const counter = new ArrayBuffer(8)
    const view = new DataView(counter)
    
    for (let i = 7; i >= 0; i--) {
      view.setUint8(i, period & 0xFF)
      period >>>= 8
    }
    
    const hmac = crypto.createHmac(TOTP_CONFIG.algorithm, this._base32Decode(secret))
    hmac.update(Buffer.from(counter))
    const digest = hmac.digest()
    
    const offset = digest[digest.length - 1] & 0x0F
    const code = (
      ((digest[offset] & 0x7F) << 24) |
      ((digest[offset + 1] & 0xFF) << 16) |
      ((digest[offset + 2] & 0xFF) << 8) |
      (digest[offset + 3] & 0xFF)
    ) % Math.pow(10, TOTP_CONFIG.digits)
    
    return code.toString().padStart(TOTP_CONFIG.digits, '0')
  }

  /**
   * 验证 TOTP 验证码
   */
  verifyTOTP(secret, token, timestamp = Date.now()) {
    const currentPeriod = Math.floor(timestamp / 1000 / TOTP_CONFIG.period)
    
    // 检查当前时间窗口及前后各一个窗口
    for (let i = -TOTP_CONFIG.window; i <= TOTP_CONFIG.window; i++) {
      const expectedToken = this.generateTOTP(secret, (currentPeriod + i) * TOTP_CONFIG.period * 1000)
      if (token === expectedToken) {
        return {
          valid: true,
          delta: i
        }
      }
    }
    
    return { valid: false }
  }

  /**
   * 生成 QR Code 数据 URI
   */
  generateQRCodeDataURI(secret, issuer, accountName) {
    const label = encodeURIComponent(`${issuer}:${accountName}`)
    const secretParam = encodeURIComponent(secret)
    const issuerParam = encodeURIComponent(issuer)
    
    const otpauthUrl = `otpauth://totp/${label}?secret=${secretParam}&issuer=${issuerParam}&algorithm=${TOTP_CONFIG.algorithm}&digits=${TOTP_CONFIG.digits}&period=${TOTP_CONFIG.period}`
    
    // 使用 Google Chart API 生成 QR Code
    const qrCodeUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(otpauthUrl)}`
    
    return {
      otpauthUrl,
      qrCodeUrl
    }
  }

  /**
   * 启用 MFA
   */
  async enableMFA(userService, userId, secret) {
    const user = await userService.findById(userId)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    await userService.update(userId, {
      mfaEnabled: true,
      mfaSecret: secret
    }, userId)
    
    return { message: 'MFA 已启用' }
  }

  /**
   * 禁用 MFA
   */
  async disableMFA(userService, userId) {
    const user = await userService.findById(userId)
    if (!user) {
      throw new Error('用户不存在')
    }
    
    await userService.update(userId, {
      mfaEnabled: false,
      mfaSecret: null
    }, userId)
    
    return { message: 'MFA 已禁用' }
  }

  /**
   * 验证 MFA 登录
   */
  async verifyMFALogin(user, token) {
    if (!user.mfaEnabled) {
      return { valid: true, mfaRequired: false }
    }
    
    if (!user.mfaSecret) {
      return { valid: false, error: 'MFA 未配置' }
    }
    
    const result = this.verifyTOTP(user.mfaSecret, token)
    
    if (!result.valid) {
      return { valid: false, error: '验证码无效或已过期' }
    }
    
    return { valid: true, mfaRequired: true }
  }

  /**
   * Base32 解码
   */
  _base32Decode(secret) {
    // 移除空格和填充
    secret = secret.replace(/\s/g, '').replace(/=/g, '')
    
    let bits = ''
    for (const char of secret) {
      const index = BASE32_ALPHABET.indexOf(char.toUpperCase())
      if (index === -1) continue
      bits += index.toString(2).padStart(5, '0')
    }
    
    const bytes = []
    for (let i = 0; bits.length >= 8; i++) {
      bytes.push(parseInt(bits.substring(0, 8), 2))
      bits = bits.substring(8)
    }
    
    return Buffer.from(bytes)
  }

  /**
   * 生成备份代码
   */
  generateBackupCodes(count = 10) {
    const codes = []
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase()
      codes.push(`${code.substring(0, 4)}-${code.substring(4)}`)
    }
    return codes
  }
}

// 导出单例
export const mfaService = new MFAService()
export default mfaService
