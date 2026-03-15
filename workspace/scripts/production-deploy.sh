#!/bin/bash
# OpenClaw Doc Viewer 生产环境部署脚本

set -e

PROJECT_ROOT="/path/to/your/home/.openclaw/projects/doc-viewer"
WORKSPACE="$PROJECT_ROOT/workspace"

echo "🚀 OpenClaw Doc Viewer 生产环境部署"
echo "=================================="
echo ""

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# =====================
# 1. 检查环境
# =====================
log_info "检查环境..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    log_error "Node.js 未安装"
    echo "请安装 Node.js 18+: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    log_error "Node.js 版本过低 (需要 18+, 当前：$NODE_VERSION)"
    exit 1
fi

log_info "Node.js 版本：$(node -v) ✅"

# 检查 npm
if ! command -v npm &> /dev/null; then
    log_error "npm 未安装"
    exit 1
fi

log_info "npm 版本：$(npm -v) ✅"

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    log_warn "PM2 未安装，正在安装..."
    sudo npm install -g pm2
fi

log_info "PM2 版本：$(pm2 -v) ✅"

# 检查 Nginx
if ! command -v nginx &> /dev/null; then
    log_warn "Nginx 未安装"
    echo "是否安装 Nginx? (y/n)"
    read -r install_nginx
    if [ "$install_nginx" = "y" ]; then
        sudo apt update
        sudo apt install -y nginx
    fi
fi

log_info "Nginx 版本：$(nginx -v 2>&1) ✅"

# =====================
# 2. 安装依赖
# =====================
log_info "安装依赖..."

# 后端依赖
cd "$WORKSPACE/backend"
npm install --production
log_info "后端依赖安装完成 ✅"

# 前端依赖
cd "$WORKSPACE/frontend"
npm install
log_info "前端依赖安装完成 ✅"

# =====================
# 3. 构建前端
# =====================
log_info "构建前端..."

cd "$WORKSPACE/frontend"
npm run build

log_info "前端构建完成 ✅"
log_info "构建输出：$WORKSPACE/frontend/dist"

# =====================
# 4. 配置环境变量
# =====================
log_info "配置环境变量..."

ENV_FILE="$WORKSPACE/backend/.env"
if [ ! -f "$ENV_FILE" ]; then
    cp "$ENV_FILE.example" "$ENV_FILE"
    
    # 生成随机 JWT Secret
    JWT_SECRET=$(openssl rand -hex 32)
    sed -i "s/JWT_SECRET=.*/JWT_SECRET=$JWT_SECRET/" "$ENV_FILE"
    
    log_info "已生成 JWT Secret ✅"
fi

# =====================
# 5. 启动服务
# =====================
log_info "启动服务..."

cd "$WORKSPACE"

# 停止旧服务
pm2 stop doc-viewer-api 2>/dev/null || true
pm2 delete doc-viewer-api 2>/dev/null || true

# 启动新服务
pm2 start config/pm2.config.js --env production

# 保存 PM2 配置
pm2 save

# 设置开机启动
pm2 startup | tail -1 | bash 2>/dev/null || true

log_info "服务启动完成 ✅"

# =====================
# 6. 配置 Nginx (可选)
# =====================
log_info "配置 Nginx..."

if command -v nginx &> /dev/null; then
    echo "是否配置 Nginx 反向代理？(y/n)"
    read -r config_nginx
    
    if [ "$config_nginx" = "y" ]; then
        echo "请输入域名 (例如：docs.example.com):"
        read -r domain
        
        echo "请输入邮箱 (用于 SSL 证书):"
        read -r email
        
        # 运行 SSL 设置脚本
        chmod +x "$PROJECT_ROOT/scripts/ssl-setup.sh"
        "$PROJECT_ROOT/scripts/ssl-setup.sh" "$domain" "$email"
        
        log_info "Nginx 配置完成 ✅"
    fi
fi

# =====================
# 7. 配置监控 (可选)
# =====================
log_info "配置监控..."

chmod +x "$PROJECT_ROOT/scripts/monitoring-setup.sh"
"$PROJECT_ROOT/scripts/monitoring-setup.sh"

log_info "监控配置完成 ✅"

# =====================
# 8. 验证部署
# =====================
log_info "验证部署..."

sleep 3

# 检查 API 健康
if curl -s http://localhost:3000/health | grep -q "ok"; then
    log_info "API 健康检查通过 ✅"
else
    log_error "API 健康检查失败"
fi

# 检查 PM2 状态
echo ""
log_info "PM2 进程状态:"
pm2 status

# =====================
# 完成
# =====================
echo ""
echo "=================================="
log_info "🎉 部署完成!"
echo "=================================="
echo ""
echo "服务地址:"
echo "  API: http://localhost:3000"
echo "  前端：http://localhost:5173 (开发) 或 https://yourdomain.com (生产)"
echo ""
echo "管理命令:"
echo "  查看状态：pm2 status"
echo "  查看日志：pm2 logs"
echo "  重启服务：pm2 restart doc-viewer-api"
echo "  停止服务：pm2 stop doc-viewer-api"
echo "  删除服务：pm2 delete doc-viewer-api"
echo ""
echo "日志位置:"
echo "  $WORKSPACE/logs/"
echo ""
echo "监控:"
echo "  查看监控：$WORKSPACE/logs/view-logs.sh"
echo "  监控日志：tail -f $WORKSPACE/logs/monitor.log"
echo ""
