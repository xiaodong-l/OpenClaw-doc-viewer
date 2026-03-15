import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 权限服务
 * 管理目录和文件的访问权限
 */
export class PermissionService {
  constructor(config) {
    this.config = config
    this.dataFile = path.join(__dirname, '../../data/permissions.json')
    this.rules = new Map()
    this.initialized = false
  }

  /**
   * 初始化权限服务
   */
  async initialize() {
    if (this.initialized) return

    try {
      const dataDir = path.dirname(this.dataFile)
      await fs.mkdir(dataDir, { recursive: true })

      try {
        const data = await fs.readFile(this.dataFile, 'utf-8')
        const parsed = JSON.parse(data)
        // 支持两种格式：{ rules: [...] } 或 [...]
        const rules = Array.isArray(parsed) ? parsed : (parsed.rules || [])
        for (const rule of rules) {
          this.rules.set(rule.path, rule)
        }
        console.log(`[PermissionService] Loaded ${this.rules.size} permission rules`)
      } catch (err) {
        if (err.code === 'ENOENT') {
          // 创建默认权限规则
          await this.createDefaultRules()
        } else {
          throw err
        }
      }
    } catch (err) {
      console.error('[PermissionService] Failed to initialize:', err)
      throw err
    }

    this.initialized = true
  }

  /**
   * 创建默认权限规则
   */
  async createDefaultRules() {
    const defaultRules = [
      {
        id: 'rule_public',
        path: '/workspace',
        pattern: '/**/workspace/**',
        roles: ['admin', 'editor', 'viewer'],
        permissions: ['read'],
        description: '工作区文档 - 所有人可读'
      },
      {
        id: 'rule_memory',
        path: '/memory',
        pattern: '/**/memory/**',
        roles: ['admin', 'editor'],
        permissions: ['read'],
        description: '记忆文件 - 管理员和编辑可读'
      },
      {
        id: 'rule_projects',
        path: '/projects',
        pattern: '/**/projects/**',
        roles: ['admin', 'editor', 'viewer'],
        permissions: ['read'],
        description: '项目文档 - 所有人可读'
      },
      {
        id: 'rule_agents',
        path: '/agents',
        pattern: '/**/agents/**',
        roles: ['admin', 'editor'],
        permissions: ['read'],
        description: 'Agent 文档 - 管理员和编辑可读'
      },
      {
        id: 'rule_admin',
        path: '/',
        pattern: '/**',
        roles: ['admin'],
        permissions: ['read', 'write', 'admin'],
        description: '管理员 - 所有权限'
      }
    ]

    for (const rule of defaultRules) {
      this.rules.set(rule.path, rule)
    }

    await this.save()
    console.log('[PermissionService] Created default permission rules')
  }

  /**
   * 检查用户是否有权限访问路径
   */
  async checkAccess(user, path, permission = 'read') {
    await this.initialize()

    const userRole = user.role || 'viewer'
    
    // 管理员拥有所有权限
    if (userRole === 'admin') {
      return true
    }

    // 查找匹配的规则
    const matchingRules = this.findMatchingRules(path)
    
    if (matchingRules.length === 0) {
      // 没有匹配规则，默认拒绝
      return false
    }

    // 检查是否有匹配的权限
    for (const rule of matchingRules) {
      if (rule.roles.includes(userRole) && rule.permissions.includes(permission)) {
        return true
      }
    }

    return false
  }

  /**
   * 查找匹配路径的规则
   */
  findMatchingRules(path) {
    const matches = []
    
    for (const rule of this.rules.values()) {
      if (this.matchPattern(rule.pattern, path)) {
        matches.push(rule)
      }
    }

    // 按路径长度排序，更具体的规则优先
    matches.sort((a, b) => b.path.length - a.path.length)
    
    return matches
  }

  /**
   * 匹配路径模式
   */
  matchPattern(pattern, path) {
    // 精确匹配
    if (pattern === path) {
      return true
    }

    // 通配符匹配 /**/
    if (pattern.includes('/**/')) {
      const regex = pattern
        .replace(/\*\*/g, '.*')
        .replace(/\*/g, '[^/]*')
      return new RegExp(`^${regex}$`).test(path)
    }

    // 前缀匹配
    if (pattern.endsWith('/**')) {
      const prefix = pattern.slice(0, -2)
      return path.startsWith(prefix)
    }

    return false
  }

  /**
   * 添加权限规则
   */
  async addRule(rule) {
    await this.initialize()

    const newRule = {
      id: `rule_${Date.now()}`,
      ...rule,
      createdAt: new Date().toISOString()
    }

    this.rules.set(newRule.path, newRule)
    await this.save()

    return newRule
  }

  /**
   * 删除权限规则
   */
  async deleteRule(path) {
    await this.initialize()

    if (!this.rules.has(path)) {
      throw new Error('规则不存在')
    }

    this.rules.delete(path)
    await this.save()
  }

  /**
   * 获取所有规则
   */
  async listRules() {
    await this.initialize()
    return Array.from(this.rules.values())
  }

  /**
   * 保存规则
   */
  async save() {
    const data = Array.from(this.rules.values())
    await fs.writeFile(
      this.dataFile,
      JSON.stringify(data, null, 2),
      'utf-8'
    )
  }
}

export default PermissionService
