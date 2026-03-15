import fs from 'fs/promises'
import path from 'path'
import crypto from 'crypto'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * 用户服务
 * 使用 JSON 文件存储用户数据（生产环境建议用数据库）
 */
export class UserService {
  constructor(config) {
    this.config = config
    this.dataFile = path.join(__dirname, '../../data/users.json')
    this.users = new Map()
    this.initialized = false
  }

  /**
   * 初始化用户服务
   */
  async initialize() {
    if (this.initialized) return

    try {
      // 确保数据目录存在
      const dataDir = path.dirname(this.dataFile)
      await fs.mkdir(dataDir, { recursive: true })

      // 加载用户数据
      try {
        const data = await fs.readFile(this.dataFile, 'utf-8')
        const parsed = JSON.parse(data)
        // 支持两种格式：{ users: [...] } 或 [...]
        const users = Array.isArray(parsed) ? parsed : (parsed.users || [])
        for (const user of users) {
          this.users.set(user.id, user)
        }
        console.log(`[UserService] Loaded ${this.users.size} users`)
      } catch (err) {
        if (err.code === 'ENOENT') {
          // 文件不存在，创建默认用户
          await this.createDefaultUser()
        } else {
          throw err
        }
      }
    } catch (err) {
      console.error('[UserService] Failed to initialize:', err)
      throw err
    }

    this.initialized = true
  }

  /**
   * 创建默认管理员用户
   */
  async createDefaultUser() {
    const adminUser = {
      id: 'admin',
      username: 'admin',
      password: this.hashPassword('admin123'),
      email: 'admin@localhost',
      role: 'admin',
      permissions: ['read', 'write', 'admin'],
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    }

    this.users.set(adminUser.id, adminUser)
    await this.save()

    console.log('[UserService] Created default admin user:')
    console.log('  Username: admin')
    console.log('  Password: admin123')
    console.log('  ⚠️  请首次登录后修改密码！')
  }

  /**
   * 密码哈希 (v1.3.x 格式 - 简单 SHA256)
   */
  hashPassword(password) {
    const jwtSecret = this.config?.jwt?.secret || process.env.JWT_SECRET || 'doc-viewer-jwt-secret-change-in-production';
    return crypto
      .createHash('sha256')
      .update(password + jwtSecret)
      .digest('hex')
  }

  /**
   * 验证密码 (支持 v1.3.x SHA256 和 v2.0.0 pbkdf2+SHA512 格式)
   */
  verifyPassword(password, hash) {
    // v2.0.0 格式：pbkdf2+SHA512 (hash$salt)
    if (hash.includes('$')) {
      const [storedHash, salt] = hash.split('$');
      const computedHash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex');
      return computedHash === storedHash;
    }
    // v1.3.x 格式：简单 SHA256
    return this.hashPassword(password) === hash;
  }

  /**
   * 用户认证 (支持邮箱或用户名登录)
   */
  async authenticate(emailOrUsername, password, ip) {
    await this.initialize()

    for (const user of this.users.values()) {
      const isMatch = (user.email === emailOrUsername || user.username === emailOrUsername) 
        && this.verifyPassword(password, user.password);
      
      if (isMatch) {
        // 更新最后登录时间和 IP
        user.lastLoginAt = new Date().toISOString()
        user.lastLoginIp = ip || null
        await this.save()
        
        // 返回不含密码的用户信息
        const { password: _, ...safeUser } = user
        return safeUser
      }
    }

    return null
  }

  /**
   * 根据 ID 获取用户
   */
  async getById(id) {
    await this.initialize()
    const user = this.users.get(id)
    
    if (!user) return null
    
    const { password: _, ...safeUser } = user
    return safeUser
  }

  /**
   * 根据用户名获取用户
   */
  async getByUsername(username) {
    await this.initialize()
    
    for (const user of this.users.values()) {
      if (user.username === username) {
        const { password: _, ...safeUser } = user
        return safeUser
      }
    }
    
    return null
  }

  /**
   * 列出所有用户
   */
  async list() {
    await this.initialize()
    
    return Array.from(this.users.values()).map(u => {
      const { password: _, ...safeUser } = u
      return safeUser
    })
  }

  /**
   * 创建用户
   */
  async create(userData) {
    await this.initialize()

    // 检查用户名是否已存在
    for (const user of this.users.values()) {
      if (user.username === userData.username) {
        const err = new Error('用户名已存在')
        err.code = 'USER_EXISTS'
        throw err
      }
    }

    const user = {
      id: `user_${Date.now()}`,
      username: userData.username,
      password: this.hashPassword(userData.password),
      email: userData.email || '',
      role: userData.role || 'viewer',
      permissions: this.getRolePermissions(userData.role || 'viewer'),
      createdAt: new Date().toISOString(),
      lastLoginAt: null
    }

    this.users.set(user.id, user)
    await this.save()

    const { password: _, ...safeUser } = user
    return safeUser
  }

  /**
   * 删除用户
   */
  async delete(id) {
    await this.initialize()

    if (!this.users.has(id)) {
      throw new Error('用户不存在')
    }

    // 不允许删除最后一个管理员
    if (id === 'admin') {
      throw new Error('不能删除默认管理员')
    }

    this.users.delete(id)
    await this.save()
  }

  /**
   * 更新用户
   */
  async update(id, updates) {
    await this.initialize()

    const user = this.users.get(id)
    if (!user) {
      throw new Error('用户不存在')
    }

    // 更新允许的字段
    if (updates.email !== undefined) {
      user.email = updates.email
    }
    
    if (updates.role !== undefined) {
      user.role = updates.role
      user.permissions = this.getRolePermissions(updates.role)
    }

    if (updates.password !== undefined && updates.password) {
      user.password = this.hashPassword(updates.password)
    }

    await this.save()

    const { password: _, ...safeUser } = user
    return safeUser
  }

  /**
   * 获取角色权限
   */
  getRolePermissions(role) {
    const permissions = {
      admin: ['read', 'write', 'admin', 'users.manage', 'settings.manage'],
      editor: ['read', 'write'],
      viewer: ['read']
    }
    return permissions[role] || permissions.viewer
  }

  /**
   * 检查用户权限
   */
  async hasPermission(userId, permission) {
    await this.initialize()
    
    const user = this.users.get(userId)
    if (!user) return false
    
    return user.permissions.includes(permission) || 
           user.permissions.includes('admin')
  }

  /**
   * 保存用户数据
   */
  async save() {
    const data = Array.from(this.users.values())
    await fs.writeFile(
      this.dataFile,
      JSON.stringify(data, null, 2),
      'utf-8'
    )
  }
}

export default UserService
