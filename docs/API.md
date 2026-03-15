# API Reference / API 参考

**English** | [简体中文](#简体中文)

---

## English

### Base URL

```
Development: http://localhost:3000/api/v1
Production: https://your-domain.com/api/v1
```

### Authentication

Most endpoints require authentication via JWT token.

**Login:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

Response:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**Use Token:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## API Endpoints

### Authentication / 认证

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/login` | User login | Public |
| POST | `/auth/logout` | User logout | Required |
| GET | `/auth/me` | Get current user | Required |
| POST | `/auth/register` | Register new user | Configurable |

### Files / 文件

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/files` | Get directory tree | Public |
| GET | `/files/*path` | Get file content | Public |
| GET | `/files/*path/raw` | Get raw content | Public |

### Search / 搜索

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/search?q=keyword` | Search documents | Public |
| GET | `/search/suggest?q=keyword` | Search suggestions | Public |
| POST | `/refresh` | Refresh index | Admin |

### Collections / 收藏

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/collections` | Get user collections | Required |
| POST | `/collections` | Add to collections | Required |
| DELETE | `/collections/:id` | Remove from collections | Required |
| PUT | `/collections/batch` | Batch operations | Required |

### History / 历史

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/user/history` | Get reading history | Required |
| POST | `/user/history` | Add to history | Required |
| DELETE | `/user/history/:id` | Remove from history | Required |

### Shares / 分享

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/shares` | Get user shares | Required |
| POST | `/shares` | Create share link | Required |
| GET | `/shares/:token` | Get shared content | Public |
| DELETE | `/shares/:id` | Delete share | Required |

### Comments / 评论

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/comments?doc=/path` | Get comments for doc | Public |
| POST | `/comments` | Add comment | Required |
| PUT | `/comments/:id` | Edit comment | Required (author) |
| DELETE | `/comments/:id` | Delete comment | Required (author/admin) |
| POST | `/comments/:id/like` | Like comment | Required |

### Users (Admin) / 用户管理

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/auth/users` | List users | Admin |
| POST | `/auth/users` | Create user | Admin |
| PUT | `/auth/users/:id` | Update user | Admin |
| DELETE | `/auth/users/:id` | Delete user | Admin |

### Stats / 统计

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/stats` | Get statistics | Public |
| GET | `/stats/usage` | Usage statistics | Admin |

---

## Response Format / 响应格式

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message"
  }
}
```

### Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | Authentication required |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 400 | Invalid input |
| `SERVER_ERROR` | 500 | Internal server error |

---

## Examples / 示例

### Search Documents

```bash
curl -X GET "http://localhost:3000/api/v1/search?q=installation" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Add to Collections

```bash
curl -X POST "http://localhost:3000/api/v1/collections" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "/docs/guide.md", "title": "Installation Guide"}'
```

### Create Share Link

```bash
curl -X POST "http://localhost:3000/api/v1/shares" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"path": "/docs/public.md", "expiresIn": 86400}'
```

---

## 简体中文

### 基础 URL

```
开发环境：http://localhost:3000/api/v1
生产环境：https://your-domain.com/api/v1
```

### 认证

大多数端点需要通过 JWT 令牌进行认证。

**登录:**
```bash
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "admin",
  "password": "admin123"
}

响应:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

**使用令牌:**
```bash
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## 速率限制 / Rate Limits

### Community Edition

- 100 requests/minute per IP
- 1000 requests/hour per user

### Enterprise Edition

- Custom limits based on plan
- Contact for details

---

## Webhooks (Enterprise) / Webhook (企业版)

Enterprise edition supports webhook integrations for events:

- `user.created`
- `document.shared`
- `comment.added`
- `login.failed`

Configure webhooks in admin dashboard.

---

## SDK / 开发工具包

### JavaScript/Node.js

```javascript
const DocViewer = require('@openclaw/doc-viewer-sdk');

const client = new DocViewer({
  baseUrl: 'https://your-domain.com',
  token: 'YOUR_TOKEN'
});

// Search documents
const results = await client.search('installation');

// Get file content
const content = await client.getFile('/docs/guide.md');
```

### Python

```python
from doc_viewer import DocViewerClient

client = DocViewerClient(
    base_url='https://your-domain.com',
    token='YOUR_TOKEN'
)

# Search documents
results = client.search('installation')

# Get file content
content = client.get_file('/docs/guide.md')
```

---

## Related Documents / 相关文档

- [Quick Start](QUICKSTART.md)
- [Installation](INSTALL.md)
- [Deployment](DEPLOYMENT.md)

---

*API version: v1.0.0*
