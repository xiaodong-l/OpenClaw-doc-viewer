import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '../.env') })

export default {
  server: {
    port: parseInt(process.env.PORT) || 3000,
    host: process.env.HOST || 'localhost',
    env: process.env.NODE_ENV || 'development'
  },
  
  // 根目录配置
  rootDirs: (process.env.ROOT_DIRS || '/path/to/your/home/.openclaw').split(','),
  
  // JWT 配置
  jwt: {
    secret: process.env.JWT_SECRET || 'change-me-in-production',
    expiresIn: '24h'
  },
  
  // 文件扫描配置
  scan: {
    debounceMs: parseInt(process.env.SCAN_DEBOUNCE_MS) || 1000,
    include: ['**/*.md', '**/*.markdown'],
    exclude: (process.env.EXCLUDE_PATTERNS || 'node_modules,.git,cache,tmp,logs,dist,backups').split(','),
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE_MB) || 10 * 1024 * 1024
  },
  
  // 日志配置
  log: {
    level: process.env.LOG_LEVEL || 'info',
    dir: path.join(__dirname, '../logs')
  }
}
