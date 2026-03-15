/**
 * User Model - v2.0.0
 * 用户数据模型
 */

import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DATA_FILE = path.join(__dirname, '../../data/users.json');

/**
 * 用户角色枚举
 */
const UserRole = {
  ADMIN: 'admin',
  EDITOR: 'editor',
  VIEWER: 'viewer'
};

/**
 * 用户状态枚举
 */
const UserStatus = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  SUSPENDED: 'suspended'
};

/**
 * 用户类
 */
class User {
  constructor(data) {
    this.id = data.id || `user-${Date.now()}-${crypto.randomBytes(4).toString('hex')}`;
    this.email = data.email;
    this.username = data.username;
    this.passwordHash = data.passwordHash;
    this.role = data.role || UserRole.VIEWER;
    this.status = data.status || UserStatus.ACTIVE;
    this.avatarUrl = data.avatarUrl;
    this.emailVerified = data.emailVerified || false;
    this.mfaEnabled = data.mfaEnabled || false;
    this.mfaSecret = data.mfaSecret;
    this.lastLoginAt = data.lastLoginAt;
    this.lastLoginIp = data.lastLoginIp;
    this.createdAt = data.createdAt || new Date().toISOString();
    this.updatedAt = data.updatedAt || new Date().toISOString();
    this.createdBy = data.createdBy;
    this.updatedBy = data.updatedBy;
  }

  /**
   * 验证密码
   */
  async verifyPassword(password) {
    const salt = this.passwordHash.split('$')[1];
    const hash = User.hashPassword(password, salt);
    return hash === this.passwordHash;
  }

  /**
   * 哈希密码 (使用 bcrypt 或 argon2)
   */
  static hashPassword(password, salt) {
    if (!salt) {
      salt = crypto.randomBytes(16).toString('hex');
    }
    return crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512').toString('hex') + '$' + salt;
  }

  /**
   * 检查密码强度
   */
  static validatePassword(password) {
    const errors = [];
    
    if (password.length < 8) {
      errors.push('密码至少需要 8 个字符');
    }
    if (!/[A-Z]/.test(password)) {
      errors.push('密码必须包含大写字母');
    }
    if (!/[a-z]/.test(password)) {
      errors.push('密码必须包含小写字母');
    }
    if (!/[0-9]/.test(password)) {
      errors.push('密码必须包含数字');
    }
    
    return {
      valid: errors.length === 0,
      errors
    };
  }

  /**
   * 转换为安全对象 (不包含敏感信息)
   */
  toSafeObject() {
    return {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      status: this.status,
      avatarUrl: this.avatarUrl,
      emailVerified: this.emailVerified,
      mfaEnabled: this.mfaEnabled,
      lastLoginAt: this.lastLoginAt,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt
    };
  }

  /**
   * 更新用户信息
   */
  update(data, updatedBy) {
    if (data.email) this.email = data.email;
    if (data.username) this.username = data.username;
    if (data.role) this.role = data.role;
    if (data.status) this.status = data.status;
    if (data.avatarUrl !== undefined) this.avatarUrl = data.avatarUrl;
    if (data.emailVerified !== undefined) this.emailVerified = data.emailVerified;
    if (data.mfaEnabled !== undefined) this.mfaEnabled = data.mfaEnabled;
    if (data.mfaSecret !== undefined) this.mfaSecret = data.mfaSecret;
    
    this.updatedAt = new Date().toISOString();
    this.updatedBy = updatedBy;
  }

  /**
   * 记录登录
   */
  recordLogin(ip) {
    this.lastLoginAt = new Date().toISOString();
    this.lastLoginIp = ip;
    this.updatedAt = new Date().toISOString();
  }
}

/**
 * 用户数据服务 (JSON 文件存储 - 临时方案)
 */
class UserService {
  constructor() {
    this.data = { users: [] };
    this.initialized = false;
  }

  /**
   * 初始化加载数据
   */
  async initialize() {
    if (this.initialized) return;
    
    try {
      await fs.access(DATA_FILE);
      const content = await fs.readFile(DATA_FILE, 'utf-8');
      this.data = JSON.parse(content);
    } catch (err) {
      // 文件不存在，创建初始数据
      this.data = { users: [] };
      await this.save();
      
      // 创建默认管理员账户
      await this.createDefaultAdmin();
    }
    
    this.initialized = true;
  }

  /**
   * 创建默认管理员
   */
  async createDefaultAdmin() {
    const existingAdmin = this.data.users.find(u => u.role === 'admin');
    if (existingAdmin) return;

    const admin = new User({
      email: 'admin@doc-viewer.com',
      username: 'admin',
      passwordHash: User.hashPassword('Admin@123456'),
      role: UserRole.ADMIN,
      status: UserStatus.ACTIVE,
      emailVerified: true
    });
    
    this.data.users.push(admin);
    await this.save();
    
    console.log('[UserService] 默认管理员账户已创建');
    console.log('[UserService] 邮箱：admin@doc-viewer.com');
    console.log('[UserService] 密码：Admin@123456');
  }

  /**
   * 保存数据
   */
  async save() {
    await fs.writeFile(DATA_FILE, JSON.stringify(this.data, null, 2), 'utf-8');
  }

  /**
   * 查找所有用户
   */
  async findAll(filters = {}) {
    await this.initialize();
    
    let users = this.data.users;
    
    if (filters.role) {
      users = users.filter(u => u.role === filters.role);
    }
    if (filters.status) {
      users = users.filter(u => u.status === filters.status);
    }
    if (filters.search) {
      const search = filters.search.toLowerCase();
      users = users.filter(u => 
        u.email.toLowerCase().includes(search) ||
        u.username.toLowerCase().includes(search)
      );
    }
    
    return users.map(u => new User(u).toSafeObject());
  }

  /**
   * 根据 ID 查找用户
   */
  async findById(id) {
    await this.initialize();
    const user = this.data.users.find(u => u.id === id);
    return user ? new User(user).toSafeObject() : null;
  }

  /**
   * 根据邮箱查找用户
   */
  async findByEmail(email) {
    await this.initialize();
    const user = this.data.users.find(u => u.email === email);
    return user ? new User(user) : null;
  }

  /**
   * 根据用户名查找用户
   */
  async findByUsername(username) {
    await this.initialize();
    const user = this.data.users.find(u => u.username === username);
    return user ? new User(user) : null;
  }

  /**
   * 创建用户
   */
  async create(userData, createdBy) {
    await this.initialize();
    
    // 检查邮箱是否已存在
    const existingEmail = this.data.users.find(u => u.email === userData.email);
    if (existingEmail) {
      throw new Error('邮箱已被使用');
    }
    
    // 检查用户名是否已存在
    const existingUsername = this.data.users.find(u => u.username === userData.username);
    if (existingUsername) {
      throw new Error('用户名已被使用');
    }
    
    // 验证密码强度
    const passwordValidation = User.validatePassword(userData.password);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }
    
    const user = new User({
      ...userData,
      passwordHash: User.hashPassword(userData.password),
      createdBy
    });
    
    this.data.users.push(user);
    await this.save();
    
    return user.toSafeObject();
  }

  /**
   * 更新用户
   */
  async update(id, updateData, updatedBy) {
    await this.initialize();
    
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('用户不存在');
    }
    
    const user = new User(this.data.users[index]);
    
    // 不允许直接修改密码哈希
    delete updateData.passwordHash;
    
    user.update(updateData, updatedBy);
    this.data.users[index] = user;
    
    await this.save();
    
    return user.toSafeObject();
  }

  /**
   * 删除用户
   */
  async delete(id) {
    await this.initialize();
    
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('用户不存在');
    }
    
    // 不允许删除最后一个管理员
    const user = this.data.users[index];
    if (user.role === UserRole.ADMIN) {
      const adminCount = this.data.users.filter(u => u.role === UserRole.ADMIN).length;
      if (adminCount <= 1) {
        throw new Error('不能删除最后一个管理员');
      }
    }
    
    this.data.users.splice(index, 1);
    await this.save();
  }

  /**
   * 验证用户登录
   */
  async authenticate(email, password, ip) {
    await this.initialize();
    
    const user = await this.findByEmail(email);
    if (!user) {
      throw new Error('邮箱或密码错误');
    }
    
    if (user.status !== UserStatus.ACTIVE) {
      throw new Error('账户已被禁用');
    }
    
    const valid = await user.verifyPassword(password);
    if (!valid) {
      throw new Error('邮箱或密码错误');
    }
    
    // 记录登录
    user.recordLogin(ip);
    await this.save();
    
    return user.toSafeObject();
  }

  /**
   * 重置密码
   */
  async resetPassword(id, newPassword, updatedBy) {
    await this.initialize();
    
    const index = this.data.users.findIndex(u => u.id === id);
    if (index === -1) {
      throw new Error('用户不存在');
    }
    
    // 验证密码强度
    const passwordValidation = User.validatePassword(newPassword);
    if (!passwordValidation.valid) {
      throw new Error(passwordValidation.errors.join(', '));
    }
    
    const user = new User(this.data.users[index]);
    user.passwordHash = User.hashPassword(newPassword);
    user.updatedBy = updatedBy;
    user.updatedAt = new Date().toISOString();
    
    this.data.users[index] = user;
    await this.save();
    
    return true;
  }

  /**
   * 获取用户统计
   */
  async getStats() {
    await this.initialize();
    
    const total = this.data.users.length;
    const byRole = {
      admin: this.data.users.filter(u => u.role === UserRole.ADMIN).length,
      editor: this.data.users.filter(u => u.role === UserRole.EDITOR).length,
      viewer: this.data.users.filter(u => u.role === UserRole.VIEWER).length
    };
    const byStatus = {
      active: this.data.users.filter(u => u.status === UserStatus.ACTIVE).length,
      inactive: this.data.users.filter(u => u.status === UserStatus.INACTIVE).length,
      suspended: this.data.users.filter(u => u.status === UserStatus.SUSPENDED).length
    };
    
    return { total, byRole, byStatus };
  }
}

export {
  User,
  UserService,
  UserRole,
  UserStatus
};
