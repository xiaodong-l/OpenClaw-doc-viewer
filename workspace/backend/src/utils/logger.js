import pino from 'pino'
import path from 'path'
import { fileURLToPath } from 'url'
import fs from 'fs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export function createLogger(config) {
  const logDir = config.log?.dir || path.join(__dirname, '../../logs')
  
  // 确保日志目录存在
  if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true })
  }
  
  const transports = [
    {
      target: 'pino/file',
      options: {
        destination: path.join(logDir, 'app.log'),
        mkdir: true
      }
    }
  ]
  
  // 开发环境添加控制台输出
  if (config.server?.env === 'development') {
    transports.push({
      target: 'pino/file',
      options: {
        destination: 1 // stdout
      }
    })
  }
  
  return pino({
    level: config.log?.level || 'info',
    transport: {
      targets: transports
    },
    timestamp: pino.stdTimeFunctions.isoTime
  })
}

export default createLogger
