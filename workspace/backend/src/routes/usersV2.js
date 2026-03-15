/**
 * 用户管理路由 - v2.0.0
 * 管理员专用：用户 CRUD、角色管理、状态管理
 */

import { UserService, UserRole, UserStatus } from '../models/User.js';

const userService = new UserService();

/**
 * 检查是否为管理员
 */
function isAdmin(user) {
  return user && user.role === UserRole.ADMIN;
}

/**
 * 注册路由
 */
async function registerRoutes(fastify) {
  // 获取用户列表 (仅管理员)
  fastify.get('/users', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' });
      }
      
      const { page = 1, limit = 20, role, status, search } = request.query;
      
      const filters = {};
      if (role) filters.role = role;
      if (status) filters.status = status;
      if (search) filters.search = search;
      
      const users = await userService.findAll(filters);
      
      reply.send({
        users,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: users.length
        }
      });
    } catch (err) {
      fastify.log.error({ err }, '获取用户列表失败');
      reply.code(500).send({ error: '获取用户列表失败', message: err.message });
    }
  });

  // 获取用户统计 (仅管理员)
  fastify.get('/users/stats', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' });
      }
      
      const stats = await userService.getStats();
      reply.send({ stats });
    } catch (err) {
      fastify.log.error({ err }, '获取用户统计失败');
      reply.code(500).send({ error: '获取用户统计失败', message: err.message });
    }
  });

  // 获取用户详情
  fastify.get('/users/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const user = await userService.findById(request.params.id);
      
      if (!user) {
        return reply.code(404).send({ error: '用户不存在' });
      }
      
      // 非管理员只能查看自己的信息
      if (!isAdmin(request.user) && request.user.id !== request.params.id) {
        return reply.code(403).send({ error: '无权查看其他用户信息' });
      }
      
      reply.send({ user });
    } catch (err) {
      fastify.log.error({ err }, '获取用户详情失败');
      reply.code(500).send({ error: '获取用户详情失败', message: err.message });
    }
  });

  // 创建用户 (仅管理员)
  fastify.post('/users', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' });
      }
      
      const { email, username, password, role = UserRole.VIEWER } = request.body;
      
      if (!email || !username || !password) {
        return reply.code(400).send({
          error: '缺少必要参数',
          message: '请提供邮箱、用户名和密码'
        });
      }
      
      const user = await userService.create(
        { email, username, password, role },
        request.user.id
      );
      
      reply.code(201).send({
        message: '用户创建成功',
        user
      });
    } catch (err) {
      fastify.log.error({ err }, '创建用户失败');
      
      if (err.message.includes('邮箱已被使用')) {
        return reply.code(409).send({ error: '邮箱已被使用' });
      }
      if (err.message.includes('用户名已被使用')) {
        return reply.code(409).send({ error: '用户名已被使用' });
      }
      if (err.message.includes('密码')) {
        return reply.code(400).send({ error: err.message });
      }
      
      reply.code(500).send({ error: '创建用户失败', message: err.message });
    }
  });

  // 更新用户 (仅管理员)
  fastify.put('/users/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' });
      }
      
      const { email, username, role, status, avatarUrl } = request.body;
      const updateData = {};
      
      if (email) updateData.email = email;
      if (username) updateData.username = username;
      if (role) updateData.role = role;
      if (status) updateData.status = status;
      if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
      
      const user = await userService.update(
        request.params.id,
        updateData,
        request.user.id
      );
      
      reply.send({
        message: '用户更新成功',
        user
      });
    } catch (err) {
      fastify.log.error({ err }, '更新用户失败');
      
      if (err.message.includes('用户不存在')) {
        return reply.code(404).send({ error: '用户不存在' });
      }
      
      reply.code(500).send({ error: '更新用户失败', message: err.message });
    }
  });

  // 更新用户状态 (仅管理员)
  fastify.patch('/users/:id/status', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' });
      }
      
      const { status } = request.body;
      
      if (!status || !Object.values(UserStatus).includes(status)) {
        return reply.code(400).send({
          error: '无效的状态值',
          message: '状态必须是：active, inactive, suspended'
        });
      }
      
      const user = await userService.update(
        request.params.id,
        { status },
        request.user.id
      );
      
      reply.send({
        message: `用户已${status === 'active' ? '激活' : status === 'inactive' ? '禁用' : '暂停'}`,
        user
      });
    } catch (err) {
      fastify.log.error({ err }, '更新用户状态失败');
      
      if (err.message.includes('用户不存在')) {
        return reply.code(404).send({ error: '用户不存在' });
      }
      
      reply.code(500).send({ error: '更新用户状态失败', message: err.message });
    }
  });

  // 重置用户密码 (仅管理员)
  fastify.post('/users/:id/reset-password', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' });
      }
      
      const { newPassword } = request.body;
      
      if (!newPassword) {
        return reply.code(400).send({ error: '请提供新密码' });
      }
      
      await userService.resetPassword(
        request.params.id,
        newPassword,
        request.user.id
      );
      
      reply.send({ message: '密码重置成功' });
    } catch (err) {
      fastify.log.error({ err }, '重置密码失败');
      
      if (err.message.includes('用户不存在')) {
        return reply.code(404).send({ error: '用户不存在' });
      }
      if (err.message.includes('密码')) {
        return reply.code(400).send({ error: err.message });
      }
      
      reply.code(500).send({ error: '重置密码失败', message: err.message });
    }
  });

  // 删除用户 (仅管理员)
  fastify.delete('/users/:id', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      if (!isAdmin(request.user)) {
        return reply.code(403).send({ error: '需要管理员权限' });
      }
      
      // 不能删除自己
      if (request.params.id === request.user.id) {
        return reply.code(400).send({ error: '不能删除自己的账户' });
      }
      
      await userService.delete(request.params.id);
      
      reply.send({ message: '用户已删除' });
    } catch (err) {
      fastify.log.error({ err }, '删除用户失败');
      
      if (err.message.includes('用户不存在')) {
        return reply.code(404).send({ error: '用户不存在' });
      }
      if (err.message.includes('最后一个管理员')) {
        return reply.code(400).send({ error: '不能删除最后一个管理员' });
      }
      
      reply.code(500).send({ error: '删除用户失败', message: err.message });
    }
  });
}

export default registerRoutes;
