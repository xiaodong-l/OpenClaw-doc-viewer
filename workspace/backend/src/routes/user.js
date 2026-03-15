/**
 * 用户相关 API 路由
 */

import multer from '@fastify/multipart'
import path from 'path'
import fs from 'fs/promises'

// sharp is optional - only needed for avatar processing
// Some CPUs don't support prebuilt binaries (requires v2 microarchitecture)
let sharp = null
try {
  sharp = (await import('sharp')).default
  console.log('[UserService] Sharp loaded successfully')
} catch (e) {
  console.warn('[UserService] Sharp not available, avatar processing disabled')
  console.warn('[UserService] Error:', e.message)
}

export default async function userRoutes(fastify, options) {
  const { userService } = options

  // 注册 multipart
  await fastify.register(multer, {
    limits: {
      fileSize: 5 * 1024 * 1024 // 5MB
    }
  })

  /**
   * GET /api/v1/user/profile
   * 获取当前用户信息
   */
  fastify.get('/user/profile', async (request, reply) => {
    try {
      // 需要认证
      await request.jwtVerify()
      
      const user = await userService.getById(request.user.id)
      
      if (!user) {
        return reply.code(404).send({
          success: false,
          error: { code: 'USER_NOT_FOUND', message: '用户不存在' }
        })
      }

      const { password, ...safeUser } = user
      return {
        success: true,
        data: safeUser,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get profile error')
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '未认证' }
      })
    }
  })

  /**
   * POST /api/v1/user/avatar
   * 上传头像
   */
  fastify.post('/user/avatar', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const file = await request.file()
      
      if (!file) {
        return reply.code(400).send({
          success: false,
          error: { code: 'NO_FILE', message: '请上传文件' }
        })
      }

      // 验证文件类型
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif']
      if (!allowedTypes.includes(file.mimetype)) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_TYPE', message: '只支持 JPG/PNG/GIF 格式' }
        })
      }

      // 检查 sharp 是否可用
      if (!sharp) {
        return reply.code(503).send({
          success: false,
          error: { 
            code: 'SERVICE_UNAVAILABLE', 
            message: '头像处理服务不可用 (sharp 模块未安装或 CPU 不支持)' 
          }
        })
      }

      // 处理图片
      const buffer = await file.toBuffer()
      const processedImage = await sharp(buffer)
        .resize(200, 200, { fit: 'cover' })
        .jpeg({ quality: 80 })
        .toBuffer()

      // 保存头像
      const userId = request.user.id
      const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', `${userId}.jpg`)
      
      // 确保目录存在
      await fs.mkdir(path.dirname(avatarPath), { recursive: true })
      await fs.writeFile(avatarPath, processedImage)

      // 更新用户信息
      await userService.update(userId, {
        avatar: `/api/v1/user/avatar/${userId}`
      })

      return {
        success: true,
        data: {
          avatar: `/api/v1/user/avatar/${userId}`
        },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Upload avatar error')
      return reply.code(500).send({
        success: false,
        error: { code: 'UPLOAD_ERROR', message: err.message }
      })
    }
  })

  /**
   * GET /api/v1/user/avatar/:userId
   * 获取用户头像
   */
  fastify.get('/user/avatar/:userId', async (request, reply) => {
    try {
      const { userId } = request.params
      const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', `${userId}.jpg`)
      
      const exists = await fs.access(avatarPath).then(() => true).catch(() => false)
      
      if (!exists) {
        // 返回默认头像
        return reply.redirect('/default-avatar.png')
      }

      reply.type('image/jpeg')
      return fs.readFile(avatarPath)
    } catch (err) {
      request.log.error(err, 'Get avatar error')
      reply.code(500).send({ error: 'Failed to get avatar' })
    }
  })

  /**
   * DELETE /api/v1/user/avatar
   * 删除头像
   */
  fastify.delete('/user/avatar', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const avatarPath = path.join(process.cwd(), 'uploads', 'avatars', `${userId}.jpg`)
      
      // 删除文件
      await fs.unlink(avatarPath).catch(() => {})
      
      // 更新用户信息
      await userService.update(userId, { avatar: null })

      return {
        success: true,
        data: { avatar: null },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Delete avatar error')
      return reply.code(500).send({
        success: false,
        error: { code: 'DELETE_ERROR', message: err.message }
      })
    }
  })

  /**
   * GET /api/v1/user/history
   * 获取阅读历史
   */
  fastify.get('/user/history', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { limit = 50 } = request.query
      
      const user = await userService.getById(userId)
      const history = (user.readingHistory || []).slice(0, parseInt(limit))
      
      return {
        success: true,
        data: history,
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Get history error')
      return reply.code(401).send({
        success: false,
        error: { code: 'UNAUTHORIZED', message: '未认证' }
      })
    }
  })

  /**
   * POST /api/v1/user/history
   * 添加阅读历史
   */
  fastify.post('/user/history', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const { path, title, name } = request.body
      
      if (!path) {
        return reply.code(400).send({
          success: false,
          error: { code: 'INVALID_PATH', message: '文档路径不能为空' }
        })
      }

      const user = await userService.getById(userId)
      let history = user.readingHistory || []
      
      // 移除已存在的相同记录
      history = history.filter(h => h.path !== path)
      
      // 添加到开头
      history.unshift({
        path,
        title: title || name || path.split('/').pop(),
        name: name || path.split('/').pop(),
        readAt: new Date().toISOString()
      })
      
      // 只保留最近 100 条
      history = history.slice(0, 100)
      
      await userService.update(userId, { readingHistory: history })
      
      return {
        success: true,
        data: { added: true },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Add history error')
      return reply.code(500).send({
        success: false,
        error: { code: 'ADD_ERROR', message: err.message }
      })
    }
  })

  /**
   * DELETE /api/v1/user/history
   * 清除阅读历史
   */
  fastify.delete('/user/history', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      
      await userService.update(userId, { readingHistory: [] })
      
      return {
        success: true,
        data: { cleared: true },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Clear history error')
      return reply.code(500).send({
        success: false,
        error: { code: 'CLEAR_ERROR', message: err.message }
      })
    }
  })

  /**
   * DELETE /api/v1/user/history/:path
   * 删除单条历史记录
   */
  fastify.delete('/user/history/:path', async (request, reply) => {
    try {
      await request.jwtVerify()
      
      const userId = request.user.id
      const decodedPath = decodeURIComponent(request.params.path)
      
      const user = await userService.getById(userId)
      let history = user.readingHistory || []
      
      const initialLength = history.length
      history = history.filter(h => h.path !== decodedPath)
      
      if (history.length === initialLength) {
        return reply.code(404).send({
          success: false,
          error: { code: 'NOT_FOUND', message: '历史记录不存在' }
        })
      }
      
      await userService.update(userId, { readingHistory: history })
      
      return {
        success: true,
        data: { deleted: decodedPath },
        meta: {
          timestamp: new Date().toISOString(),
          version: '1.2.0'
        }
      }
    } catch (err) {
      request.log.error(err, 'Delete history error')
      return reply.code(500).send({
        success: false,
        error: { code: 'DELETE_ERROR', message: err.message }
      })
    }
  })
}
