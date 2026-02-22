import { FastifyRequest, FastifyReply, FastifyInstance } from 'fastify'

export async function healthCheck(_request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.code(200).send({
        status: 'ok',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development'
    })
}

export async function notFound(request: FastifyRequest, reply: FastifyReply): Promise<void> {
    reply.code(404).send({
        statusCode: 404,
        error: 'Not Found',
        message: `Route ${request.method} ${request.url} not found`
    })
}

export const setupCommonRoutes = async (fastify: FastifyInstance) => {
    fastify.get('/health', healthCheck)

    fastify.get('/', async (_request, reply) => {
        reply.send({
            name: 'Stacksy API Gateway',
            version: '1.0.0',
            status: 'running',
            timestamp: new Date().toISOString()
        })
    })
}
