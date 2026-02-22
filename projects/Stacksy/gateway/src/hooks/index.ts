import { FastifyInstance } from 'fastify'

export const setupHooks = async (fastify: FastifyInstance) => {
    // Request logging
    fastify.addHook('onRequest', async (request) => {
        request.log.info(
            {
                method: request.method,
                url: request.url,
                ip: request.ip
            },
            'Incoming request'
        )
    })

    fastify.addHook('onResponse', async (request, reply) => {
        request.log.info(
            {
                method: request.method,
                url: request.url,
                statusCode: reply.statusCode
            },
            'Request completed'
        )
    })
}
