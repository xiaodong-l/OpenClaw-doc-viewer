# Examples / 示例

**English** | [简体中文](#简体中文)

---

## English

### Overview

This directory contains examples and code snippets for using OpenClaw Doc Viewer.

---

## 📋 Table of Contents

- [API Examples](#api-examples)
- [Deployment Examples](#deployment-examples)
- [Customization Examples](#customization-examples)
- [Integration Examples](#integration-examples)

---

## API Examples

### Authentication

```bash
# Login
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'

# Response
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

### Get Directory Tree

```bash
curl -X GET http://localhost:3000/api/v1/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Search Documents

```bash
curl -X GET "http://localhost:3000/api/v1/search?q=installation" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Create Collection

```bash
curl -X POST http://localhost:3000/api/v1/collections \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "path": "/docs/guide.md",
    "title": "Installation Guide"
  }'
```

---

## Deployment Examples

### Docker Compose

```yaml
# docker-compose.yml
version: '3.8'

services:
  doc-viewer-api:
    image: openclaw/doc-viewer:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - ROOT_DIRS=/docs
      - JWT_SECRET=your-secret-key
    volumes:
      - ./documents:/docs
      - ./data:/app/data

  doc-viewer-web:
    image: openclaw/doc-viewer-web:latest
    ports:
      - "80:80"
    depends_on:
      - doc-viewer-api
```

### Nginx Configuration

```nginx
server {
    listen 443 ssl;
    server_name docs.example.com;

    ssl_certificate /etc/letsencrypt/live/docs.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docs.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### PM2 Configuration

```javascript
// ecosystem.config.js
module.exports = {
  apps: [{
    name: 'doc-viewer',
    script: 'workspace/backend/src/server.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3000
    }
  }]
}
```

---

## Customization Examples

### Custom Theme

```css
/* workspace/frontend/src/assets/custom.css */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --background-color: #ffffff;
  --text-color: #333333;
}

.dark-mode {
  --primary-color: #2980b9;
  --background-color: #1a1a2e;
  --text-color: #eaeaea;
}
```

### Custom Logo

```javascript
// workspace/frontend/src/config/theme.js
export default {
  logo: {
    src: '/assets/custom-logo.png',
    alt: 'My Doc Viewer',
    height: '40px'
  }
}
```

---

## Integration Examples

### WordPress Integration

```php
<?php
// Add to WordPress functions.php
function embed_doc_viewer($atts) {
    $atts = shortcode_atts(array(
        'url' => '',
        'height' => '600px'
    ), $atts);
    
    return '<iframe src="' . esc_url($atts['url']) . '" 
                    style="width:100%;height:' . esc_attr($atts['height']) . ';border:none;">
            </iframe>';
}
add_shortcode('docviewer', 'embed_doc_viewer');

// Usage: [docviewer url="http://docs.example.com/file.md" height="600px"]
?>
```

### React Component

```jsx
// DocViewer.jsx
import React, { useEffect, useState } from 'react';

function DocViewer({ docPath }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/api/v1/files${docPath}`)
      .then(res => res.json())
      .then(data => setContent(data.content));
  }, [docPath]);

  return (
    <div className="doc-viewer">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export default DocViewer;
```

---

## 简体中文

### 概述

本目录包含使用 OpenClaw Doc Viewer 的示例和代码片段。

---

## 📋 目录

- [API 示例](#api-示例)
- [部署示例](#部署示例)
- [定制示例](#定制示例)
- [集成示例](#集成示例)

---

## API 示例

### 认证

```bash
# 登录
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "admin123"
  }'
```

### 获取目录树

```bash
curl -X GET http://localhost:3000/api/v1/files \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 搜索文档

```bash
curl -X GET "http://localhost:3000/api/v1/search?q=installation" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 部署示例

### Docker Compose

```yaml
version: '3.8'

services:
  doc-viewer-api:
    image: openclaw/doc-viewer:latest
    ports:
      - "3000:3000"
    environment:
      - PORT=3000
      - ROOT_DIRS=/docs
      - JWT_SECRET=your-secret-key
    volumes:
      - ./documents:/docs
      - ./data:/app/data
```

### Nginx 配置

```nginx
server {
    listen 443 ssl;
    server_name docs.example.com;

    ssl_certificate /etc/letsencrypt/live/docs.example.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/docs.example.com/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 定制示例

### 自定义主题

```css
/* workspace/frontend/src/assets/custom.css */
:root {
  --primary-color: #3498db;
  --secondary-color: #2ecc71;
  --background-color: #ffffff;
  --text-color: #333333;
}

.dark-mode {
  --primary-color: #2980b9;
  --background-color: #1a1a2e;
  --text-color: #eaeaea;
}
```

---

## 集成示例

### WordPress 集成

```php
<?php
// 添加到 WordPress functions.php
function embed_doc_viewer($atts) {
    $atts = shortcode_atts(array(
        'url' => '',
        'height' => '600px'
    ), $atts);
    
    return '<iframe src="' . esc_url($atts['url']) . '" 
                    style="width:100%;height:' . esc_attr($atts['height']) . ';border:none;">
            </iframe>';
}
add_shortcode('docviewer', 'embed_doc_viewer');

// 使用：[docviewer url="http://docs.example.com/file.md" height="600px"]
?>
```

### React 组件

```jsx
// DocViewer.jsx
import React, { useEffect, useState } from 'react';

function DocViewer({ docPath }) {
  const [content, setContent] = useState('');

  useEffect(() => {
    fetch(`/api/v1/files${docPath}`)
      .then(res => res.json())
      .then(data => setContent(data.content));
  }, [docPath]);

  return (
    <div className="doc-viewer">
      <div dangerouslySetInnerHTML={{ __html: content }} />
    </div>
  );
}

export default DocViewer;
```

---

*More examples coming soon!*

*更多示例即将推出!*
