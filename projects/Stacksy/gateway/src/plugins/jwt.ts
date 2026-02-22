import fastifyJwt from '@fastify/jwt'
import { FastifyInstance, FastifyReply, FastifyRequest } from 'fastify'

import { config } from '../common/config'

export async function setupJwt(fastify: FastifyInstance): Promise<void> {
    await fastify.register(fastifyJwt, {
        secret: config.jwt.secret,
        sign: {
            expiresIn: '1h'
        }
    })

    fastify.decorate('authenticate', async function (request: FastifyRequest, reply: FastifyReply) {
        try {
            await request.jwtVerify()
        } catch (err) {
            console.error('JWT authentication error:', err)
            reply.code(401).send({
                statusCode: 401,
                error: 'Unauthorized',
                message: 'Invalid or missing token'
            })
        }
    })
}
