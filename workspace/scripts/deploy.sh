#!/bin/bash
# OpenClaw Doc Viewer 部署脚本

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="$PROJECT_ROOT/workspace"

echo "🚀 OpenClaw Doc Viewer 部署脚本"
echo "=============================="

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js 18+"
    exit 1
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 未安装，正在安装..."
    sudo npm install -g pm2
fi

# 构建项目
echo ""
echo "🔨 构建项目..."
"$PROJECT_ROOT/scripts/build.sh"

# 启动后端
echo ""
echo "📡 启动后端服务..."
cd "$WORKSPACE/backend"
pm2 start ecosystem.config.js --env production
pm2 save

echo ""
echo "🎉 部署完成!"
echo ""
echo "服务状态：pm2 status"
echo "查看日志：pm2 logs doc-viewer-api"
echo "重启服务：pm2 restart doc-viewer-api"
echo "停止服务：pm2 stop doc-viewer-api"
