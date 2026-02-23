import { buildApp } from './app'
import { config } from './common/config'

async function start() {
    try {
        const app = await buildApp()

        await app.listen({
            port: config.server.port,
            host: config.server.host
        })

        app.log.info(`Auth service running on http://${config.server.host}:${config.server.port}`)

        // Graceful shutdown
        const signals = ['SIGINT', 'SIGTERM']
        signals.forEach((signal) => {
            process.on(signal, async () => {
                app.log.info(`Received ${signal}, closing server...`)
                await app.close()
                process.exit(0)
            })
        })
    } catch (err) {
        console.error('Failed to start server:', err)
        process.exit(1)
    }
}

start()
