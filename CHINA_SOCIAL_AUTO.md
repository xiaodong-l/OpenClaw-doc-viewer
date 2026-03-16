# 国内社媒自动化发布完整方案

**日期:** 2026-03-16

---

## 📱 支持的平台及方案

| 平台 | 自动化方案 | 难度 | API 文档 |
|------|-----------|------|---------|
| **微博** | n8n + 微博 API | 中等 | [链接](https://open.weibo.com/wiki/API 文档) |
| **知乎** | n8n + 知乎 API | 中等 | [链接](https://developers.zhihu.com/docs) |
| **掘金** | n8n + 掘金黄油 API | 简单 | [链接](https://juejin.cn) |
| **微信公众号** | 第三方服务 | 简单 | [链接](https://developers.weixin.qq.com/doc) |
| **B 站动态** | 手动/脚本 | 困难 | - |
| **V2EX** | 手动 | 简单 | - |
| **开源中国** | 手动/RSS | 简单 | - |

---

## 🤖 方案 A: n8n 自动化工作流

### 架构图

```
┌─────────────────┐
│  GitHub Release │
│    Webhook      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│      n8n        │
│   Workflow      │
└────────┬────────┘
         │
    ┌────┴────┬────────────┬────────────┐
    ▼         ▼            ▼            ▼
┌────────┐ ┌────────┐ ┌────────┐ ┌──────────┐
│  微博  │ │  知乎  │ │  掘金  │ │ 企业微信 │
│  API   │ │  API   │ │  API   │ │  机器人  │
└────────┘ └────────┘ └────────┘ └──────────┘
```

---

### n8n 工作流配置

#### 1. GitHub Release 触发

```json
{
  "name": "GitHub Release Trigger",
  "nodes": [
    {
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.webhook",
      "parameters": {
        "httpMethod": "POST",
        "path": "github-release",
        "responseMode": "lastNode"
      }
    },
    {
      "name": "Check Event",
      "type": "n8n-nodes-base.switch",
      "parameters": {
        "dataType": "string",
        "value1": "{{$json.body.action}}",
        "rules": [
          {
            "value2": "published",
            "output": 0
          }
        ]
      }
    }
  ]
}
```

---

#### 2. 微博发布节点

**方式 1: 微博 API (需要企业资质)**

```json
{
  "name": "Weibo Post",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.weibo.com/2/statuses/update.json",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "weiboOAuth2Api",
    "body": {
      "status": "🎉 {{$json.body.release.name}} 发布！\n\n{{$json.body.release.body}}\n\n链接：{{$json.body.release.html_url}}\n\n#OpenClaw #开源 #Vue3 #NodeJS",
      "source": "YOUR_APP_KEY"
    }
  }
}
```

**方式 2: 蚁小二 API (第三方)**

```json
{
  "name": "Yixiaoer Post",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.yixiaoer.com/v1/post",
    "headers": {
      "Authorization": "Bearer YOUR_API_KEY"
    },
    "body": {
      "platform": "weibo",
      "content": "🎉 {{$json.body.release.name}} 发布！\n\n链接：{{$json.body.release.html_url}}",
      "schedule_time": "{{$dateTime.now().plus(1, 'minute').format('YYYY-MM-DD HH:mm:ss')}}"
    }
  }
}
```

---

#### 3. 知乎发布节点

**方式 1: 知乎 API (需要申请)**

```json
{
  "name": "Zhihu Post",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://www.zhihu.com/api/v4/answers",
    "authentication": "predefinedCredentialType",
    "nodeCredentialType": "zhihuOAuth2Api",
    "body": {
      "content": "# {{$json.body.release.name}}\n\n{{$json.body.release.body}}\n\nGitHub: {{$json.body.release.html_url}}",
      "question_id": "YOUR_QUESTION_ID"
    }
  }
}
```

**方式 2: 发布到专栏 (推荐)**

```json
{
  "name": "Zhihu Article",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://zhuanlan.zhihu.com/api/articles",
    "headers": {
      "Authorization": "Bearer YOUR_ZHIHU_TOKEN",
      "Content-Type": "application/json"
    },
    "body": {
      "title": "🎉 {{$json.body.release.name}} - OpenClaw 文档查看器",
      "content": "<h1>{{$json.body.release.name}}</h1><p>{{$json.body.release.body}}</p><p>GitHub: <a href='{{$json.body.release.html_url}}'>链接</a></p>",
      "column_id": "YOUR_COLUMN_ID"
    }
  }
}
```

---

#### 4. 掘金发布节点

**方式 1: 掘金黄油 API**

```json
{
  "name": "Juejin Post",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.juejin.cn/content_api/v1/content/article/create",
    "headers": {
      "Cookie": "cookie_name=YOUR_COOKIE_VALUE",
      "Content-Type": "application/json"
    },
    "body": {
      "title": "🎉 {{$json.body.release.name}} - OpenClaw 文档查看器",
      "content": "# {{$json.body.release.name}}\n\n{{$json.body.release.body}}\n\nGitHub: {{$json.body.release.html_url}}",
      "category_id": "680963776754323456",
      "tags": ["680963596962089384", "680963596962089385"]
    }
  }
}
```

**方式 2: 发布动态**

```json
{
  "name": "Juejin Dynamic",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.juejin.cn/dynamic_api/v1/dynamic/create",
    "headers": {
      "Cookie": "cookie_name=YOUR_COOKIE_VALUE"
    },
    "body": {
      "content": "🎉 {{$json.body.release.name}} 发布！\n\n{{$json.body.release.body}}\n\n链接：{{$json.body.release.html_url}}",
      "type": 1
    }
  }
}
```

---

#### 5. 微信公众号 (第三方服务)

**使用第三方服务 (如：微小宝、新媒体管家)**

```json
{
  "name": "WeChat Official Account",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://api.weixin.qq.com/cgi-bin/message/custom/send",
    "qs": {
      "access_token": "YOUR_ACCESS_TOKEN"
    },
    "body": {
      "touser": "OPENID",
      "msgtype": "news",
      "news": {
        "articles": [
          {
            "title": "🎉 {{$json.body.release.name}}",
            "description": "{{$json.body.release.body}}",
            "url": "{{$json.body.release.html_url}}",
            "picurl": "https://your-image-url.com/release.jpg"
          }
        ]
      }
    }
  }
}
```

---

#### 6. 企业微信/钉钉通知 (备选)

**企业微信机器人:**

```json
{
  "name": "WeCom Bot",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY",
    "body": {
      "msgtype": "markdown",
      "markdown": {
        "content": "## 🎉 {{$json.body.release.name}}\n\n**版本:** {{$json.body.release.tag_name}}\n\n**链接:** [GitHub]({{$json.body.release.html_url}})\n\n**内容:**\n{{$json.body.release.body}}"
      }
    }
  }
}
```

**钉钉机器人:**

```json
{
  "name": "DingTalk Bot",
  "type": "n8n-nodes-base.httpRequest",
  "parameters": {
    "method": "POST",
    "url": "https://oapi.dingtalk.com/robot/send?access_token=YOUR_TOKEN",
    "body": {
      "msgtype": "markdown",
      "markdown": {
        "title": "🎉 新版本发布",
        "text": "## 🎉 {{$json.body.release.name}}\n\n**版本:** {{$json.body.release.tag_name}}\n\n**链接:** [GitHub]({{$json.body.release.html_url}})\n\n**内容:**\n{{$json.body.release.body}}"
      }
    }
  }
}
```

---

## 📋 完整 n8n 工作流 JSON

```json
{
  "name": "China Social Media Auto-Post",
  "nodes": [
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "github-release",
        "responseMode": "lastNode"
      },
      "id": "webhook",
      "name": "GitHub Webhook",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.weibo.com/2/statuses/update.json",
        "authentication": "predefinedCredentialType",
        "nodeCredentialType": "weiboOAuth2Api",
        "body": {
          "status": "🎉 {{$json.body.release.name}} 发布！\n\n链接：{{$json.body.release.html_url}}\n\n#OpenClaw #开源 #Vue3 #NodeJS"
        }
      },
      "id": "weibo",
      "name": "Weibo Post",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://api.juejin.cn/content_api/v1/content/article/create",
        "headers": {
          "Cookie": "cookie_name=YOUR_COOKIE_VALUE"
        },
        "body": {
          "title": "🎉 {{$json.body.release.name}}",
          "content": "# {{$json.body.release.name}}\n\nGitHub: {{$json.body.release.html_url}}",
          "category_id": "680963776754323456"
        }
      },
      "id": "juejin",
      "name": "Juejin Post",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3
    },
    {
      "parameters": {
        "method": "POST",
        "url": "https://qyapi.weixin.qq.com/cgi-bin/webhook/send?key=YOUR_KEY",
        "body": {
          "msgtype": "markdown",
          "markdown": {
            "content": "## 🎉 {{$json.body.release.name}}\n\n链接：[GitHub]({{$json.body.release.html_url}})"
          }
        }
      },
      "id": "wecom",
      "name": "WeCom Bot",
      "type": "n8n-nodes-base.httpRequest",
      "typeVersion": 3
    }
  ],
  "connections": {
    "GitHub Webhook": {
      "main": [
        [
          {
            "node": "Weibo Post",
            "type": "main",
            "index": 0
          },
          {
            "node": "Juejin Post",
            "type": "main",
            "index": 0
          },
          {
            "node": "WeCom Bot",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "settings": {
    "timezone": "Asia/Shanghai"
  }
}
```

---

## 🔑 API 配置清单

### 微博 API

| 配置项 | 说明 | 获取方式 |
|--------|------|---------|
| App Key | 应用标识 | [微博开放平台](https://open.weibo.com) |
| App Secret | 应用密钥 | 同上 |
| Access Token | 访问令牌 | OAuth 2.0 获取 |

### 知乎 API

| 配置项 | 说明 | 获取方式 |
|--------|------|---------|
| Client ID | 客户端 ID | [知乎开放平台](https://developers.zhihu.com) |
| Client Secret | 客户端密钥 | 同上 |
| Access Token | 访问令牌 | OAuth 2.0 获取 |

### 掘金 API

| 配置项 | 说明 | 获取方式 |
|--------|------|---------|
| Cookie | 登录凭证 | 浏览器开发者工具获取 |
| Category ID | 分类 ID | 固定值或自定义 |

### 微信公众号

| 配置项 | 说明 | 获取方式 |
|--------|------|---------|
| AppID | 公众号 ID | 微信公众平台 |
| AppSecret | 公众号密钥 | 同上 |
| Access Token | 访问令牌 | API 获取 |

---

## 📊 方案对比

| 方案 | 成本 | 自动化程度 | 推荐度 |
|------|------|-----------|--------|
| **n8n + API** | 低 | 100% | ⭐⭐⭐⭐⭐ |
| **第三方工具** | 中 | 100% | ⭐⭐⭐⭐ |
| **半自动 (钉钉)** | 低 | 50% | ⭐⭐⭐⭐ |
| **纯手动** | 0 | 0% | ⭐⭐ |

---

## 🎯 推荐实施步骤

### 第 1 阶段：半自动化 (今日)

1. **配置 GitHub webhook → 钉钉/企业微信**
2. **人工复制内容到各平台**
3. **预计时间:** 30 分钟

### 第 2 阶段：部分自动化 (本周)

1. **配置 n8n 工作流**
2. **接入掘金 API (最简单)**
3. **接入企业微信/钉钉**
4. **预计时间:** 2 小时

### 第 3 阶段：全自动化 (下周)

1. **接入微博 API**
2. **接入知乎 API**
3. **配置微信公众号**
4. **预计时间:** 4 小时

---

## ⚠️ 注意事项

### API 限制

| 平台 | 频率限制 | 内容审核 |
|------|---------|---------|
| 微博 | 100 次/小时 | 是 |
| 知乎 | 50 次/小时 | 是 |
| 掘金 | 200 次/小时 | 是 |
| 微信公众号 | 100 次/天 | 严格 |

### 内容合规

- 避免敏感词
- 遵守平台规则
- 不要过度营销
- 提供真实价值

---

*Last updated: 2026-03-16 03:15 UTC*
