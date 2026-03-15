/**
 * 搜索索引服务
 * 使用 FlexSearch 实现全文搜索
 */

import FlexSearch from 'flexsearch'
import fs from 'fs/promises'
import path from 'path'

export class SearchIndex {
  constructor(config) {
    this.config = config
    this.documents = new Map() // 存储文档元数据
    this.index = null
    this.initialized = false
  }

  /**
   * 初始化搜索索引
   */
  async initialize() {
    if (this.initialized) return

    // 创建 FlexSearch 文档索引
    this.index = new FlexSearch.Document({
      tokenize: 'forward',
      charset: 'latin:extra',
      optimize: true,
      document: {
        id: 'id',
        index: ['title', 'content', 'excerpt'],
        store: ['title', 'path', 'name', 'updatedAt', 'excerpt']
      }
    })

    this.initialized = true
    console.log('[SearchIndex] Initialized')
  }

  /**
   * 添加文档到索引
   */
  async add(document) {
    if (!this.initialized) {
      await this.initialize()
    }

    const content = String(document.content || '')
    const doc = {
      id: document.id || this.generateId(document.path),
      title: String(document.title || document.name || ''),
      content: content,
      excerpt: String(document.excerpt || this.generateExcerpt(content)),
      path: String(document.path || ''),
      name: String(document.name || ''),
      updatedAt: document.updatedAt || new Date().toISOString()
    }

    try {
      this.index.add(doc)
      this.documents.set(doc.id, doc)
    } catch (err) {
      // 文档已存在，先删除再添加
      try {
        await this.remove(doc.id)
      } catch (e) {}
      try {
        this.index.add(doc)
        this.documents.set(doc.id, doc)
      } catch (e) {
        console.error(`[SearchIndex] Error adding ${doc.path}:`, e.message)
      }
    }

    return doc
  }

  /**
   * 从索引中移除文档
   */
  async remove(id) {
    try {
      this.index.remove(id)
      this.documents.delete(id)
      console.log(`[SearchIndex] Removed document: ${id}`)
    } catch (err) {
      console.error(`[SearchIndex] Error removing document: ${err.message}`)
    }
  }

  /**
   * 搜索文档
   */
  search(query, options = {}) {
    if (!this.initialized) {
      throw new Error('Search index not initialized')
    }

    const {
      limit = 20,
      offset = 0,
      path: pathFilter,
      timeRange
    } = options

    // 执行搜索
    const results = this.index.search(query, {
      limit: limit + offset,
      suggest: true
    })

    // 处理搜索结果
    let hits = []
    
    // results 格式：[{ field: 'title', result: [...] }, { field: 'content', result: [...] }]
    const docIds = new Set()
    results.forEach(result => {
      result.result.forEach(id => docIds.add(id))
    })

    // 转换为文档对象
    const allHits = Array.from(docIds).map(id => {
      const doc = this.index.get(id)
      return doc
    }).filter(Boolean)

    // 过滤
    let filteredHits = allHits
    if (pathFilter) {
      filteredHits = allHits.filter(doc => doc.path.startsWith(pathFilter))
    }
    if (timeRange) {
      filteredHits = allHits.filter(doc => {
        const docTime = new Date(doc.updatedAt).getTime()
        return docTime >= timeRange.from && docTime <= timeRange.to
      })
    }

    // 分页
    const total = filteredHits.length
    const paginatedHits = filteredHits.slice(offset, offset + limit)

    // 生成高亮摘要
    const enrichedHits = paginatedHits.map(doc => ({
      path: doc.path,
      name: doc.name,
      title: doc.title,
      excerpt: this.highlight(doc.excerpt, query),
      score: this.calculateScore(doc, query),
      highlights: this.extractHighlights(doc.content, query),
      updatedAt: doc.updatedAt
    }))

    // 按相关性排序
    enrichedHits.sort((a, b) => b.score - a.score)

    return {
      query,
      total,
      limit,
      offset,
      results: enrichedHits
    }
  }

  /**
   * 获取搜索建议
   */
  suggest(query, limit = 5) {
    if (!this.initialized) {
      return []
    }

    const suggestions = new Set()
    
    // 从标题中获取建议
    const titleResults = this.index.search(query, {
      field: 'title',
      limit: limit * 2
    })

    titleResults.forEach(result => {
      if (suggestions.size < limit) {
        const doc = this.index.get(result)
        if (doc) {
          suggestions.add(doc.title)
        }
      }
    })

    return Array.from(suggestions).slice(0, limit)
  }

  /**
   * 获取索引统计
   */
  getStats() {
    return {
      count: this.documents.size,
      initialized: this.initialized
    }
  }

  /**
   * 清空索引
   */
  clear() {
    this.index = new FlexSearch.Document({
      tokenize: 'forward',
      charset: 'latin:extra',
      optimize: true,
      document: {
        id: 'id',
        index: ['title', 'content', 'excerpt'],
        store: ['title', 'path', 'name', 'updatedAt', 'excerpt']
      }
    })
    this.documents.clear()
    console.log('[SearchIndex] Cleared')
  }

  /**
   * 生成文档 ID
   */
  generateId(filePath) {
    return Buffer.from(filePath).toString('base64').substring(0, 16)
  }

  /**
   * 生成摘要
   */
  generateExcerpt(content, length = 200) {
    if (!content) return ''
    
    // 确保 content 是字符串
    const text = String(content)
      .replace(/[#*_~`]/g, '')
      .replace(/\n+/g, ' ')
    
    if (text.length <= length) return text
    
    return text.substring(0, length).trim() + '...'
  }

  /**
   * 高亮关键词
   */
  highlight(text, query) {
    if (!text || !query) return text
    
    const keywords = String(query || '').split(/\s+/).filter(Boolean)
    let highlighted = String(text || '')
    
    keywords.forEach(keyword => {
      const regex = new RegExp(`(${keyword})`, 'gi')
      highlighted = highlighted.replace(regex, '<mark>$1</mark>')
    })
    
    return highlighted
  }

  /**
   * 提取高亮片段
   */
  extractHighlights(content, query, contextLength = 50) {
    if (!content || !query) return []
    
    // 确保 content 是字符串
    const contentStr = String(content || '')
    const keywords = String(query || '').split(/\s+/).filter(Boolean)
    const highlights = []
    
    keywords.forEach(keyword => {
      const regex = new RegExp(keyword, 'gi')
      let match
      
      while ((match = regex.exec(contentStr)) !== null) {
        const start = Math.max(0, match.index - contextLength)
        const end = Math.min(contentStr.length, match.index + keyword.length + contextLength)
        
        highlights.push({
          keyword,
          position: match.index,
          context: contentStr.substring(start, end)
        })
      }
    })
    
    return highlights.slice(0, 5) // 最多返回 5 个高亮
  }

  /**
   * 计算相关性评分
   */
  calculateScore(doc, query) {
    let score = 0
    
    const keywords = String(query || '').toLowerCase().split(/\s+/).filter(Boolean)
    const title = String(doc.title || '').toLowerCase()
    const content = String(doc.content || '').toLowerCase()
    
    keywords.forEach(keyword => {
      // 标题匹配权重高
      if (title.includes(keyword)) {
        score += 10
      }
      
      // 内容匹配 - 确保 content 是字符串
      const matches = String(content).split(keyword).length - 1
      score += matches * 2
    })
    
    return score
  }

  /**
   * 关闭索引服务
   */
  async close() {
    this.documents.clear()
    this.index = null
    this.initialized = false
    console.log('[SearchIndex] Closed')
  }
}

// 单例模式
let instance = null

export function getSearchIndex(config) {
  if (!instance) {
    instance = new SearchIndex(config)
  }
  return instance
}

export default SearchIndex
