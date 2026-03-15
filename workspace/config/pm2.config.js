/**
 * PM2 生产环境配置文件
 * 用法：pm2 start pm2.config.js
 */

module.exports = {
  apps: [
    {
      // =====================
      // 后端 API 服务
      // =====================
      name: 'doc-viewer-api',
      script: './backend/src/server.js',
      cwd: '/path/to/your/home/.openclaw/projects/doc-viewer/workspace',
      instances: 1,
      exec_mode: 'cluster',
      
      // 环境变量
      env: {
        NODE_ENV: 'development',
        HOST: '0.0.0.0',
        PORT: 3000,
        ROOT_DIRS: '/path/to/your/home/.openclaw,/path/to/your/home/.openclaw,/path/to/your/home/.openclaw-personal'
      },
      env_production: {
        NODE_ENV: 'production',
        HOST: '0.0.0.0',
        PORT: 3000,
        ROOT_DIRS: '/path/to/your/home/.openclaw,/path/to/your/home/.openclaw,/path/to/your/home/.openclaw-personal'
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
    },
    
    {
      // =====================
      // 前端静态服务 (可选，生产环境建议用 Nginx)
      // =====================
      name: 'doc-viewer-frontend',
      script: 'serve',
      args: '-s -l 5173 ./frontend/dist',
      cwd: '/path/to/your/home/.openclaw/projects/doc-viewer/workspace',
      
      // 仅开发环境使用
      env: {
        NODE_ENV: 'development'
      },
      
      // 日志
      error_file: './logs/frontend-error.log',
      out_file: './logs/frontend-out.log',
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
      
      // 重启策略
      autorestart: true,
      max_memory_restart: '200M'
    }
  ]
}
