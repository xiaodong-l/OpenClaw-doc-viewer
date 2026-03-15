/**
 * 统计 API 路由
 */
export default async function statsRoutes(fastify, options) {
  const { fileScanner } = options

  /**
   * GET /api/stats
   * 获取统计信息
   */
  fastify.get('/stats', async (request, reply) => {
    try {
      const stats = fileScanner.getStats()
      
      return {
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Error getting stats')
      return reply.code(500).send({
        success: false,
        error: {
          code: 'STATS_ERROR',
          message: err.message
        }
      })
    }
  })

  /**
   * POST /api/refresh
   * 刷新索引
   */
  fastify.post('/refresh', async (request, reply) => {
    try {
      request.log.info('Manual refresh requested')
      
      // 重新扫描所有目录
      await fileScanner.scanAll()
      
      return {
        success: true,
        data: {
          message: 'Refresh completed',
          stats: fileScanner.getStats()
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Error refreshing index')
      return reply.code(500).send({
        success: false,
        error: {
          code: 'REFRESH_ERROR',
          message: err.message
        }
      })
    }
  })
}
