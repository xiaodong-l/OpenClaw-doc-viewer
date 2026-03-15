/**
 * 认证中间件
 */

import fp from 'fastify-plugin'

async function authMiddleware(fastify, options) {
  // JWT 已在 app.js 中注册

  // 装饰 authenticate 方法 - 使用 fastify-plugin 确保全局可用
  fastify.decorate('authenticate', async (request, reply) => {
    try {
      await request.jwtVerify()
    } catch (err) {
      reply.code(401).send({
        success: false,
        error: {
          code: 'UNAUTHORIZED',
          message: '认证失败，请重新登录'
        }
      })
      throw err
    }
  })

  // 装饰 requireRole 方法
  fastify.decorate('requireRole', (requiredRole) => {
    return async (request, reply) => {
      await request.jwtVerify()
      
      const userRole = request.user.role
      
      const roleHierarchy = {
        viewer: 1,
        editor: 2,
        admin: 3
      }
      
      if (roleHierarchy[userRole] < roleHierarchy[requiredRole]) {
        reply.code(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '权限不足'
          }
        })
        throw new Error('Forbidden')
      }
    }
  })

  // 装饰 hasPermission 方法
  fastify.decorate('hasPermission', (permission) => {
    return async (request, reply) => {
      await request.jwtVerify()
      
      const { userService } = options
      if (!userService) {
        reply.code(500).send({
          success: false,
          error: {
            code: 'SERVICE_UNAVAILABLE',
            message: '用户服务不可用'
          }
        })
        throw new Error('UserService not available')
      }
      
      const hasPerm = await userService.hasPermission(request.user.userId, permission)
      
      if (!hasPerm) {
        reply.code(403).send({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '权限不足'
          }
        })
        throw new Error('Forbidden')
      }
    }
  })
}

// 使用 fastify-plugin 确保装饰器全局可用
export default fp(authMiddleware, {
  name: 'auth-middleware',
  fastify: '4.x'
})
