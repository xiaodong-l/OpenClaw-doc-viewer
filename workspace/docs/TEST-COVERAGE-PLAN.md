# 🧪 v2.0.0 测试覆盖计划

**创建日期:** 2026-03-13  
**目标覆盖率:** >80%

---

## 📊 当前状态

| 模块 | 文件数 | 测试文件 | 覆盖率 |
|------|--------|----------|--------|
| 用户管理 | 3 | 0 | 0% |
| 权限系统 | 4 | 0 | 0% |
| MFA | 2 | 0 | 0% |
| 加密工具 | 2 | 0 | 0% |
| **总计** | **11** | **0** | **0%** |

---

## 🎯 测试策略

### 单元测试 (Unit Tests)

**目标:** 覆盖所有核心功能

| 模块 | 测试文件 | 优先级 |
|------|----------|--------|
| User.js | `test/unit/User.test.js` | P0 |
| Permission.js | `test/unit/Permission.test.js` | P0 |
| mfa.js | `test/unit/mfa.test.js` | P1 |
| encryption.js | `test/unit/encryption.test.js` | P1 |

### 集成测试 (Integration Tests)

**目标:** 验证 API 端点

| API | 测试文件 | 端点数 |
|-----|----------|--------|
| /api/v2/auth | `test/integration/auth.test.js` | 6 |
| /api/v2/users | `test/integration/users.test.js` | 8 |
| /api/v2/permissions | `test/integration/permissions.test.js` | 14 |
| /api/v2/mfa | `test/integration/mfa.test.js` | 6 |
| /api/v2/encryption | `test/integration/encryption.test.js` | 4 |

### E2E 测试 (End-to-End)

**目标:** 验证完整用户流程

| 流程 | 测试文件 | 优先级 |
|------|----------|--------|
| 用户注册登录 | `test/e2e/auth-flow.test.js` | P0 |
| 权限管理 | `test/e2e/permission-flow.test.js` | P0 |
| MFA 启用验证 | `test/e2e/mfa-flow.test.js` | P1 |

---

## 📁 测试文件结构

```
workspace/backend/test/
├── unit/
│   ├── User.test.js
│   ├── Permission.test.js
│   ├── mfa.test.js
│   └── encryption.test.js
├── integration/
│   ├── auth.test.js
│   ├── users.test.js
│   ├── permissions.test.js
│   ├── mfa.test.js
│   └── encryption.test.js
├── e2e/
│   ├── auth-flow.test.js
│   └── permission-flow.test.js
├── helpers/
│   ├── testDb.js
│   ├── mockData.js
│   └── testServer.js
└── setup.js
```

---

## 🔧 测试工具

### 技术栈
| 工具 | 用途 |
|------|------|
| Vitest | 测试框架 |
| Supertest | API 测试 |
| Sinon | Mock/Stub |
| Faker | 测试数据生成 |

### 安装
```bash
cd workspace/backend
npm install --save-dev vitest @vitest/coverage-v8 supertest sinon faker
```

### 配置 (vitest.config.js)
```javascript
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      threshold: {
        lines: 80,
        functions: 80,
        branches: 70,
        statements: 80
      }
    },
    setupFiles: ['./test/setup.js']
  }
})
```

---

## 📋 测试用例示例

### User 模型测试

```javascript
// test/unit/User.test.js
import { describe, it, expect, beforeEach } from 'vitest'
import { User, UserService, UserRole } from '../../src/models/User.js'

describe('User', () => {
  describe('constructor', () => {
    it('should create user with default role', () => {
      const user = new User({
        email: 'test@example.com',
        username: 'testuser',
        passwordHash: 'hash123'
      })
      
      expect(user.role).toBe(UserRole.VIEWER)
      expect(user.status).toBe('active')
    })
  })

  describe('validatePassword', () => {
    it('should accept valid password', () => {
      const result = User.validatePassword('ValidPass123')
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should reject short password', () => {
      const result = User.validatePassword('Short1!')
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('密码至少需要 8 个字符')
    })
  })
})

describe('UserService', () => {
  let service

  beforeEach(async () => {
    service = new UserService()
    await service.initialize()
  })

  it('should create user', async () => {
    const user = await service.create({
      email: 'new@example.com',
      username: 'newuser',
      password: 'ValidPass123'
    }, 'system')

    expect(user.email).toBe('new@example.com')
    expect(user.role).toBe(UserRole.VIEWER)
  })
})
```

### Auth API 测试

```javascript
// test/integration/auth.test.js
import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import request from 'supertest'
import { buildApp } from '../../src/app.js'

describe('Auth API', () => {
  let app
  let server

  beforeAll(async () => {
    app = await buildApp({ test: true })
    server = app.server
  })

  afterAll(async () => {
    await server.close()
  })

  describe('POST /api/v2/auth/login', () => {
    it('should login with valid credentials', async () => {
      const res = await request(server)
        .post('/api/v2/auth/login')
        .send({
          email: 'admin@doc-viewer.com',
          password: 'Admin@123456'
        })

      expect(res.status).toBe(200)
      expect(res.body.token).toBeDefined()
      expect(res.body.user.role).toBe('admin')
    })

    it('should reject invalid credentials', async () => {
      const res = await request(server)
        .post('/api/v2/auth/login')
        .send({
          email: 'admin@doc-viewer.com',
          password: 'WrongPassword'
        })

      expect(res.status).toBe(401)
      expect(res.body.error).toContain('邮箱或密码错误')
    })
  })
})
```

---

## 📊 覆盖率目标

### 总体目标
- **行覆盖率:** >80%
- **函数覆盖率:** >80%
- **分支覆盖率:** >70%
- **语句覆盖率:** >80%

### 分模块目标
| 模块 | 目标覆盖率 |
|------|------------|
| 核心模型 | >90% |
| API 路由 | >85% |
| 工具函数 | >95% |
| 中间件 | >80% |

---

## 🚀 执行计划

### Phase 1 (本周)
- [ ] 搭建测试框架
- [ ] 编写单元测试 (User, Permission)
- [ ] 编写集成测试 (auth, users)

### Phase 2 (下周)
- [ ] 编写集成测试 (permissions, mfa)
- [ ] 编写 E2E 测试
- [ ] 达到 80% 覆盖率

### Phase 3 (持续)
- [ ] CI/CD 集成
- [ ] 覆盖率监控
- [ ] 定期测试审查

---

## 📈 监控与报告

### 生成覆盖率报告
```bash
cd workspace/backend
npm run test:coverage
```

### HTML 报告
```bash
open coverage/index.html
```

### CI 集成
```yaml
# .github/workflows/test.yml
name: Tests
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - run: npm install
      - run: npm run test:coverage
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

---

*测试覆盖计划 | 2026-03-13*
