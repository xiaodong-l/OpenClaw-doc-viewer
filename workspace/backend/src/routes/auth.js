/**
 * 认证路由 - v1.0.0
 * 用户登录认证
 */

import jwt from 'jsonwebtoken';
import UserService from '../services/userService.js';

const userService = new UserService();
const JWT_SECRET = process.env.JWT_SECRET || 'doc-viewer-jwt-secret-change-in-production';
const JWT_EXPIRES_IN = '24h';
const REFRESH_TOKEN_EXPIRES_IN = '7d';

/**
 * 生成 JWT Token
 */
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role
    },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
}

/**
 * 生成刷新 Token
 */
function generateRefreshToken(user) {
  return jwt.sign(
    { id: user.id, type: 'refresh' },
    JWT_SECRET,
    { expiresIn: REFRESH_TOKEN_EXPIRES_IN }
  );
}

/**
 * 注册路由
 */
async function registerRoutes(fastify) {
  // 用户注册
  fastify.post('/auth/register', async (request, reply) => {
    try {
      const { email, username, password } = request.body;
      
      if (!email || !username || !password) {
        return reply.code(400).send({
          error: '缺少必要参数',
          message: '请提供邮箱、用户名和密码'
        });
      }
      
      const user = await userService.create(
        { email, username, password },
        'system'
      );
      
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      
      reply.code(201).send({
        message: '注册成功',
        user,
        token,
        refreshToken
      });
    } catch (err) {
      fastify.log.error({ err }, '注册失败');
      
      if (err.message.includes('邮箱已被使用')) {
        return reply.code(409).send({ error: '邮箱已被使用' });
      }
      if (err.message.includes('用户名已被使用')) {
        return reply.code(409).send({ error: '用户名已被使用' });
      }
      if (err.message.includes('密码')) {
        return reply.code(400).send({ error: err.message });
      }
      
      reply.code(500).send({ error: '注册失败', message: err.message });
    }
  });

  // 用户登录
  fastify.post('/auth/login', async (request, reply) => {
    try {
      const { email, password } = request.body;
      const ip = request.ip;
      
      if (!email || !password) {
        return reply.code(400).send({
          error: '缺少必要参数',
          message: '请提供邮箱和密码'
        });
      }
      
      const user = await userService.authenticate(email, password, ip);
      
      const token = generateToken(user);
      const refreshToken = generateRefreshToken(user);
      
      reply.send({
        message: '登录成功',
        user,
        token,
        refreshToken
      });
    } catch (err) {
      fastify.log.error({ err }, '登录失败');
      
      if (err.message.includes('邮箱或密码') || err.message.includes('账户已被禁用')) {
        return reply.code(401).send({ error: err.message });
      }
      
      reply.code(500).send({ error: '登录失败', message: err.message });
    }
  });

  // 刷新 Token
  fastify.post('/auth/refresh', async (request, reply) => {
    try {
      const { refreshToken } = request.body;
      
      if (!refreshToken) {
        return reply.code(400).send({ error: '缺少刷新令牌' });
      }
      
      const decoded = jwt.verify(refreshToken, JWT_SECRET);
      
      if (decoded.type !== 'refresh') {
        return reply.code(401).send({ error: '无效的令牌类型' });
      }
      
      const user = await userService.findById(decoded.id);
      
      if (!user || user.status !== 'active') {
        return reply.code(401).send({ error: '用户不存在或已被禁用' });
      }
      
      const newToken = generateToken(user);
      const newRefreshToken = generateRefreshToken(user);
      
      reply.send({
        token: newToken,
        refreshToken: newRefreshToken
      });
    } catch (err) {
      fastify.log.error({ err }, '刷新令牌失败');
      
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return reply.code(401).send({ error: '刷新令牌已过期或无效' });
      }
      
      reply.code(500).send({ error: '刷新令牌失败', message: err.message });
    }
  });

  // 登出
  fastify.post('/auth/logout', async (request, reply) => {
    // 无状态 JWT，登出主要由客户端处理
    // 可以在这里将 token 加入黑名单
    reply.send({ message: '登出成功' });
  });

  // 获取当前用户信息
  fastify.get('/auth/me', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const user = await userService.findById(request.user.id);
      
      if (!user) {
        return reply.code(404).send({ error: '用户不存在' });
      }
      
      reply.send({ user });
    } catch (err) {
      fastify.log.error({ err }, '获取用户信息失败');
      reply.code(500).send({ error: '获取用户信息失败', message: err.message });
    }
  });

  // 修改密码
  fastify.put('/auth/password', {
    preHandler: [fastify.authenticate]
  }, async (request, reply) => {
    try {
      const { currentPassword, newPassword } = request.body;
      const userId = request.user.id;
      
      if (!currentPassword || !newPassword) {
        return reply.code(400).send({ error: '缺少必要参数' });
      }
      
      // 验证当前密码
      const user = await userService.findByEmail(request.user.email);
      const valid = await user.verifyPassword(currentPassword);
      
      if (!valid) {
        return reply.code(401).send({ error: '当前密码错误' });
      }
      
      await userService.resetPassword(userId, newPassword, userId);
      
      reply.send({ message: '密码修改成功' });
    } catch (err) {
      fastify.log.error({ err }, '修改密码失败');
      
      if (err.message.includes('密码')) {
        return reply.code(400).send({ error: err.message });
      }
      
      reply.code(500).send({ error: '修改密码失败', message: err.message });
    }
  });
}

export default registerRoutes;
