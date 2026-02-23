import { FastifyInstance } from 'fastify'
import httpProxy from '@fastify/http-proxy'

import { config } from '../common/config'

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
        // Register proxy for each service route
        await fastify.register(httpProxy, {
            upstream: route.target,
            prefix: route.prefix,
            rewritePrefix: '',
            preHandler: route.requiresAuth ? fastify.authenticate : undefined,
            http2: false
        })

        fastify.log.info(
            { prefix: route.prefix, target: route.target, requiresAuth: route.requiresAuth },
            'Registered proxy route'
        )
    }
}
