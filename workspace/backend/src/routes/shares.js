/**
 * 文档分享相关 API 路由
 */

import crypto from 'crypto'

export default async function sharesRoutes(fastify, options) {
  const { userService } = options

  /**
   * GET /api/v1/shares
   * 获取用户的分享列表
   */
  fastify.get('/shares', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const user = await userService.getById(userId)
      const shares = user.shares || []
      
      return {
        success: true,
        data: shares,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get shares error')
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '未认证' }
      })
    }
  })

  /**
   * POST /api/v1/shares
   * 创建分享链接
   */
  fastify.post('/shares', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { path, title, permissions, expiresAt, maxViews } = request.body
      
      if (!path) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PATH', message: '文档路径不能为空' }
        })
      }

      const user = await userService.getById(userId)
      const shares = user.shares || []
      
      // 生成分享 token
      const token = crypto.randomBytes(16).toString('hex')
      
      const newShare = {
        id: `share_${Date.now()}`,
        token,
        documentPath: path,
        documentTitle: title || path.split('/').pop(),
        permissions: permissions || 'read', // read, comment
        expiresAt: expiresAt || null,
        maxViews: maxViews || null,
        viewCount: 0,
        createdBy: userId,
        createdAt: new Date().toISOString()
      }
      
      shares.push(newShare)
      
      await userService.update(userId, { shares })
      
      return {
        success: true,
        data: newShare,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Create share error')
      return reply.code(500).send({
        success: false,
        error: { code: 'CREATE_ERROR', message: err.message }
      })
    }
  })

  /**
   * GET /api/v1/shares/:token
   * 获取分享详情 (公开访问，不需要认证)
   */
  fastify.get('/shares/:token', async (request, reply) => {
    try {
      const { token } = request.params
      
      // 查找分享
      let foundShare = null
      let foundUserId = null
      
      // 遍历所有用户查找分享
      const allUsers = await userService.getAll()
      for (const user of allUsers) {
        const share = (user.shares || []).find(s => s.token === token)
        if (share) {
          foundShare = share
          foundUserId = user.id
          break
        }
      }
      
      if (!foundShare) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '分享链接不存在' }
        })
      }
      
      // 检查是否过期
      if (foundShare.expiresAt && new Date(foundShare.expiresAt) < new Date()) {
        return reply.code(403).send({
          success: false,
          error: { code: 'EXPIRED', message: '分享链接已过期' }
        })
      }
      
      // 检查访问次数
      if (foundShare.maxViews && foundShare.viewCount >= foundShare.maxViews) {
        return reply.code(403).send({
          success: false,
          error: { code: 'MAX_VIEWS_REACHED', message: '访问次数已达上限' }
        })
      }
      
      // 增加访问计数
      const user = await userService.getById(foundUserId)
      const shares = user.shares || []
      const shareIndex = shares.findIndex(s => s.token === token)
      
      if (shareIndex !== -1) {
        shares[shareIndex].viewCount++
        await userService.update(foundUserId, { shares })
      }
      
      return {
        success: true,
        data: {
          documentPath: foundShare.documentPath,
          documentTitle: foundShare.documentTitle,
          permissions: foundShare.permissions
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get share error')
      return reply.code(500).send({
        success: false,
        error: { code: 'GET_ERROR', message: err.message }
      })
    }
  })

  /**
   * DELETE /api/v1/shares/:id
   * 删除分享链接
   */
  fastify.delete('/shares/:id', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { id } = request.params
      
      const user = await userService.getById(userId)
      const shares = user.shares || []
      
      const filteredShares = shares.filter(s => s.id !== id)
      
      if (filteredShares.length === shares.length) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '分享链接不存在' }
        })
      }
      
      await userService.update(userId, { shares: filteredShares })
      
      return {
        success: true,
        data: { deleted: id },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Delete share error')
      return reply.code(500).send({
        success: false,
        error: { code: 'DELETE_ERROR', message: err.message }
      })
    }
  })

  /**
   * GET /api/v1/shares/:id/stats
   * 获取分享统计
   */
  fastify.get('/shares/:id/stats', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { id } = request.params
      
      const user = await userService.getById(userId)
      const shares = user.shares || []
      
      const share = shares.find(s => s.id === id)
      if (!share) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '分享链接不存在' }
        })
      }
      
      return {
        success: true,
        data: {
          viewCount: share.viewCount,
          maxViews: share.maxViews,
          expiresAt: share.expiresAt,
          createdAt: share.createdAt
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get stats error')
      return reply.code(500).send({
        success: false,
        error: { code: 'GET_ERROR', message: err.message }
      })
    }
  })

  /**
   * GET /api/v1/shares/:token/public
   * 获取公开分享信息 (无需认证) - v1.3.0 新增
   */
  fastify.get('/shares/:token/public', async (request, reply) => {
    try {
      const { token } = request.params
      
      // 查找分享
      let foundShare = null
      let foundUser = null
      
      const allUsers = await userService.getAll()
      for (const user of allUsers) {
        const share = (user.shares || []).find(s => s.token === token)
        if (share) {
          foundShare = share
          foundUser = user
          break
        }
      }
      
      if (!foundShare) {
        return reply.code(404).send({
          success: false,
          error: '分享链接不存在'
        })
      }
      
      // 检查是否过期
      if (foundShare.expiresAt && new Date(foundShare.expiresAt) < new Date()) {
        return reply.code(410).send({
          success: false,
          error: '分享链接已过期'
        })
      }
      
      // 检查访问次数
      if (foundShare.maxViews && foundShare.viewCount >= foundShare.maxViews) {
        return reply.code(410).send({
          success: false,
          error: '访问次数已达上限'
        })
      }
      
      return {
        success: true,
        data: {
          documentPath: foundShare.documentPath,
          documentTitle: foundShare.documentTitle,
          permissions: foundShare.permissions,
          createdBy: foundUser?.name || '匿名用户',
          createdAt: foundShare.createdAt
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get public share error')
      return reply.code(500).send({
        success: false,
        error: '获取分享信息失败'
      })
    }
  })

  /**
   * GET /api/v1/shares/:token/document
   * 获取分享文档内容 (无需认证) - v1.3.0 新增
   */
  fastify.get('/shares/:token/document', async (request, reply) => {
    try {
      const { token } = request.params
      const { path: filePath } = request.query
      
      // 查找分享
      let foundShare = null
      let foundUserId = null
      
      const allUsers = await userService.getAll()
      for (const user of allUsers) {
        const share = (user.shares || []).find(s => s.token === token)
        if (share) {
          foundShare = share
          foundUserId = user.id
          break
        }
      }
      
      if (!foundShare) {
        return reply.code(404).send({
          success: false,
          error: '分享链接不存在'
        })
      }
      
      // 验证文件路径是否匹配
      if (filePath && filePath !== foundShare.documentPath) {
        return reply.code(403).send({
          success: false,
          error: '无权访问此文档'
        })
      }
      
      // 检查是否过期
      if (foundShare.expiresAt && new Date(foundShare.expiresAt) < new Date()) {
        return reply.code(410).send({
          success: false,
          error: '分享链接已过期'
        })
      }
      
      // 增加访问计数
      const user = await userService.getById(foundUserId)
      const shares = user.shares || []
      const shareIndex = shares.findIndex(s => s.token === token)
      
      if (shareIndex !== -1) {
        shares[shareIndex].viewCount++
        await userService.update(foundUserId, { shares })
      }
      
      // 读取文件内容
      const fs = await import('fs/promises')
      const fileContent = await fs.readFile(foundShare.documentPath, 'utf-8')
      
      // 解析 Markdown
      const { parseMarkdownWithToc } = await import('../services/markdownParser.js')
      const { html, toc } = await parseMarkdownWithToc(fileContent)
      
      return {
        success: true,
        data: {
          path: foundShare.documentPath,
          name: foundShare.documentPath.split('/').pop(),
          title: foundShare.documentTitle,
          content: fileContent,
          html,
          toc,
          permissions: foundShare.permissions
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get share document error')
      return reply.code(500).send({
        success: false,
        error: '获取文档内容失败'
      })
    }
  })
}
