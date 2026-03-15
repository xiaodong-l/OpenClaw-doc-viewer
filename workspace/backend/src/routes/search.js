/**
 * 搜索 API 路由
 */

export default async function searchRoutes(fastify, options) {
  const { fileScanner, searchIndex } = options

  /**
   * GET /api/v1/search
   * 搜索文档
   */
  fastify.get('/search', async (request, reply) => {
    try {
      const { q, limit, offset, path: pathFilter, timeRange } = request.query

      if (!q || q.trim().length === 0) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'MISSING_QUERY',
            message: '缺少搜索关键词'
          }
        })
      }

      // 确保索引已初始化
      if (!searchIndex.initialized) {
        await searchIndex.initialize()
        
        // 如果索引为空，从文件扫描器导入文档
        if (searchIndex.getStats().count === 0) {
          await rebuildSearchIndex(fileScanner, searchIndex)
        }
      }

      // 解析时间范围
      let timeRangeObj = null
      if (timeRange) {
        const [from, to] = timeRange.split(',')
        timeRangeObj = {
          from: new Date(from).getTime(),
          to: new Date(to || Date.now()).getTime()
        }
      }

      // 执行搜索
      const results = searchIndex.search(q.trim(), {
        limit: parseInt(limit) || 20,
        offset: parseInt(offset) || 0,
        path: pathFilter,
        timeRange: timeRangeObj
      })

      return {
        success: true,
        data: results,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.1.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Search error')
      return reply.code(500).send({
        success: false,
        error: {
          code: 'SEARCH_ERROR',
          message: err.message
        }
      })
    }
  })

  /**
   * GET /api/v1/search/suggest
   * 获取搜索建议
   */
  fastify.get('/search/suggest', async (request, reply) => {
    try {
      const { q, limit } = request.query

      if (!q || q.trim().length < 2) {
        return {
          success: true,
          data: { suggestions: [] },
          meta: {
            timestamp: new Date().toISOString(),
            version: '1.1.0'
          }
        }
      }

      // 确保索引已初始化
      if (!searchIndex.initialized) {
        await searchIndex.initialize()
      }

      const suggestions = searchIndex.suggest(q.trim(), parseInt(limit) || 5)

      return {
        success: true,
        data: { suggestions },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.1.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Suggest error')
      return reply.code(500).send({
        success: false,
        error: {
          code: 'SUGGEST_ERROR',
          message: err.message
        }
      })
    }
  })

  /**
   * POST /api/v1/search/rebuild
   * 重建搜索索引 (需要管理员权限)
   */
  fastify.post('/search/rebuild', async (request, reply) => {
    try {
      // TODO: 添加权限检查

      if (!fileScanner) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'SCANNER_NOT_FOUND',
            message: '文件扫描器未初始化'
          }
        })
      }

      await rebuildSearchIndex(fileScanner, searchIndex)

      return {
        success: true,
        data: {
          count: searchIndex.getStats().count
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.1.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Rebuild error')
      return reply.code(500).send({
        success: false,
        error: {
          code: 'REBUILD_ERROR',
          message: err.message
        }
      })
    }
  })

  /**
   * GET /api/v1/search/stats
   * 获取搜索索引统计
   */
  fastify.get('/search/stats', async (request, reply) => {
    try {
      const stats = searchIndex.getStats()

      return {
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.1.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Stats error')
      return reply.code(500).send({
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: err.message
        }
      })
    }
  })
}

/**
 * 重建搜索索引
 */
async function rebuildSearchIndex(fileScanner, searchIndex) {
  console.log('[SearchIndex] Rebuilding index...')
  
  // 清空现有索引
  searchIndex.clear()
  
  // 获取所有文档
  const documents = await fileScanner.getAllDocuments()
  
  // 添加到索引
  for (const doc of documents) {
    await searchIndex.add({
      id: searchIndex.generateId(doc.path),
      path: doc.path,
      name: doc.name,
      title: doc.title || doc.name,
      content: doc.content,
      updatedAt: doc.updatedAt
    })
  }
  
  console.log(`[SearchIndex] Indexed ${documents.length} documents`)
}
