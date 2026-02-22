import { FastifyInstance } from 'fastify'
import { setupJwt } from './jwt'
import { setupRateLimit } from './rateLimit'
import { setupSecurity } from './security'

export async function registerPlugins(fastify: FastifyInstance): Promise<void> {
    // Security plugins
    await setupSecurity(fastify)

    // Rate limiting
    await setupRateLimit(fastify)

    // JWT authentication
    await setupJwt(fastify)
}
