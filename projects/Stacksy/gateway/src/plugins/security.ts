import fastifyCors from '@fastify/cors'
import { FastifyInstance } from 'fastify'
import fastifyHelmet from '@fastify/helmet'

import { config } from '../common/config'

export async function setupSecurity(fastify: FastifyInstance): Promise<void> {
    // CORS
    await fastify.register(fastifyCors, {
        origin: config.cors.origin,
        credentials: true
    })

    // Security headers
    await fastify.register(fastifyHelmet, {
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                scriptSrc: ["'self'"],
                imgSrc: ["'self'", 'data:', 'https:']
            }
        }
    })
}
