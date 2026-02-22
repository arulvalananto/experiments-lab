import httpProxy from 'http-proxy'
import { ServerResponse } from 'http'
import { FastifyRequest, FastifyReply } from 'fastify'

export type ProxyOptions = {
    target: string
    changeOrigin?: boolean
    pathRewrite?: (path: string) => string
}

const proxy = httpProxy.createProxyServer({})

// Error handler for proxy
proxy.on('error', (err, req, res) => {
    console.error('Proxy Error:', err)
    if (res instanceof ServerResponse && !res.headersSent) {
        res.writeHead(500, {
            'Content-Type': 'application/json'
        })
        res.end(
            JSON.stringify({
                statusCode: 500,
                error: 'Internal Server Error',
                message: 'Service temporarily unavailable'
            })
        )
    }
})

export function createProxyHandler(options: ProxyOptions) {
    return async (request: FastifyRequest, reply: FastifyReply) => {
        const { target, changeOrigin = true, pathRewrite } = options

        // Rewrite path if needed
        if (pathRewrite) {
            const newPath = pathRewrite(request.url)
            request.raw.url = newPath
        }

        // Convert headers to the format expected by http-proxy
        const headers: { [header: string]: string } = {}
        Object.entries(request.headers).forEach(([key, value]) => {
            if (value !== undefined) {
                headers[key] = Array.isArray(value) ? value.join(', ') : value
            }
        })

        // Set raw response
        reply.hijack()

        // Proxy the request
        proxy.web(
            request.raw,
            reply.raw,
            {
                target,
                changeOrigin,
                headers
            },
            (err) => {
                if (err) {
                    console.error('Proxy forwarding error:', err)
                    const raw = reply.raw
                    if (raw instanceof ServerResponse && !raw.headersSent) {
                        raw.writeHead(500, {
                            'Content-Type': 'application/json'
                        })
                        raw.end(
                            JSON.stringify({
                                statusCode: 500,
                                error: 'Internal Server Error',
                                message: 'Failed to forward request'
                            })
                        )
                    }
                }
            }
        )
    }
}
