import { FastifyError, FastifyInstance } from 'fastify'

import { config } from '../common/config'
import { healthCheck, notFound } from './health'
import { createProxyHandler } from '../utils/proxy'

export async function setupRoutes(fastify: FastifyInstance): Promise<void> {
    // Health check endpoint (no auth required)
    fastify.get('/health', healthCheck)

    // Root endpoint
    fastify.get('/', async (request, reply) => {
        reply.send({
            name: 'Stacksy API Gateway',
            version: '1.0.0',
            status: 'running',
            timestamp: new Date().toISOString()
        })
    })

    // Auth Service Routes (no authentication required for login/signup)
    fastify.all(
        '/api/auth/*',
        createProxyHandler({
            target: config.services.auth,
            pathRewrite: (path) => path.replace('/api/auth', '')
        })
    )

    // Catch-all for undefined routes
    fastify.setNotFoundHandler(notFound)

    // Global error handler
    fastify.setErrorHandler((error: FastifyError, request, reply) => {
        fastify.log.error(error)

        const statusCode = error.statusCode || 500
        const message = statusCode === 500 ? 'Internal Server Error' : error.message

        reply.code(statusCode).send({
            statusCode,
            error: error.name,
            message,
            ...(config.server.env === 'development' && { stack: error.stack })
        })
    })
}
