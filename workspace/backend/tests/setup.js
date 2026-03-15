/**
 * Vitest 测试配置文件
 */

import { beforeAll, afterAll, afterEach } from 'vitest'
import { buildApp } from '../src/app.js'

let app = null
let testServer = null

/**
 * 获取测试应用实例
 */
export async function getTestApp() {
  if (!app) {
    app = await buildApp({
      logger: { level: 'silent' }
    })
  }
  return app
}

/**
 * 启动测试服务器
 */
export async function startTestServer() {
  if (!testServer) {
    const testApp = await getTestApp()
    testServer = await testApp.listen({ port: 0, host: 'localhost' })
  }
  return testServer
}

/**
 * 关闭测试服务器
 */
export async function stopTestServer() {
  if (testServer) {
    await testServer.close()
    testServer = null
  }
  if (app) {
    await app.close()
    app = null
  }
}

// 全局钩子 - 每个测试文件独立运行，不需要全局服务器
// beforeAll(async () => {
//   console.log('🧪 启动测试服务器...')
//   await startTestServer()
// })

// afterAll(async () => {
//   console.log('🧪 关闭测试服务器...')
//   await stopTestServer()
// })

// 导出供测试使用
export { app, testServer }
