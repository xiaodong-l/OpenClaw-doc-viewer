/**
 * 文档评论相关 API 路由 - v1.3.0 新增
 */

import commentService from '../services/commentService.js'

export default async function commentsRoutes(fastify, options) {
  const { userService } = options

  /**
   * GET /api/v1/comments
   * 获取文档评论列表
   */
  fastify.get('/comments', async (request, reply) => {
    try {
      const { path: documentPath } = request.query
      
      if (!documentPath) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PATH', message: '文档路径不能为空' }
        })
      }
      
      const comments = await commentService.findByDocument(documentPath)
      
      return {
        success: true,
        data: comments,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get comments error')
      return reply.code(500).send({
        success: false,
        error: { code: 'GET_ERROR', message: err.message }
      })
    }
  })

  /**
   * GET /api/v1/comments/stats
   * 获取评论统计
   */
  fastify.get('/comments/stats', async (request, reply) => {
    try {
      const { path: documentPath } = request.query
      
      if (!documentPath) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PATH', message: '文档路径不能为空' }
        })
      }
      
      const stats = await commentService.getStats(documentPath)
      
      return {
        success: true,
        data: stats,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get comments stats error')
      return reply.code(500).send({
        success: false,
        error: { code: 'GET_ERROR', message: err.message }
      })
    }
  })

  /**
   * POST /api/v1/comments
   * 创建评论
   */
  fastify.post('/comments', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { documentPath, content, parentId } = request.body
      const user = request.user
      
      if (!documentPath) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PATH', message: '文档路径不能为空' }
        })
      }
      
      if (!content || !content.trim()) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_CONTENT', message: '评论内容不能为空' }
        })
      }
      
      // 如果 parentId 存在，验证父评论是否存在
      if (parentId) {
        const parentComment = await commentService.findById(parentId)
        if (!parentComment) {
          return reply.code(404).send({
            success: false,
            error: { code: 'PARENT_NOT_FOUND', message: '父评论不存在' }
          })
        }
      }
      
      const comment = await commentService.create({
        documentPath,
        userId: user.userId,
        userName: user.name,
        userAvatar: user.avatar,
        content: content.trim(),
        parentId: parentId || null
      })
      
      return {
        success: true,
        data: comment,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Create comment error')
      return reply.code(500).send({
        success: false,
        error: { code: 'CREATE_ERROR', message: err.message }
      })
    }
  })

  /**
   * PUT /api/v1/comments/:id
   * 更新评论
   */
  fastify.put('/comments/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params
      const { content } = request.body
      const userId = request.user.userId
      
      const comment = await commentService.findById(id)
      if (!comment) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '评论不存在' }
        })
      }
      
      // 只能修改自己的评论
      if (comment.userId !== userId) {
        return reply.code(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: '无权修改此评论' }
        })
      }
      
      const updated = await commentService.update(id, { content })
      
      return {
        success: true,
        data: updated,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Update comment error')
      return reply.code(500).send({
        success: false,
        error: { code: 'UPDATE_ERROR', message: err.message }
      })
    }
  })

  /**
   * DELETE /api/v1/comments/:id
   * 删除评论
   */
  fastify.delete('/comments/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params
      const userId = request.user.userId
      
      const comment = await commentService.findById(id)
      if (!comment) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '评论不存在' }
        })
      }
      
      // 只能删除自己的评论，或者是管理员
      const user = await userService.getById(userId)
      if (comment.userId !== userId && user.role !== 'admin') {
        return reply.code(403).send({
          success: false,
          error: { code: 'FORBIDDEN', message: '无权删除此评论' }
        })
      }
      
      await commentService.delete(id)
      
      return {
        success: true,
        data: { deleted: id },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Delete comment error')
      return reply.code(500).send({
        success: false,
        error: { code: 'DELETE_ERROR', message: err.message }
      })
    }
  })

  /**
   * POST /api/v1/comments/:id/like
   * 点赞/取消点赞评论
   */
  fastify.post('/comments/:id/like', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { id } = request.params
      const userId = request.user.userId
      
      const comment = await commentService.like(id, userId)
      
      return {
        success: true,
        data: comment,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Like comment error')
      return reply.code(500).send({
        success: false,
        error: { code: 'LIKE_ERROR', message: err.message }
      })
    }
  })
}
