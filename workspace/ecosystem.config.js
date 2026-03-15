/**
 * PM2 生产环境配置文件
 * 用法：pm2 start ecosystem.config.js --env production
 */

module.exports = {
  apps: [
    {
      name: 'doc-viewer-api',
      script: './backend/src/server.js',
      cwd: '/path/to/your/home/.openclaw/projects/doc-viewer/workspace',
      instances: 1,
      exec_mode: 'cluster',
      
      // 环境变量
      env: {
        NODE_ENV: 'development',
        PORT: 3000,
        HOST: '0.0.0.0',
        ROOT_DIRS: '/path/to/your/home/.openclaw,/path/to/your/home/.openclaw,/path/to/your/home/.openclaw-personal',
        JWT_SECRET: 'doc-viewer-dev-secret-change-in-production',
        LOG_LEVEL: 'info'
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 3000,
        HOST: '0.0.0.0',
        ROOT_DIRS: '/path/to/your/home/.openclaw,/path/to/your/home/.openclaw,/path/to/your/home/.openclaw-personal',
        JWT_SECRET: 'doc-viewer-dev-secret-change-in-production',
        LOG_LEVEL: 'info'
      },
      
      // 日志配置
      error_file: './logs/api-error.log',
      out_file: './logs/api-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      merge_logs: true,
      
      // 重启策略
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      max_restarts: 10,
      min_uptime: '10s',
      
      // 优雅关闭
      kill_timeout: 3000,
      wait_ready: true,
      listen_timeout: 3000,
      
      // 忽略的文件
      ignore_watch: ['logs', 'node_modules', 'frontend', 'data'],
      
      // 源地图支持
      source_map_support: true
    }
  ]
}
