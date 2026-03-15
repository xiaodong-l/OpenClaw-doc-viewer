/**
 * 文档收藏相关 API 路由
 */

export default async function collectionsRoutes(fastify, options) {
  const { userService } = options

  /**
   * GET /api/v1/collections
   * 获取用户的收藏夹列表
   */
  fastify.get('/collections', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const user = await userService.getById(userId)
      
      const collections = user.collections || []
      
      return {
        success: true,
        data: collections,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get collections error')
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '未认证' }
      })
    }
  })

  /**
   * POST /api/v1/collections
   * 创建收藏夹
   */
  fastify.post('/collections', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { name } = request.body
      
      if (!name || !name.trim()) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_NAME', message: '收藏夹名称不能为空' }
        })
      }

      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const newCollection = {
        id: `col_${Date.now()}`,
        name: name.trim(),
        documents: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }
      
      collections.push(newCollection)
      
      await userService.update(userId, { collections })
      
      return {
        success: true,
        data: newCollection,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Create collection error')
      return reply.code(500).send({
        success: false,
        error: { code: 'CREATE_ERROR', message: err.message }
      })
    }
  })

  /**
   * PUT /api/v1/collections/:id
   * 更新收藏夹
   */
  fastify.put('/collections/:id', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { id } = request.params
      const { name } = request.body
      
      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const index = collections.findIndex(c => c.id === id)
      if (index === -1) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '收藏夹不存在' }
        })
      }
      
      if (name && name.trim()) {
        collections[index].name = name.trim()
        collections[index].updatedAt = new Date().toISOString()
      }
      
      await userService.update(userId, { collections })
      
      return {
        success: true,
        data: collections[index],
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Update collection error')
      return reply.code(500).send({
        success: false,
        error: { code: 'UPDATE_ERROR', message: err.message }
      })
    }
  })

  /**
   * DELETE /api/v1/collections/:id
   * 删除收藏夹
   */
  fastify.delete('/collections/:id', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { id } = request.params
      
      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const filteredCollections = collections.filter(c => c.id !== id)
      
      if (filteredCollections.length === collections.length) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '收藏夹不存在' }
        })
      }
      
      await userService.update(userId, { collections: filteredCollections })
      
      return {
        success: true,
        data: { deleted: id },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Delete collection error')
      return reply.code(500).send({
        success: false,
        error: { code: 'DELETE_ERROR', message: err.message }
      })
    }
  })

  /**
   * POST /api/v1/collections/:id/documents
   * 添加文档到收藏夹
   */
  fastify.post('/collections/:id/documents', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { id } = request.params
      const { path, title, name } = request.body
      
      if (!path) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PATH', message: '文档路径不能为空' }
        })
      }

      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const collection = collections.find(c => c.id === id)
      if (!collection) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '收藏夹不存在' }
        })
      }
      
      // 检查是否已收藏
      const exists = collection.documents.some(d => d.path === path)
      if (exists) {
        return reply.code(400).send({
          success: false,
          error: { code: 'ALREADY_EXISTS', message: '文档已在收藏夹中' }
        })
      }
      
      collection.documents.push({
        path,
        title: title || name || path.split('/').pop(),
        name: name || path.split('/').pop(),
        addedAt: new Date().toISOString()
      })
      
      collection.updatedAt = new Date().toISOString()
      
      await userService.update(userId, { collections })
      
      return {
        success: true,
        data: collection,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Add document error')
      return reply.code(500).send({
        success: false,
        error: { code: 'ADD_ERROR', message: err.message }
      })
    }
  })

  /**
   * DELETE /api/v1/collections/:id/documents/:docPath
   * 从收藏夹移除文档
   */
  fastify.delete('/collections/:id/documents/:docPath', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { id, docPath } = request.params
      const decodedPath = decodeURIComponent(docPath)
      
      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const collection = collections.find(c => c.id === id)
      if (!collection) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '收藏夹不存在' }
        })
      }
      
      const initialLength = collection.documents.length
      collection.documents = collection.documents.filter(d => d.path !== decodedPath)
      
      if (collection.documents.length === initialLength) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '文档不在收藏夹中' }
        })
      }
      
      collection.updatedAt = new Date().toISOString()
      
      await userService.update(userId, { collections })
      
      return {
        success: true,
        data: collection,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Remove document error')
      return reply.code(500).send({
        success: false,
        error: { code: 'REMOVE_ERROR', message: err.message }
      })
    }
  })

  /**
   * GET /api/v1/collections/:id/documents
   * 获取收藏夹中的文档列表
   */
  fastify.get('/collections/:id/documents', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { id } = request.params
      
      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const collection = collections.find(c => c.id === id)
      if (!collection) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '收藏夹不存在' }
        })
      }
      
      return {
        success: true,
        data: collection.documents,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get documents error')
      return reply.code(500).send({
        success: false,
        error: { code: 'GET_ERROR', message: err.message }
      })
    }
  })

  // ==================== v1.3.0 批量操作 API ====================

  /**
   * POST /api/v1/collections/:id/docs/batch-delete
   * 批量删除收藏文档 - v1.3.0 新增
   */
  fastify.post('/collections/:id/docs/batch-delete', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.id
      const { id } = request.params
      const { documentPaths } = request.body
      
      if (!Array.isArray(documentPaths) || documentPaths.length === 0) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PATHS', message: '文档路径列表不能为空' }
        })
      }

      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const collection = collections.find(c => c.id === id)
      if (!collection) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '收藏夹不存在' }
        })
      }
      
      // 批量删除
      const initialCount = collection.documents.length
      const pathsToDelete = new Set(documentPaths)
      collection.documents = collection.documents.filter(d => !pathsToDelete.has(d.path))
      
      const deletedCount = initialCount - collection.documents.length
      
      if (deletedCount === 0) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '指定的文档不在收藏夹中' }
        })
      }
      
      collection.updatedAt = new Date().toISOString()
      await userService.update(userId, { collections })
      
      return {
        success: true,
        data: {
          deletedCount,
          collection
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Batch delete documents error')
      return reply.code(500).send({
        success: false,
        error: { code: 'DELETE_ERROR', message: err.message }
      })
    }
  })

  /**
   * POST /api/v1/collections/:id/docs/batch-move
   * 批量移动收藏文档 - v1.3.0 新增
   */
  fastify.post('/collections/:id/docs/batch-move', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.id
      const { id: sourceId } = request.params
      const { documentPaths, targetCollectionId } = request.body
      
      if (!Array.isArray(documentPaths) || documentPaths.length === 0) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PATHS', message: '文档路径列表不能为空' }
        })
      }
      
      if (!targetCollectionId) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_TARGET', message: '目标收藏夹 ID 不能为空' }
        })
      }

      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const sourceCollection = collections.find(c => c.id === sourceId)
      const targetCollection = collections.find(c => c.id === targetCollectionId)
      
      if (!sourceCollection || !targetCollection) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '收藏夹不存在' }
        })
      }
      
      // 移动文档
      const pathsToMove = new Set(documentPaths)
      const docsToMove = sourceCollection.documents.filter(d => pathsToMove.has(d.path))
      
      if (docsToMove.length === 0) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '指定的文档不在源收藏夹中' }
        })
      }
      
      // 从源收藏夹移除
      sourceCollection.documents = sourceCollection.documents.filter(d => !pathsToMove.has(d.path))
      sourceCollection.updatedAt = new Date().toISOString()
      
      // 添加到目标收藏夹 (避免重复)
      const existingPaths = new Set(targetCollection.documents.map(d => d.path))
      const newDocs = docsToMove.filter(d => !existingPaths.has(d.path))
      newDocs.forEach(d => {
        d.addedAt = new Date().toISOString()
        targetCollection.documents.push(d)
      })
      targetCollection.updatedAt = new Date().toISOString()
      
      await userService.update(userId, { collections })
      
      return {
        success: true,
        data: {
          movedCount: newDocs.length,
          sourceCollection,
          targetCollection
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Batch move documents error')
      return reply.code(500).send({
        success: false,
        error: { code: 'MOVE_ERROR', message: err.message }
      })
    }
  })

  /**
   * POST /api/v1/collections/batch-delete
   * 批量删除收藏夹 - v1.3.0 新增
   */
  fastify.post('/collections/batch-delete', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const userId = request.user.id
      const { collectionIds } = request.body
      
      if (!Array.isArray(collectionIds) || collectionIds.length === 0) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_IDS', message: '收藏夹 ID 列表不能为空' }
        })
      }

      const user = await userService.getById(userId)
      const collections = user.collections || []
      
      const idsToDelete = new Set(collectionIds)
      const initialCount = collections.length
      const filteredCollections = collections.filter(c => !idsToDelete.has(c.id))
      
      const deletedCount = initialCount - filteredCollections.length
      
      if (deletedCount === 0) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '指定的收藏夹不存在' }
        })
      }
      
      await userService.update(userId, { collections: filteredCollections })
      
      return {
        success: true,
        data: {
          deletedCount,
          deletedIds: collectionIds.filter(id => idsToDelete.has(id))
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.3.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Batch delete collections error')
      return reply.code(500).send({
        success: false,
        error: { code: 'DELETE_ERROR', message: err.message }
      })
    }
  })
}
