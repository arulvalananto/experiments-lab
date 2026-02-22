import { FastifyRequest, FastifyReply } from 'fastify'

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
