/**
 * 加密工具 - v2.0.0
 * 敏感数据加密/解密
 */

import crypto from 'crypto'

const ALGORITHM = 'aes-256-gcm'
const IV_LENGTH = 16
const AUTH_TAG_LENGTH = 16
const SALT_LENGTH = 32
const ITERATIONS = 100000
const KEY_LENGTH = 32

/**
 * 从密码派生密钥
 */
export function deriveKey(password, salt) {
  return crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, 'sha256')
}

/**
 * 加密数据
 * @param {string} plainText - 明文
 * @param {string} password - 加密密码
 * @returns {string} Base64 编码的密文 (包含 salt + iv + authTag + encrypted)
 */
export function encrypt(plainText, password) {
  const salt = crypto.randomBytes(SALT_LENGTH)
  const iv = crypto.randomBytes(IV_LENGTH)
  const key = deriveKey(password, salt)
  
  const cipher = crypto.createCipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  })
  
  let encrypted = cipher.update(plainText, 'utf8', 'base64')
  encrypted += cipher.final('base64')
  
  const authTag = cipher.getAuthTag()
  
  // 组合：salt + iv + authTag + encrypted
  const combined = Buffer.concat([
    salt,
    iv,
    authTag,
    Buffer.from(encrypted, 'base64')
  ])
  
  return combined.toString('base64')
}

/**
 * 解密数据
 * @param {string} encryptedBase64 - Base64 编码的密文
 * @param {string} password - 解密密码
 * @returns {string} 明文
 */
export function decrypt(encryptedBase64, password) {
  const combined = Buffer.from(encryptedBase64, 'base64')
  
  // 提取各部分
  const salt = combined.subarray(0, SALT_LENGTH)
  const iv = combined.subarray(SALT_LENGTH, SALT_LENGTH + IV_LENGTH)
  const authTag = combined.subarray(
    SALT_LENGTH + IV_LENGTH,
    SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH
  )
  const encrypted = combined.subarray(SALT_LENGTH + IV_LENGTH + AUTH_TAG_LENGTH)
  
  // 派生密钥
  const key = deriveKey(password, salt)
  
  // 创建解密器
  const decipher = crypto.createDecipheriv(ALGORITHM, key, iv, {
    authTagLength: AUTH_TAG_LENGTH
  })
  decipher.setAuthTag(authTag)
  
  // 解密
  let decrypted = decipher.update(encrypted)
  decrypted = Buffer.concat([decrypted, decipher.final()])
  
  return decrypted.toString('utf8')
}

/**
 * 哈希数据 (单向)
 * @param {string} data - 输入数据
 * @param {string} salt - 盐值 (可选)
 * @returns {object} { hash, salt }
 */
export function hash(data, salt = null) {
  if (!salt) {
    salt = crypto.randomBytes(SALT_LENGTH).toString('hex')
  }
  
  const hash = crypto.pbkdf2Sync(data, salt, ITERATIONS, KEY_LENGTH * 2, 'sha512')
  
  return {
    hash: hash.toString('hex'),
    salt
  }
}

/**
 * 验证哈希
 * @param {string} data - 输入数据
 * @param {string} expectedHash - 期望的哈希值
 * @param {string} salt - 盐值
 * @returns {boolean} 是否匹配
 */
export function verifyHash(data, expectedHash, salt) {
  const result = hash(data, salt)
  return crypto.timingSafeEqual(
    Buffer.from(result.hash, 'hex'),
    Buffer.from(expectedHash, 'hex')
  )
}

/**
 * 生成安全随机令牌
 * @param {number} length - 令牌长度 (字节)
 * @returns {string} Hex 编码的令牌
 */
export function generateToken(length = 32) {
  return crypto.randomBytes(length).toString('hex')
}

/**
 * 加密敏感字段 (用于数据库存储)
 * @param {object} data - 数据对象
 * @param {string[]} fields - 需要加密的字段名
 * @param {string} password - 加密密码
 * @returns {object} 加密后的对象
 */
export function encryptFields(data, fields, password) {
  const encrypted = { ...data }
  
  for (const field of fields) {
    if (data[field] !== undefined && data[field] !== null) {
      encrypted[field] = encrypt(String(data[field]), password)
      encrypted[`${field}__encrypted`] = true
    }
  }
  
  return encrypted
}

/**
 * 解密敏感字段
 * @param {object} data - 数据对象
 * @param {string} password - 解密密码
 * @returns {object} 解密后的对象
 */
export function decryptFields(data, password) {
  const decrypted = { ...data }
  
  for (const [key, value] of Object.entries(data)) {
    if (key.endsWith('__encrypted') || typeof value !== 'string') {
      continue
    }
    
    // 检查是否有对应的加密标记
    if (data[`${key}__encrypted`]) {
      try {
        decrypted[key] = decrypt(value, password)
        delete decrypted[`${key}__encrypted`]
      } catch (err) {
        console.error(`[Encryption] Failed to decrypt field ${key}:`, err.message)
      }
    }
  }
  
  return decrypted
}

/**
 * 敏感数据配置
 */
export const SENSITIVE_FIELDS = {
  user: ['passwordHash', 'mfaSecret', 'email'],
  api: ['apiKey', 'apiSecret'],
  share: ['token'],
  comment: ['userEmail']
}

// 默认加密密钥 (生产环境应从环境变量读取)
export const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex')

/**
 * 使用环境变量密钥加密
 */
export function encryptWithEnvKey(plainText) {
  return encrypt(plainText, ENCRYPTION_KEY)
}

/**
 * 使用环境变量密钥解密
 */
export function decryptWithEnvKey(encryptedBase64) {
  return decrypt(encryptedBase64, ENCRYPTION_KEY)
}

export default {
  encrypt,
  decrypt,
  hash,
  verifyHash,
  generateToken,
  encryptFields,
  decryptFields,
  encryptWithEnvKey,
  decryptWithEnvKey,
  SENSITIVE_FIELDS,
  deriveKey
}
