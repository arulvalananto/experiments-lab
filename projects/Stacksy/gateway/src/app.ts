import Fastify, { FastifyInstance } from 'fastify'

import { setupHooks } from './hooks'
import { setupRoutes } from './routes'
import { registerPlugins } from './plugins'
import { appConfiguration } from './common/static'

export async function buildApp(): Promise<FastifyInstance> {
    const fastify = Fastify(appConfiguration)

    // Register plugins
    await registerPlugins(fastify)

    // Setup routes
    await setupRoutes(fastify)

    // Setup hooks
    await setupHooks(fastify)

    return fastify
}
