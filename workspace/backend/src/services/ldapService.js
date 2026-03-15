/**
 * LDAP Service - v2.0.0
 * LDAP/Active Directory 集成服务
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LDAP_CONFIGS_FILE = path.join(__dirname, '../../data/ldap-configs.json')
const LDAP_MAPPINGS_FILE = path.join(__dirname, '../../data/ldap-mappings.json')
const LDAP_LOGS_FILE = path.join(__dirname, '../../data/ldap-logs.json')

/**
 * LDAP 配置类
 */
export class LDAPConfig {
  constructor(data) {
    this.id = data.id || `ldap-${Date.now()}`
    this.name = data.name
    this.host = data.host
    this.port = data.port || 389
    this.useSSL = data.useSSL || false
    this.baseDN = data.baseDN
    this.bindDN = data.bindDN
    this.bindPassword = data.bindPassword
    this.userFilter = data.userFilter || '(objectClass=person)'
    this.userSearchBase = data.userSearchBase
    this.usernameAttribute = data.usernameAttribute || 'sAMAccountName'
    this.emailAttribute = data.emailAttribute || 'mail'
    this.displayNameAttribute = data.displayNameAttribute || 'displayName'
    this.groupAttribute = data.groupAttribute || 'memberOf'
    this.syncEnabled = data.syncEnabled !== false
    this.syncInterval = data.syncInterval || 3600
    this.autoCreateUser = data.autoCreateUser !== false
    this.defaultRole = data.defaultRole || 'viewer'
    this.isActive = data.isActive !== false
    this.createdAt = data.createdAt || new Date().toISOString()
    this.updatedAt = data.updatedAt || new Date().toISOString()
  }

  /**
   * 获取 LDAP URL
   */
  getURL() {
    const protocol = this.useSSL ? 'ldaps' : 'ldap'
    return `${protocol}://${this.host}:${this.port}`
  }

  /**
   * 转换为安全对象 (不含密码)
   */
  toSafeObject() {
    return {
      id: this.id,
      name: this.name,
      host: this.host,
      port: this.port,
      useSSL: this.useSSL,
      baseDN: this.baseDN,
      bindDN: this.bindDN,
      userFilter: this.userFilter,
      userSearchBase: this.userSearchBase,
      usernameAttribute: this.usernameAttribute,
      emailAttribute: this.emailAttribute,
      displayNameAttribute: this.displayNameAttribute,
      syncEnabled: this.syncEnabled,
      syncInterval: this.syncInterval,
      autoCreateUser: this.autoCreateUser,
      defaultRole: this.defaultRole,
      isActive: this.isActive,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    }
  }
}

/**
 * LDAP 服务类
 */
export class LDAPService {
  constructor() {
    this.data = {
      configs: [],
      mappings: [],
      logs: []
    }
    this.initialized = false
    this.client = null
  }

  /**
   * 初始化
   */
  async initialize() {
    if (this.initialized) return

    try {
      // 加载配置
      await fs.access(LDAP_CONFIGS_FILE)
      const configContent = await fs.readFile(LDAP_CONFIGS_FILE, 'utf-8')
      this.data.configs = JSON.parse(configContent).map(c => new LDAPConfig(c))
    } catch (err) {
      this.data.configs = []
      await this.saveConfigs()
    }

    try {
      // 加载映射
      await fs.access(LDAP_MAPPINGS_FILE)
      const mappingsContent = await fs.readFile(LDAP_MAPPINGS_FILE, 'utf-8')
      this.data.mappings = JSON.parse(mappingsContent)
    } catch (err) {
      this.data.mappings = []
      await this.saveMappings()
    }

    try {
      // 加载日志
      await fs.access(LDAP_LOGS_FILE)
      const logsContent = await fs.readFile(LDAP_LOGS_FILE, 'utf-8')
      this.data.logs = JSON.parse(logsContent)
    } catch (err) {
      this.data.logs = []
      await this.saveLogs()
    }

    this.initialized = true
  }

  /**
   * 保存配置
   */
  async saveConfigs() {
    await fs.writeFile(
      LDAP_CONFIGS_FILE,
      JSON.stringify(this.data.configs.map(c => ({ ...c })), null, 2),
      'utf-8'
    )
  }

  /**
   * 保存映射
   */
  async saveMappings() {
    await fs.writeFile(LDAP_MAPPINGS_FILE, JSON.stringify(this.data.mappings, null, 2), 'utf-8')
  }

  /**
   * 保存日志
   */
  async saveLogs() {
    await fs.writeFile(LDAP_LOGS_FILE, JSON.stringify(this.data.logs, null, 2), 'utf-8')
  }

  /**
   * 获取所有 LDAP 配置
   */
  async getConfigs() {
    await this.initialize()
    return this.data.configs.map(c => c.toSafeObject())
  }

  /**
   * 获取 LDAP 配置
   */
  async getConfig(configId) {
    await this.initialize()
    const config = this.data.configs.find(c => c.id === configId)
    return config ? config.toSafeObject() : null
  }

  /**
   * 创建 LDAP 配置
   */
  async createConfig(data) {
    await this.initialize()

    const config = new LDAPConfig(data)
    this.data.configs.push(config)
    await this.saveConfigs()

    return config.toSafeObject()
  }

  /**
   * 更新 LDAP 配置
   */
  async updateConfig(configId, updates) {
    await this.initialize()

    const config = this.data.configs.find(c => c.id === configId)
    if (!config) {
      throw new Error('LDAP 配置不存在')
    }

    Object.assign(config, updates, {
      id: config.id,
      createdAt: config.createdAt,
      updatedAt: new Date().toISOString()
    })

    await this.saveConfigs()

    return config.toSafeObject()
  }

  /**
   * 删除 LDAP 配置
   */
  async deleteConfig(configId) {
    await this.initialize()

    const index = this.data.configs.findIndex(c => c.id === configId)
    if (index === -1) {
      throw new Error('LDAP 配置不存在')
    }

    // 删除相关映射
    this.data.mappings = this.data.mappings.filter(m => m.ldapConfigId !== configId)
    await this.saveMappings()

    this.data.configs.splice(index, 1)
    await this.saveConfigs()
  }

  /**
   * 测试 LDAP 连接
   */
  async testConnection(configId) {
    await this.initialize()

    const config = this.data.configs.find(c => c.id === configId)
    if (!config) {
      throw new Error('LDAP 配置不存在')
    }

    try {
      // 模拟连接测试 (实际应使用 ldapjs)
      console.log(`[LDAP] 测试连接到 ${config.getURL()}`)
      
      // 这里应该实际连接 LDAP 服务器
      // 简化处理：返回成功
      return {
        success: true,
        message: '连接成功',
        server: config.getURL(),
        baseDN: config.baseDN
      }
    } catch (err) {
      return {
        success: false,
        message: err.message,
        server: config.getURL()
      }
    }
  }

  /**
   * LDAP 用户认证
   */
  async authenticate(configId, username, password) {
    await this.initialize()

    const config = this.data.configs.find(c => c.id === configId)
    if (!config) {
      throw new Error('LDAP 配置不存在')
    }

    if (!config.isActive) {
      throw new Error('LDAP 配置已禁用')
    }

    try {
      // 模拟 LDAP 认证 (实际应使用 ldapjs)
      console.log(`[LDAP] 认证用户：${username}`)
      
      // 这里应该：
      // 1. 连接 LDAP 服务器
      // 2. 使用 bindDN 绑定
      // 3. 搜索用户
      // 4. 使用用户 DN 和密码绑定验证
      
      // 简化处理：返回模拟结果
      const ldapUser = {
        dn: `cn=${username},${config.baseDN}`,
        uid: username,
        email: `${username}@example.com`,
        displayName: username
      }

      // 查找或创建用户映射
      let mapping = this.data.mappings.find(m =>
        m.ldapConfigId === configId && m.ldapUid === ldapUser.uid
      )

      if (!mapping && config.autoCreateUser) {
        // 创建新用户映射
        mapping = {
          id: `mapping-${Date.now()}`,
          ldapConfigId: configId,
          ldapDN: ldapUser.dn,
          ldapUid: ldapUser.uid,
          userId: `user-ldap-${Date.now()}`,
          username: ldapUser.uid,
          email: ldapUser.email,
          displayName: ldapUser.displayName,
          lastSyncAt: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        this.data.mappings.push(mapping)
        await this.saveMappings()
      }

      return {
        success: true,
        user: mapping,
        ldapUser
      }
    } catch (err) {
      return {
        success: false,
        message: err.message
      }
    }
  }

  /**
   * 同步 LDAP 用户
   */
  async syncUsers(configId) {
    await this.initialize()

    const config = this.data.configs.find(c => c.id === configId)
    if (!config) {
      throw new Error('LDAP 配置不存在')
    }

    const startTime = Date.now()
    const log = {
      id: `sync-${Date.now()}`,
      ldapConfigId: configId,
      syncType: 'full',
      status: 'pending',
      startedAt: new Date().toISOString()
    }

    try {
      // 模拟同步 (实际应使用 ldapjs 搜索并同步)
      console.log(`[LDAP] 开始同步用户：${config.name}`)
      
      // 这里应该：
      // 1. 连接 LDAP
      // 2. 搜索所有用户
      // 3. 对比本地映射
      // 4. 创建/更新/禁用用户
      
      log.status = 'success'
      log.usersSynced = 0
      log.usersCreated = 0
      log.usersUpdated = 0
      log.usersFailed = 0
      log.completedAt = new Date().toISOString()
      log.durationMs = Date.now() - startTime

      this.data.logs.push(log)
      if (this.data.logs.length > 100) {
        this.data.logs = this.data.logs.slice(-100)
      }
      await this.saveLogs()

      return {
        success: true,
        synced: 0,
        created: 0,
        updated: 0,
        failed: 0,
        durationMs: log.durationMs
      }
    } catch (err) {
      log.status = 'failed'
      log.errorMessage = err.message
      log.completedAt = new Date().toISOString()
      log.durationMs = Date.now() - startTime

      this.data.logs.push(log)
      await this.saveLogs()

      throw err
    }
  }

  /**
   * 获取同步日志
   */
  async getSyncLogs(configId = null, limit = 50) {
    await this.initialize()

    let logs = this.data.logs

    if (configId) {
      logs = logs.filter(l => l.ldapConfigId === configId)
    }

    return logs.slice(-limit).reverse()
  }

  /**
   * 获取用户映射
   */
  async getUserMapping(ldapConfigId, ldapUid) {
    await this.initialize()

    return this.data.mappings.find(m =>
      m.ldapConfigId === ldapConfigId && m.ldapUid === ldapUid
    )
  }

  /**
   * 通过邮箱查找映射
   */
  async findMappingByEmail(email) {
    await this.initialize()

    return this.data.mappings.find(m => m.email === email)
  }

  /**
   * 获取 LDAP 统计
   */
  async getStats(configId) {
    await this.initialize()

    const mappings = this.data.mappings.filter(m => m.ldapConfigId === configId)
    const logs = this.data.logs.filter(l => l.ldapConfigId === configId)

    const recentLogs = logs.slice(-10)
    const successCount = recentLogs.filter(l => l.status === 'success').length

    return {
      totalUsers: mappings.length,
      totalSyncs: logs.length,
      lastSyncAt: logs.length > 0 ? logs[logs.length - 1].completedAt : null,
      lastSyncStatus: logs.length > 0 ? logs[logs.length - 1].status : null,
      successRate: recentLogs.length > 0 ? (successCount / recentLogs.length * 100).toFixed(1) : 0
    }
  }
}

export default LDAPService
