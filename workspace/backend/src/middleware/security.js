/**
 * 安全中间件
 */

export default async function securityMiddleware(fastify, options) {
  // 安全头
  fastify.addHook('onRequest', async (request, reply) => {
    reply.header('X-Frame-Options', 'SAMEORIGIN')
    reply.header('X-Content-Type-Options', 'nosniff')
    reply.header('X-XSS-Protection', '1; mode=block')
    reply.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  })

  // 错误处理
  fastify.addHook('onError', async (request, reply, error) => {
    request.log.error(error, 'Unhandled error')
  })
}
