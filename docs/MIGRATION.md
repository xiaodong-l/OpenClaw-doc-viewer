# Migration Guide / 迁移指南

**English** | [简体中文](#简体中文)

---

## English

### Overview

This guide helps you migrate between versions of OpenClaw Doc Viewer.

---

## v1.x → v2.0.0 (Enterprise Upgrade)

### Breaking Changes

1. **Configuration Changes**
   - New environment variables required
   - Redis configuration (optional)

2. **Database Schema**
   - User table expanded
   - New audit_logs table

3. **API Changes**
   - Some endpoints moved
   - New authentication flow

### Migration Steps

#### 1. Backup Data

```bash
# Stop the service
pm2 stop doc-viewer-api

# Backup data directory
cp -r workspace/backend/data ~/backup/data-$(date +%Y%m%d)

# Backup configuration
cp workspace/backend/.env ~/backup/.env-$(date +%Y%m%d)
```

#### 2. Update Dependencies

```bash
cd workspace/backend
npm install

cd ../frontend
npm install
```

#### 3. Update Configuration

Add to `.env`:

```bash
# Enterprise features
REDIS_URL=redis://localhost:6379
LDAP_ENABLED=false
SSO_ENABLED=false
MFA_ENABLED=false
```

#### 4. Run Migrations

```bash
cd workspace/backend
npm run migrate
```

#### 5. Update Users

Enterprise edition requires additional user fields:

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",  // NEW: Required
  "role": "admin",
  "mfa_enabled": false,  // NEW
  "last_login": null  // NEW
}
```

#### 6. Restart Service

```bash
pm2 start doc-viewer-api
pm2 logs
```

### Post-Migration Checklist

- [ ] Verify all users can log in
- [ ] Test document viewing
- [ ] Test search functionality
- [ ] Verify collections and history
- [ ] Test new enterprise features
- [ ] Review audit logs

---

## v1.2 → v1.3

### Changes

- New comment system
- Public sharing pages
- Batch operations

### Migration Steps

1. **Update code**
   ```bash
   git pull origin main
   npm install
   ```

2. **No database changes required**

3. **Restart service**
   ```bash
   pm2 restart doc-viewer-api
   ```

---

## v1.1 → v1.2

### Changes

- User collections
- Reading history
- Dark mode
- Avatar upload

### Migration Steps

1. **Update code**
   ```bash
   git pull origin main
   npm install
   ```

2. **Data migration (automatic)**
   - Collections and history tables created automatically
   - No manual intervention needed

3. **Restart service**
   ```bash
   pm2 restart doc-viewer-api
   ```

---

## v1.0 → v1.1

### Changes

- Full-text search with FlexSearch
- Directory tree lazy loading
- Responsive design improvements

### Migration Steps

1. **Update code**
   ```bash
   git pull origin main
   npm install
   ```

2. **Rebuild search index**
   ```bash
   curl -X POST http://localhost:3000/api/v1/refresh
   ```

3. **Restart service**
   ```bash
   pm2 restart doc-viewer-api
   ```

---

## Rollback Procedure

If you need to rollback to a previous version:

### 1. Stop Service

```bash
pm2 stop doc-viewer-api
```

### 2. Restore Backup

```bash
# Restore data
rm -rf workspace/backend/data
cp -r ~/backup/data-YYYYMMDD workspace/backend/data

# Restore config
cp ~/backup/.env-YYYYMMDD workspace/backend/.env
```

### 3. Restore Code

```bash
git checkout <previous-version-tag>
npm install
```

### 4. Restart

```bash
pm2 start doc-viewer-api
```

---

## 简体中文

### 概述

本指南帮助您在 OpenClaw Doc Viewer 版本之间迁移。

---

## v1.x → v2.0.0 (企业版升级)

### 破坏性变更

1. **配置变更**
   - 需要新的环境变量
   - Redis 配置 (可选)

2. **数据库模式**
   - 用户表扩展
   - 新增 audit_logs 表

3. **API 变更**
   - 部分端点移动
   - 新的认证流程

### 迁移步骤

#### 1. 备份数据

```bash
# 停止服务
pm2 stop doc-viewer-api

# 备份数据目录
cp -r workspace/backend/data ~/backup/data-$(date +%Y%m%d)

# 备份配置
cp workspace/backend/.env ~/backup/.env-$(date +%Y%m%d)
```

#### 2. 更新依赖

```bash
cd workspace/backend
npm install

cd ../frontend
npm install
```

#### 3. 更新配置

添加到 `.env`:

```bash
# 企业功能
REDIS_URL=redis://localhost:6379
LDAP_ENABLED=false
SSO_ENABLED=false
MFA_ENABLED=false
```

#### 4. 运行迁移

```bash
cd workspace/backend
npm run migrate
```

#### 5. 更新用户

企业版需要额外的用户字段:

```json
{
  "id": 1,
  "username": "admin",
  "email": "admin@example.com",  // 新增：必需
  "role": "admin",
  "mfa_enabled": false,  // 新增
  "last_login": null  // 新增
}
```

#### 6. 重启服务

```bash
pm2 start doc-viewer-api
pm2 logs
```

### 迁移后检查清单

- [ ] 验证所有用户可以登录
- [ ] 测试文档查看
- [ ] 测试搜索功能
- [ ] 验证收藏和历史
- [ ] 测试新的企业功能
- [ ] 检查审计日志

---

## 回滚流程

如果需要回滚到之前的版本:

### 1. 停止服务

```bash
pm2 stop doc-viewer-api
```

### 2. 恢复备份

```bash
# 恢复数据
rm -rf workspace/backend/data
cp -r ~/backup/data-YYYYMMDD workspace/backend/data

# 恢复配置
cp ~/backup/.env-YYYYMMDD workspace/backend/.env
```

### 3. 恢复代码

```bash
git checkout <previous-version-tag>
npm install
```

### 4. 重启

```bash
pm2 start doc-viewer-api
```

---

## Related Documents / 相关文档

- [Release Notes](docs/RELEASES.md)
- [CHANGELOG](CHANGELOG.md)
- [Installation Guide](docs/INSTALL.md)

---

*Last updated: 2026-03-15*

*For migration support, contact: support@openclaw.ai*
