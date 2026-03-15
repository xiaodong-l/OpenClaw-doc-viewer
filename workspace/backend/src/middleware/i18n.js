/**
 * i18n 中间件 - v2.0.0
 * 国际化支持
 */

import fs from 'fs/promises'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const LOCALES_DIR = path.join(__dirname, '../locales')

/**
 * 支持的语言
 */
export const SUPPORTED_LOCALES = ['zh-CN', 'en-US']
export const DEFAULT_LOCALE = 'zh-CN'

/**
 * 加载语言文件
 */
const localeCache = new Map()

async function loadLocale(locale) {
  if (localeCache.has(locale)) {
    return localeCache.get(locale)
  }

  try {
    const filePath = path.join(LOCALES_DIR, `${locale}.json`)
    const content = await fs.readFile(filePath, 'utf-8')
    const messages = JSON.parse(content)
    localeCache.set(locale, messages)
    return messages
  } catch (err) {
    console.error(`[i18n] 加载语言文件失败：${locale}`, err.message)
    return {}
  }
}

/**
 * 获取语言包
 */
export async function getLocale(locale) {
  const messages = await loadLocale(locale)
  
  // 如果不是默认语言，合并默认语言作为回退
  if (locale !== DEFAULT_LOCALE) {
    const defaultMessages = await loadLocale(DEFAULT_LOCALE)
    return { ...defaultMessages, ...messages }
  }
  
  return messages
}

/**
 * 翻译函数
 */
export function t(messages, key, params = {}) {
  const keys = key.split('.')
  let value = messages
  
  for (const k of keys) {
    if (value && typeof value === 'object' && k in value) {
      value = value[k]
    } else {
      return key // 返回 key 作为回退
    }
  }
  
  if (typeof value === 'string') {
    // 替换参数 {{param}}
    return value.replace(/\{\{(\w+)\}\}/g, (match, param) => {
      return params[param] || match
    })
  }
  
  return value
}

/**
 * i18n 中间件
 */
async function i18nMiddleware(fastify) {
  // 添加装饰器
  fastify.decorate('i18n', {
    getLocale,
    t
  })

  // 添加请求级别的 getLocale 方法
  fastify.addHook('onRequest', async (request, reply) => {
    // 从 Accept-Language 或查询参数获取语言
    const acceptLanguage = request.headers['accept-language'] || DEFAULT_LOCALE
    const queryLocale = request.query.lang || request.query.locale
    
    // 优先级：查询参数 > Accept-Language > 默认
    let locale = queryLocale || acceptLanguage.split(',')[0] || DEFAULT_LOCALE
    
    // 验证语言是否支持
    if (!SUPPORTED_LOCALES.includes(locale)) {
      locale = DEFAULT_LOCALE
    }
    
    // 设置请求级别的语言
    request.locale = locale
    request.messages = await getLocale(locale)
    
    // 添加翻译方法到请求对象
    request.t = (key, params) => t(request.messages, key, params)
  })
}

export default i18nMiddleware
