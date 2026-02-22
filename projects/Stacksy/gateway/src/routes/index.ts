import { FastifyInstance } from 'fastify'

import { setupServiceRoutes } from './services'
import { globalErrorHandler } from '../common/error-handler'
import { notFound, setupCommonRoutes } from './common'

export async function setupRoutes(fastify: FastifyInstance): Promise<void> {
    await setupCommonRoutes(fastify)
    await setupServiceRoutes(fastify)

    // 404 handler
    fastify.setNotFoundHandler(notFound)

    // Global error handler
    fastify.setErrorHandler(globalErrorHandler)
}
