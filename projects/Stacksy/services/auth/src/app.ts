import Fastify from 'fastify'
import cors from '@fastify/cors'

import { setupAuthRoutes } from './routes/auth'
import { globalErrorHandler } from './common/error-handler'
import { appConfiguation, corsOptions } from './common/static'

export async function buildApp() {
    const fastify = Fastify(appConfiguation)

    // Register CORS
    await fastify.register(cors, corsOptions)

    // Register routes
    await setupAuthRoutes(fastify)

    // Error handler
    fastify.setErrorHandler(globalErrorHandler)

    return fastify
}
