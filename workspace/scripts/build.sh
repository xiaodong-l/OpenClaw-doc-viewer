#!/bin/bash
# OpenClaw Doc Viewer 构建脚本

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
WORKSPACE="$PROJECT_ROOT/workspace"

echo "🔨 OpenClaw Doc Viewer 构建脚本"
echo "=============================="

# 构建后端
echo ""
echo "📦 构建后端..."
cd "$WORKSPACE/backend"
npm install
echo "✅ 后端依赖安装完成"

# 构建前端
echo ""
echo "🎨 构建前端..."
cd "$WORKSPACE/frontend"
npm install
npm run build
echo "✅ 前端构建完成"

echo ""
echo "🎉 构建完成!"
echo ""
echo "启动服务:"
echo "  后端：cd $WORKSPACE/backend && npm start"
echo "  前端：cd $WORKSPACE/frontend && npm run dev"
echo ""
echo "生产部署:"
echo "  cd $WORKSPACE/backend && pm2 start ecosystem.config.js --env production"
