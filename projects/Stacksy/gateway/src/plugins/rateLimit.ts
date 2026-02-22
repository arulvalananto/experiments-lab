import { FastifyInstance } from 'fastify'
import fastifyRateLimit from '@fastify/rate-limit'
import { config } from '../common/config'

export async function setupRateLimit(fastify: FastifyInstance): Promise<void> {
    await fastify.register(fastifyRateLimit, {
        max: config.rateLimit.max,
        timeWindow: config.rateLimit.timeWindow,
        errorResponseBuilder: function (_request, context) {
            return {
                statusCode: 429,
                error: 'Too Many Requests',
                message: `Rate limit exceeded. Try again in ${Math.ceil(
                    context.ttl / 1000
                )} seconds`,
                retryAfter: context.ttl
            }
        }
    })
}
