#!/bin/bash
# OpenClaw Doc Viewer SSL 证书设置脚本
# 使用 Let's Encrypt 免费证书

set -e

# 配置
DOMAIN="${1:-docs.yourdomain.com}"  # 从参数获取域名，否则使用默认值
EMAIL="${2:-admin@localhost}"       # 从参数获取邮箱，否则使用默认值

echo "🔐 OpenClaw Doc Viewer SSL 证书设置"
echo "=================================="
echo "域名：$DOMAIN"
echo "邮箱：$EMAIL"
echo ""

# 检查是否已安装 certbot
if ! command -v certbot &> /dev/null; then
    echo "⚠️  Certbot 未安装，正在安装..."
    sudo apt update
    sudo apt install -y certbot python3-certbot-nginx
fi

# 检查 Nginx 配置
NGINX_CONF="/path/to/your/home/.openclaw/projects/doc-viewer/workspace/config/nginx.conf"
if [ ! -f "$NGINX_CONF" ]; then
    echo "❌ Nginx 配置文件不存在：$NGINX_CONF"
    exit 1
fi

# 更新 Nginx 配置中的域名
echo "📝 更新 Nginx 配置..."
sed -i "s/docs.yourdomain.com/$DOMAIN/g" "$NGINX_CONF"

# 复制 Nginx 配置
echo "📋 复制 Nginx 配置..."
sudo cp "$NGINX_CONF" /etc/nginx/sites-available/doc-viewer
sudo ln -sf /etc/nginx/sites-available/doc-viewer /etc/nginx/sites-enabled/doc-viewer

# 测试 Nginx 配置
echo "🧪 测试 Nginx 配置..."
sudo nginx -t

# 重载 Nginx
echo "🔄 重载 Nginx..."
sudo systemctl reload nginx

# 获取 SSL 证书
echo "📜 获取 SSL 证书..."
sudo certbot --nginx \
    -d "$DOMAIN" \
    --email "$EMAIL" \
    --agree-tos \
    --redirect \
    --hsts \
    --staple-ocsp \
    --eff-email \
    --non-interactive

# 验证证书
echo ""
echo "✅ SSL 证书设置完成!"
echo ""
echo "证书位置:"
echo "  证书：/etc/letsencrypt/live/$DOMAIN/fullchain.pem"
echo "  私钥：/etc/letsencrypt/live/$DOMAIN/privkey.pem"
echo ""
echo "自动续期:"
echo "  Certbot 已配置自动续期"
echo "  测试续期：sudo certbot renew --dry-run"
echo ""
echo "访问地址:"
echo "  https://$DOMAIN"
echo ""

# 检查证书有效期
echo "📅 证书信息:"
sudo certbot certificates
