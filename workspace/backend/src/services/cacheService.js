/**
 * Cache Service - v2.0.0
 * Redis 缓存服务
 */

import { createClient } from 'redis'

/**
 * 缓存配置
 */
const CACHE_CONFIG = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD || null,
  db: parseInt(process.env.REDIS_DB || '0'),
  keyPrefix: 'doc-viewer:',
  defaultTTL: 3600 // 1 小时
}

/**
 * 缓存键
 */
export const CacheKeys = {
  // 文档相关
  DOCUMENT_CONTENT: (path) => `doc:content:${path}`,
  DOCUMENT_META: (path) => `doc:meta:${path}`,
  DOCUMENT_VERSIONS: (path) => `doc:versions:${path}`,
  
  // 搜索相关
  SEARCH_RESULTS: (query) => `search:${query}`,
  SEARCH_SUGGESTIONS: (query) => `search:suggest:${query}`,
  
  // 用户相关
  USER_INFO: (userId) => `user:${userId}`,
  USER_PERMISSIONS: (userId, path) => `user:perm:${userId}:${path}`,
  
  // 统计相关
  STATS: () => 'stats:global',
  DOC_COUNT: () => 'stats:doc_count',
  
  // 锁相关
  DOCUMENT_LOCK: (path) => `lock:${path}`,
  
  // 会话相关
  SESSION: (token) => `session:${token}`,
  
  // LDAP 相关
  LDAP_USER: (uid) => `ldap:user:${uid}`,
  LDAP_CONFIG: (id) => `ldap:config:${id}`
}

/**
 * 缓存服务类
 */
class CacheService {
  constructor() {
    this.client = null
    this.connected = false
    this.initialized = false
  }

  /**
   * 初始化连接
   */
  async initialize() {
    if (this.initialized) return

    try {
      this.client = createClient({
        socket: {
          host: CACHE_CONFIG.host,
          port: CACHE_CONFIG.port
        },
        password: CACHE_CONFIG.password,
        database: CACHE_CONFIG.db
      })

      this.client.on('error', (err) => {
        console.error('[CacheService] Redis 错误:', err.message)
        this.connected = false
      })

      this.client.on('connect', () => {
        console.log('[CacheService] Redis 已连接')
        this.connected = true
      })

      await this.client.connect()
      this.initialized = true
    } catch (err) {
      console.warn('[CacheService] Redis 连接失败，使用内存缓存:', err.message)
      this.useMemoryCache = true
      this.memoryCache = new Map()
      this.initialized = true
    }
  }

  /**
   * 获取值
   */
  async get(key) {
    await this.initialize()

    const fullKey = `${CACHE_CONFIG.keyPrefix}${key}`

    if (this.useMemoryCache) {
      const item = this.memoryCache.get(fullKey)
      if (item && (!item.expires || item.expires > Date.now())) {
        return item.value
      }
      return null
    }

    if (!this.connected) return null

    try {
      const value = await this.client.get(fullKey)
      return value ? JSON.parse(value) : null
    } catch (err) {
      console.error('[CacheService] GET 失败:', err.message)
      return null
    }
  }

  /**
   * 设置值
   */
  async set(key, value, ttl = CACHE_CONFIG.defaultTTL) {
    await this.initialize()

    const fullKey = `${CACHE_CONFIG.keyPrefix}${key}`

    if (this.useMemoryCache) {
      this.memoryCache.set(fullKey, {
        value,
        expires: ttl > 0 ? Date.now() + ttl * 1000 : null
      })
      return true
    }

    if (!this.connected) return false

    try {
      const stringValue = JSON.stringify(value)
      if (ttl > 0) {
        await this.client.setEx(fullKey, ttl, stringValue)
      } else {
        await this.client.set(fullKey, stringValue)
      }
      return true
    } catch (err) {
      console.error('[CacheService] SET 失败:', err.message)
      return false
    }
  }

  /**
   * 删除值
   */
  async delete(key) {
    await this.initialize()

    const fullKey = `${CACHE_CONFIG.keyPrefix}${key}`

    if (this.useMemoryCache) {
      return this.memoryCache.delete(fullKey)
    }

    if (!this.connected) return false

    try {
      await this.client.del(fullKey)
      return true
    } catch (err) {
      console.error('[CacheService] DELETE 失败:', err.message)
      return false
    }
  }

  /**
   * 删除匹配的值
   */
  async deletePattern(pattern) {
    await this.initialize()

    const fullPattern = `${CACHE_CONFIG.keyPrefix}${pattern}`

    if (this.useMemoryCache) {
      for (const key of this.memoryCache.keys()) {
        if (key.startsWith(fullPattern.replace('*', ''))) {
          this.memoryCache.delete(key)
        }
      }
      return true
    }

    if (!this.connected) return false

    try {
      const keys = await this.client.keys(fullPattern)
      if (keys.length > 0) {
        await this.client.del(keys)
      }
      return true
    } catch (err) {
      console.error('[CacheService] DELETE PATTERN 失败:', err.message)
      return false
    }
  }

  /**
   * 检查键是否存在
   */
  async exists(key) {
    await this.initialize()

    const fullKey = `${CACHE_CONFIG.keyPrefix}${key}`

    if (this.useMemoryCache) {
      const item = this.memoryCache.get(fullKey)
      return item && (!item.expires || item.expires > Date.now())
    }

    if (!this.connected) return false

    try {
      const result = await this.client.exists(fullKey)
      return result === 1
    } catch (err) {
      console.error('[CacheService] EXISTS 失败:', err.message)
      return false
    }
  }

  /**
   * 自增
   */
  async incr(key, ttl = CACHE_CONFIG.defaultTTL) {
    await this.initialize()

    const fullKey = `${CACHE_CONFIG.keyPrefix}${key}`

    if (this.useMemoryCache) {
      const current = await this.get(key) || 0
      const newValue = current + 1
      await this.set(key, newValue, ttl)
      return newValue
    }

    if (!this.connected) return null

    try {
      const result = await this.client.incr(fullKey)
      if (ttl > 0) {
        await this.client.expire(fullKey, ttl)
      }
      return result
    } catch (err) {
      console.error('[CacheService] INCR 失败:', err.message)
      return null
    }
  }

  /**
   * 获取缓存统计
   */
  async getStats() {
    await this.initialize()

    if (this.useMemoryCache) {
      return {
        type: 'memory',
        size: this.memoryCache.size,
        connected: true
      }
    }

    if (!this.connected) {
      return {
        type: 'redis',
        connected: false
      }
    }

    try {
      const info = await this.client.info('stats')
      const dbSize = await this.client.dbSize()
      
      return {
        type: 'redis',
        connected: true,
        keys: dbSize,
        info: info.split('\n').reduce((acc, line) => {
          const [key, value] = line.split(':')
          if (key && value) acc[key.trim()] = value.trim()
          return acc
        }, {})
      }
    } catch (err) {
      return {
        type: 'redis',
        connected: false,
        error: err.message
      }
    }
  }

  /**
   * 清空缓存
   */
  async flush() {
    await this.initialize()

    if (this.useMemoryCache) {
      this.memoryCache.clear()
      return true
    }

    if (!this.connected) return false

    try {
      const pattern = `${CACHE_CONFIG.keyPrefix}*`
      const keys = await this.client.keys(pattern)
      if (keys.length > 0) {
        await this.client.del(keys)
      }
      return true
    } catch (err) {
      console.error('[CacheService] FLUSH 失败:', err.message)
      return false
    }
  }

  /**
   * 关闭连接
   */
  async close() {
    if (this.client && this.connected) {
      await this.client.quit()
      this.connected = false
    }
  }
}

// 导出单例
export const cacheService = new CacheService()
export default cacheService
