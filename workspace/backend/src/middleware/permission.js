/**
 * 权限中间件 - v2.0.0
 * 检查用户对资源的操作权限
 */

import { PermissionService, PermissionRole } from '../models/Permission.js'

const permissionService = new PermissionService()

/**
 * 权限中间件工厂
 * @param {string} resourceType - 资源类型 (document, collection, etc.)
 * @param {string} requiredAction - 所需操作 (view, edit, manage, delete)
 */
export function requirePermission(resourceType, requiredAction) {
  return async (request, reply) => {
    const user = request.user

    if (!user) {
      return reply.code(401).send({ error: '未认证' })
    }

    // 管理员拥有所有权限
    if (user.role === 'admin') {
      return
    }

    // 获取资源路径
    let resourcePath
    if (resourceType === 'document') {
      resourcePath = request.query.path || request.body.path || request.params.path
    }

    if (!resourcePath) {
      return reply.code(400).send({ error: '无法确定资源路径' })
    }

    // 检查权限
    const hasPermission = await permissionService.checkPermission(
      resourcePath,
      user.id,
      requiredAction
    )

    if (!hasPermission) {
      // 检查组权限
      const hasGroupPermission = await permissionService.checkGroupPermission(
        resourcePath,
        user.id,
        requiredAction
      )

      if (!hasGroupPermission) {
        return reply.code(403).send({
          error: '权限不足',
          message: `您没有${getActionName(requiredAction)}该资源的权限`
        })
      }
    }
  }
}

/**
 * 文档查看权限检查
 */
export function requireViewPermission() {
  return requirePermission('document', 'view')
}

/**
 * 文档编辑权限检查
 */
export function requireEditPermission() {
  return requirePermission('document', 'edit')
}

/**
 * 文档管理权限检查
 */
export function requireManagePermission() {
  return requirePermission('document', 'manage')
}

/**
 * 文档删除权限检查
 */
export function requireDeletePermission() {
  return requirePermission('document', 'delete')
}

/**
 * 获取操作名称
 */
function getActionName(action) {
  const names = {
    view: '查看',
    edit: '编辑',
    manage: '管理',
    delete: '删除'
  }
  return names[action] || action
}

/**
 * 权限检查工具函数
 */
export async function checkPermission(fastify, documentPath, userId, action) {
  await permissionService.initialize()

  // 获取用户信息
  const user = await fastify.userService.findById(userId)
  if (!user) return false

  // 管理员拥有所有权限
  if (user.role === 'admin') return true

  // 检查个人权限
  const hasPermission = await permissionService.checkPermission(documentPath, userId, action)
  if (hasPermission) return true

  // 检查组权限
  return await permissionService.checkGroupPermission(documentPath, userId, action)
}

/**
 * 权限装饰器
 */
export default async function permissionPlugin(fastify, options) {
  // 添加权限检查装饰器
  fastify.decorate('checkPermission', async (documentPath, userId, action) => {
    return checkPermission(fastify, documentPath, userId, action)
  })

  // 添加权限服务装饰器
  fastify.decorate('permissionService', permissionService)

  // 初始化权限服务
  await permissionService.initialize()
  fastify.log.info('[PermissionPlugin] 权限系统已初始化')
}
