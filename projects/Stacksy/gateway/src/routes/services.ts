import { FastifyInstance } from 'fastify'

import { config } from '../common/config'
import { createProxyHandler } from '../utils/proxy'

interface ServiceRoute {
    prefix: string
    target: string
    requiresAuth: boolean
}

const serviceRoutes: ServiceRoute[] = [
    {
        prefix: '/api/auth',
        target: config.services.auth,
        requiresAuth: false
    },
    {
        prefix: '/api/tools',
        target: config.services.tool,
        requiresAuth: true
    }
]

export async function setupServiceRoutes(fastify: FastifyInstance): Promise<void> {
    for (const route of serviceRoutes) {
        const options = route.requiresAuth ? { preHandler: fastify.authenticate } : {}

        fastify.all(
            `${route.prefix}/*`,
            options,
            createProxyHandler({
                target: route.target,
                pathRewrite: (path) => path.replace(route.prefix, '')
            })
        )
    }
}
