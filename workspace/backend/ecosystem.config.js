/**
 * PM2 配置文件
 */

export default {
  apps: [{
    name: 'doc-viewer-api',
    script: './src/server.js',
    instances: 1,
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'development',
      PORT: 3000
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 3000
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    max_memory_restart: '500M',
    watch: false,
    ignore_watch: ['logs', 'node_modules'],
    merge_logs: true,
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s'
  }]
}
