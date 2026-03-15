/**
 * 应用配置
 */

import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default {
  server: {
    host: process.env.HOST || '0.0.0.0',
    port: parseInt(process.env.PORT || '3000')
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'doc-viewer-jwt-secret-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '24h',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    credentials: true
  },
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    dest: path.join(__dirname, '../../uploads')
  },
  data: {
    dir: path.join(__dirname, '../../data')
  },
  logs: {
    dir: path.join(__dirname, '../../logs'),
    level: process.env.LOG_LEVEL || 'info'
  },
  log: {
    level: process.env.LOG_LEVEL || 'info'
  },
  scan: {
    watch: process.env.SCAN_WATCH === 'true',
    interval: parseInt(process.env.SCAN_INTERVAL || '300000'), // 5 分钟
    exclude: ['node_modules', '.git', 'dist', 'build'],
    maxFileSize: 10 // MB
  },
  rootDirs: (process.env.ROOT_DIRS || '/path/to/your/home/.openclaw/projects/doc-viewer/workspace/docs').split(','),
  encryption: {
    algorithm: 'aes-256-gcm',
    iterations: 100000,
    hash: 'sha256'
  },
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || null,
    db: parseInt(process.env.REDIS_DB || '0')
  },
  email: {
    from: process.env.EMAIL_FROM || 'noreply@doc-viewer.com',
    smtp: {
      host: process.env.SMTP_HOST || 'smtp.example.com',
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
      }
    }
  }
}
