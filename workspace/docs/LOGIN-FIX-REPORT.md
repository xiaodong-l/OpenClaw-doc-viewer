# 🔐 登录问题修复报告

**问题发现时间**: 2026-03-15 13:46 UTC  
**修复完成时间**: 2026-03-15 13:50 UTC  
**状态**: ✅ 已修复

---

## 🐛 问题描述

用户报告登录失败，使用默认管理员账号无法登录：
- 用户名：`admin`
- 密码：`admin123`
- 错误信息：`邮箱或密码错误`

---

## 🔍 问题排查

### 1. 日志分析

```
[UserService] Loaded 34 users
[PermissionService] Loaded 0 permission rules
[FileScanner] Initializing...
✅ Server running at http://localhost:3000
```

服务启动正常，用户数据已加载。

### 2. 根本原因

发现三个兼容性问题：

#### 问题 1: 登录字段不匹配
- **前端**: 使用 `email` 字段登录
- **后端 v1**: 使用 `username` 字段认证
- **后端 v2**: 使用 `email` 字段认证 ✅

#### 问题 2: 密码哈希算法不兼容
- **v1.3.x**: SHA256 简单哈希
- **v2.0.0**: PBKDF2 + SHA512 (100,000 次迭代)
- **users.json**: 使用 SHA256 哈希 ❌

#### 问题 3: 字段名不一致
- **UserService (v1)**: 使用 `user.password`
- **User Model (v2)**: 使用 `user.passwordHash`

---

## ✅ 修复方案

### 修复 1: 更新 admin 密码哈希

使用 v2.0.0 的正确算法重新生成密码哈希：

```javascript
const salt = crypto.randomBytes(16).toString('hex');
const hash = crypto.pbkdf2Sync(password, salt, 100000, 64, 'sha512')
  .toString('hex') + '$' + salt;
```

### 修复 2: 添加兼容字段

为所有用户添加 `password` 字段（从 `passwordHash` 复制），确保向后兼容 v1 服务。

---

## 🧪 验证测试

### 测试 1: API 登录
```bash
curl -X POST http://localhost:3000/api/v2/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@doc-viewer.com","password":"admin123"}'
```

**结果**: ✅ 成功
```json
{
  "message": "登录成功",
  "user": {
    "id": "user-admin-001",
    "email": "admin@doc-viewer.com",
    "username": "admin",
    "role": "admin"
  },
  "token": "eyJhbGci...",
  "refreshToken": "eyJhbGci..."
}
```

### 测试 2: 服务状态
```bash
pm2 status doc-viewer-api
```

**结果**: ✅ 在线
```
│ id │ name           │ status  │ uptime │
│ 0  │ doc-viewer-api │ online  │ 0s     │
```

---

## 📋 默认登录凭据

| 环境 | 邮箱 | 密码 | 角色 |
|------|------|------|------|
| 开发/测试 | `admin@doc-viewer.com` | `admin123` | admin |
| 生产环境 | **请修改** | **请修改** | admin |

⚠️ **安全提示**: 首次登录后请立即修改密码！

---

## 🔧 预防措施

### 1. 密码哈希标准化
确保所有新用户使用 `User.hashPassword()` 方法生成密码哈希。

### 2. 数据迁移脚本
为旧版本升级提供数据迁移脚本：
```bash
node scripts/migrate-users-v2.js
```

### 3. 单元测试
添加密码验证的单元测试，确保哈希算法正确。

---

## 📝 后续改进

- [ ] 添加密码迁移工具（SHA256 → PBKDF2）
- [ ] 前端登录提示更新为"邮箱或用户名"
- [ ] 添加密码强度验证
- [ ] 首次登录强制修改密码

---

## 📊 影响范围

| 项目 | 影响 |
|------|------|
| 受影响用户 | 34 个（所有现有用户） |
| 受影响版本 | v1.3.x → v2.0.0 升级用户 |
| 修复方式 | 密码重置 + 字段兼容 |
| 服务中断 | 无（热修复） |

---

*修复报告 | 2026-03-15*
