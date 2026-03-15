/**
 * 文件 API 路由
 */
export default async function fileRoutes(fastify, options) {
  const { fileScanner } = options

  /**
   * GET /api/v1/files
   * 获取目录树
   */
  fastify.get('/files', async (request, reply) => {
    try {
      const { path: dirPath, depth = 1 } = request.query
      
      const tree = await fileScanner.getDirectoryTree(dirPath, parseInt(depth))
      
      return {
        success: true,
        data: tree,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Error getting directory tree')
      return reply.code(400).send({
        success: false,
        error: {
          code: 'INVALID_PATH',
          message: err.message
        }
      })
    }
  })

  /**
   * GET /api/v1/files/content
   * 获取文件内容 (使用 query 参数传递路径)
   */
  fastify.get('/files/content', async (request, reply) => {
    try {
      const { path: filePath, raw } = request.query
      
      if (!filePath) {
        return reply.code(400).send({
          success: false,
          error: {
            code: 'MISSING_PATH',
            message: '缺少文件路径'
          }
        })
      }
      
      const file = await fileScanner.getFileContent(filePath)
      
      // 如果是 raw 请求，返回原始内容
      if (raw === 'true') {
        reply.header('Content-Type', 'text/markdown; charset=utf-8')
        reply.header('Content-Disposition', `inline; filename="${file.name}"`)
        return file.content
      }
      
      // 解析 Markdown 为 HTML
      const { html, toc } = fastify.markdown.parseMarkdownWithToc(file.content)
      
      return {
        success: true,
        data: {
          ...file,
          html,
          toc
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.0.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Error getting file content')
      
      if (err.code === 'ENOENT') {
        return reply.code(404).send({
          success: false,
          error: {
            code: 'FILE_NOT_FOUND',
            message: '文件不存在'
          }
        })
      }
      
      return reply.code(400).send({
        success: false,
        error: {
          code: 'INVALID_PATH',
          message: err.message
        }
      })
    }
  })
}
