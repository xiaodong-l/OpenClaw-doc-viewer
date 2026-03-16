# 国内社媒自动化发布脚本

使用 Playwright 浏览器自动化 + Cookies 保存，模拟人工操作发布到各平台。

---

## 🚀 快速开始

### 1. 安装依赖

```bash
cd automation
pip install -r requirements.txt
playwright install
```

### 2. 登录各平台

```bash
# 登录微博
python china_social_auto.py --login weibo

# 登录知乎
python china_social_auto.py --login zhihu

# 登录掘金
python china_social_auto.py --login juejin

# 登录 B 站
python china_social_auto.py --login bilibili

# 登录 V2EX
python china_social_auto.py --login v2ex
```

**说明:**
- 首次运行会打开浏览器
- 手动登录到对应平台
- 登录完成后按回车保存 Cookies
- Cookies 保存在 `cookies/` 目录

### 3. 发布内容

```bash
# 发布到所有平台
python china_social_auto.py --release "v1.4.0" "https://github.com/xiaodong-l/OpenClaw-doc-viewer/releases/tag/v1.4.0"

# 发布到指定平台
python china_social_auto.py --release "v1.4.0" "https://github.com/..." --platform weibo
python china_social_auto.py --release "v1.4.0" "https://github.com/..." --platform zhihu
python china_social_auto.py --release "v1.4.0" "https://github.com/..." --platform juejin

# 发布到多个平台
python china_social_auto.py --release "v1.4.0" "https://github.com/..." --platform all
```

---

## 📱 支持的平台

| 平台 | 状态 | 说明 |
|------|------|------|
| **微博** | ✅ 支持 | 发布文字 + 图片 |
| **知乎** | ✅ 支持 | 发布文章/动态 |
| **掘金** | ✅ 支持 | 发布动态 |
| **B 站** | ✅ 支持 | 发布动态 |
| **V2EX** | ✅ 支持 | 发布帖子 |
| **开源中国** | ⏳ 待实现 | 发布博客 |

---

## 🔧 高级用法

### 无头模式 (服务器运行)

```bash
python china_social_auto.py --release "v1.4.0" "URL" --headless
```

### 自定义内容

编辑脚本中的 `content` 变量，自定义发布内容。

### 定时发布

使用 cron 或 Windows 任务计划程序：

```bash
# 每天 9:00 发布
0 9 * * * cd /path/to/automation && python china_social_auto.py --release "v1.4.0" "URL"
```

---

## 📊 Cookies 管理

### Cookies 位置

```
automation/
├── cookies/
│   ├── weibo.json
│   ├── zhihu.json
│   ├── juejin.json
│   ├── bilibili.json
│   └── v2ex.json
```

### 刷新 Cookies

如果登录过期，重新运行登录命令：

```bash
python china_social_auto.py --login weibo
```

### 删除 Cookies

```bash
rm cookies/weibo.json
```

---

## ⚠️ 注意事项

### 1. 频率限制

不要过于频繁发布，避免被封号：

- 微博：每小时不超过 5 条
- 知乎：每小时不超过 3 条
- 掘金：每小时不超过 5 条
- B 站：每小时不超过 3 条
- V2EX：每天不超过 5 条

### 2. 内容合规

- 避免敏感词
- 不要纯广告
- 提供真实价值
- 遵守平台规则

### 3. 浏览器指纹

- 使用真实 User-Agent
- 不要频繁切换 IP
- 模拟人工操作间隔

---

## 🔗 与 GitHub 集成

### GitHub Actions 自动发布

创建 `.github/workflows/auto-publish.yml`:

```yaml
name: Auto Publish to China Social Media

on:
  release:
    types: [published]

jobs:
  publish:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: '3.11'
      
      - name: Install dependencies
        run: |
          cd automation
          pip install -r requirements.txt
          playwright install
      
      - name: Publish to social media
        run: |
          cd automation
          python china_social_auto.py \
            --release "${{ github.event.release.tag_name }}" \
            --url "${{ github.event.release.html_url }}" \
            --platform all
        env:
          # Cookies 需要通过 Secrets 传递
          WEIBO_COOKIES: ${{ secrets.WEIBO_COOKIES }}
          ZHIHU_COOKIES: ${{ secrets.ZHIHU_COOKIES }}
          JUEJIN_COOKIES: ${{ secrets.JUEJIN_COOKIES }}
```

### 本地自动化

结合 n8n 或 cron：

```bash
# n8n webhook 触发
curl -X POST http://your-server:5678/webhook/social-publish \
  -H "Content-Type: application/json" \
  -d '{"release": "v1.4.0", "url": "https://..."}'
```

---

## 🐛 故障排除

### 问题 1: Cookies 加载失败

**解决:**
```bash
# 删除旧 Cookies
rm cookies/*.json

# 重新登录
python china_social_auto.py --login weibo
```

### 问题 2: 发布失败

**解决:**
- 检查网络连接
- 检查 Cookies 是否过期
- 手动打开浏览器测试

### 问题 3: 选择器找不到

**解决:**
- 平台可能更新了 UI
- 需要更新脚本中的选择器
- 使用浏览器开发者工具查找新选择器

---

## 📝 示例输出

```
📱 发布微博...
✅ 微博 Cookies 加载成功
✅ 内容已输入
✅ 微博发布成功！

📖 发布知乎...
✅ 知乎 Cookies 加载成功
✅ 标题已输入
✅ 内容已输入
✅ 知乎发布成功！

🥕 发布掘金...
✅ 掘金 Cookies 加载成功
✅ 内容已输入
✅ 掘金发布成功！
```

---

## 🎯 下一步

1. **测试各平台登录**
2. **测试发布功能**
3. **配置定时任务**
4. **集成 GitHub Actions**

---

*Last updated: 2026-03-16*
