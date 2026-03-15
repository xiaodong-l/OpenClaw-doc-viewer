#!/bin/bash
# OpenClaw Doc Viewer 监控设置脚本

set -e

echo "📊 OpenClaw Doc Viewer 监控设置"
echo "=============================="

# 创建日志目录
LOG_DIR="/path/to/your/home/.openclaw/projects/doc-viewer/workspace/logs"
mkdir -p "$LOG_DIR"

# =====================
# PM2 监控
# =====================
echo ""
echo "📈 配置 PM2 监控..."

# 检查 PM2 是否安装
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2 未安装，正在安装..."
    sudo npm install -g pm2
fi

# 启动 PM2 监控
pm2 install pm2-logrotate

# 配置日志轮转
pm2 set pm2-logrotate:max_size 10M
pm2 set pm2-logrotate:retain 7
pm2 set pm2-logrotate:compress true

echo "✅ PM2 日志轮转已配置"

# =====================
# 系统监控脚本
# =====================
echo ""
echo "📝 创建监控脚本..."

MONITOR_SCRIPT="$LOG_DIR/monitor.sh"
cat > "$MONITOR_SCRIPT" << 'EOF'
#!/bin/bash
# Doc Viewer 监控脚本

LOG_FILE="/path/to/your/home/.openclaw/projects/doc-viewer/workspace/logs/monitor.log"
ALERT_EMAIL="admin@localhost"

# 检查后端服务
check_api() {
    if ! curl -s http://localhost:3000/health > /dev/null; then
        echo "$(date): ❌ API 服务异常" >> "$LOG_FILE"
        # 可以添加邮件告警
        # echo "API 服务异常" | mail -s "Doc Viewer 告警" "$ALERT_EMAIL"
        return 1
    fi
    echo "$(date): ✅ API 服务正常" >> "$LOG_FILE"
    return 0
}

# 检查磁盘空间
check_disk() {
    local usage=$(df /home | tail -1 | awk '{print $5}' | sed 's/%//')
    if [ "$usage" -gt 90 ]; then
        echo "$(date): ⚠️  磁盘使用率 ${usage}%" >> "$LOG_FILE"
        return 1
    fi
    echo "$(date): ✅ 磁盘使用率 ${usage}%" >> "$LOG_FILE"
    return 0
}

# 检查内存使用
check_memory() {
    local usage=$(free | grep Mem | awk '{printf("%.0f", $3/$2 * 100.0)}')
    if [ "$usage" -gt 90 ]; then
        echo "$(date): ⚠️  内存使用率 ${usage}%" >> "$LOG_FILE"
        return 1
    fi
    echo "$(date): ✅ 内存使用率 ${usage}%" >> "$LOG_FILE"
    return 0
}

# 检查 PM2 进程
check_pm2() {
    if ! pm2 status | grep -q "online"; then
        echo "$(date): ❌ PM2 进程异常" >> "$LOG_FILE"
        return 1
    fi
    echo "$(date): ✅ PM2 进程正常" >> "$LOG_FILE"
    return 0
}

# 执行检查
echo "=== 监控检查 $(date) ===" >> "$LOG_FILE"
check_api
check_disk
check_memory
check_pm2
EOF

chmod +x "$MONITOR_SCRIPT"
echo "✅ 监控脚本已创建：$MONITOR_SCRIPT"

# =====================
# 定时任务
# =====================
echo ""
echo "⏰ 配置定时监控任务..."

# 添加到 crontab
CRON_ENTRY="*/5 * * * * $MONITOR_SCRIPT"
(crontab -l 2>/dev/null | grep -v "$MONITOR_SCRIPT"; echo "$CRON_ENTRY") | crontab -

echo "✅ 定时任务已配置 (每 5 分钟执行一次)"

# =====================
# 日志查看脚本
# =====================
echo ""
echo "📋 创建日志查看脚本..."

VIEW_LOG_SCRIPT="$LOG_DIR/view-logs.sh"
cat > "$VIEW_LOG_SCRIPT" << 'EOF'
#!/bin/bash
# 日志查看脚本

LOG_DIR="/path/to/your/home/.openclaw/projects/doc-viewer/workspace/logs"

echo "=== Doc Viewer 日志查看 ==="
echo ""
echo "1. API 错误日志"
echo "2. API 输出日志"
echo "3. 监控日志"
echo "4. PM2 状态"
echo "5. 实时日志"
echo ""
read -p "选择 (1-5): " choice

case $choice in
    1)
        tail -100 "$LOG_DIR/api-error.log"
        ;;
    2)
        tail -100 "$LOG_DIR/api-out.log"
        ;;
    3)
        tail -100 "$LOG_DIR/monitor.log"
        ;;
    4)
        pm2 status
        ;;
    5)
        tail -f "$LOG_DIR"/*.log
        ;;
    *)
        echo "无效选择"
        ;;
esac
EOF

chmod +x "$VIEW_LOG_SCRIPT"
echo "✅ 日志查看脚本已创建：$VIEW_LOG_SCRIPT"

# =====================
# 完成
# =====================
echo ""
echo "✅ 监控设置完成!"
echo ""
echo "使用方式:"
echo "  查看监控：$VIEW_LOG_SCRIPT"
echo "  PM2 状态：pm2 status"
echo "  PM2 日志：pm2 logs"
echo "  监控日志：tail -f $LOG_DIR/monitor.log"
echo ""
echo "告警配置:"
echo "  编辑 $MONITOR_SCRIPT 添加邮件告警"
echo ""
