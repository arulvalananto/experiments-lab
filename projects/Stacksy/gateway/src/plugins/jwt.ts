import fastifyJwt from '@fastify/jwt'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { config } from '../common/config'

export async function setupJwt(fastify: FastifyInstance): Promise<void> {
    await fastify.register(fastifyJwt, {
        secret: config.jwt.secret
    })

    fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            const error = err as Error
            request.log.warn({ err: error }, 'JWT verification failed')

            let message = 'Invalid or missing token'
            if (error.message.includes('expired')) {
                message = 'Token has expired'
            } else if (error.message.includes('malformed')) {
                message = 'Token is malformed'
            } else if (error.message.includes('signature')) {
                message = 'Invalid token signature'
            }

            reply.code(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message
            })
        }
    })
}
