/**
 * Encryption 服务单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as encryption from '../../../src/utils/encryption.js'

/**
 * Encryption 服务单元测试
 */

import { describe, it, expect, beforeEach } from 'vitest'
import * as encryption from '../../../src/utils/encryption.js'

describe('Encryption Utils', () => {
  describe('encrypt/decrypt', () => {
    it('应该加密并正确解密数据', () => {
      const plaintext = 'Hello, World!'
      const password = 'test-password'
      const encrypted = encryption.encrypt(plaintext, password)
      const decrypted = encryption.decrypt(encrypted, password)

      expect(decrypted).toBe(plaintext)
    })

    it('相同明文应该生成不同密文', () => {
      const plaintext = 'Test data'
      const password = 'test-password'
      const encrypted1 = encryption.encrypt(plaintext, password)
      const encrypted2 = encryption.encrypt(plaintext, password)

      expect(encrypted1).not.toBe(encrypted2)
    })

    it('应该处理空字符串', () => {
      const plaintext = ''
      const password = 'test-password'
      const encrypted = encryption.encrypt(plaintext, password)
      const decrypted = encryption.decrypt(encrypted, password)

      expect(decrypted).toBe('')
    })

    it('应该处理长文本', () => {
      const plaintext = 'A'.repeat(1000)
      const password = 'test-password'
      const encrypted = encryption.encrypt(plaintext, password)
      const decrypted = encryption.decrypt(encrypted, password)

      expect(decrypted).toBe(plaintext)
    })

    it('应该处理特殊字符', () => {
      const plaintext = '特殊字符！@#$%^&*()_+-=[]{}|;:\'",.<>?/`~🚀'
      const password = 'test-password'
      const encrypted = encryption.encrypt(plaintext, password)
      const decrypted = encryption.decrypt(encrypted, password)

      expect(decrypted).toBe(plaintext)
    })
  })

  describe('hash/verify', () => {
    it('应该生成哈希并验证', () => {
      const data = 'sensitive-data'
      const hash = encryption.hash(data)
      const valid = encryption.verify(data, hash)

      expect(valid).toBe(true)
    })

    it('错误数据应该验证失败', () => {
      const data = 'sensitive-data'
      const hash = encryption.hash(data)
      const valid = encryption.verify('wrong-data', hash)

      expect(valid).toBe(false)
    })

    it('相同数据应该生成不同哈希', () => {
      const data = 'test-data'
      const hash1 = encryption.hash(data)
      const hash2 = encryption.hash(data)

      expect(hash1).not.toBe(hash2)
      expect(hash1.length).toBe(64) // SHA256 hex
    })
  })

  describe('generateToken', () => {
    it('应该生成随机 token', () => {
      const token1 = encryption.generateToken()
      const token2 = encryption.generateToken()

      expect(token1).toBeDefined()
      expect(token2).toBeDefined()
      expect(token1).not.toBe(token2)
      expect(token1.length).toBe(64)
    })

    it('应该支持自定义长度', () => {
      const token = encryption.generateToken(32)
      // hex 编码后长度翻倍
      expect(token.length).toBe(64)
    })

    it('应该生成 16 字节 token', () => {
      const token = encryption.generateToken(16)
      expect(token.length).toBe(32) // 16 bytes * 2 = 32 hex chars
    })
  })

  describe('deriveKey', () => {
    it('应该使用 PBKDF2 派生密钥', () => {
      const password = 'test-password'
      const salt = Buffer.alloc(32, 1)
      const key = encryption.deriveKey(password, salt)

      expect(key).toBeDefined()
      expect(key.length).toBe(32)
    })

    it('应该使用不同盐生成不同密钥', () => {
      const password = 'test-password'
      const key1 = encryption.deriveKey(password, Buffer.alloc(32, 1))
      const key2 = encryption.deriveKey(password, Buffer.alloc(32, 2))

      expect(key1.toString('hex')).not.toBe(key2.toString('hex'))
    })
  })

  describe('encryptWithEnvKey', () => {
    it('应该使用环境密钥加密解密', () => {
      const plaintext = 'Test with env key'
      const encrypted = encryption.encryptWithEnvKey(plaintext)
      const decrypted = encryption.decryptWithEnvKey(encrypted)

      expect(decrypted).toBe(plaintext)
    })
  })

  describe('edge cases', () => {
    it('解密无效数据应该抛出错误', () => {
      expect(() => encryption.decrypt('invalid-encrypted-data', 'password'))
        .toThrow()
    })

    it('错误密码解密应该抛出错误', () => {
      const encrypted = encryption.encrypt('test', 'correct-password')
      expect(() => encryption.decrypt(encrypted, 'wrong-password'))
        .toThrow()
    })
  })
})
