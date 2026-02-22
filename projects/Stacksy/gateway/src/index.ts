import { buildApp } from './app'
import { config } from './common/config'

async function start() {
    try {
        const app = await buildApp()

        await app.listen({
            port: config.server.port,
            host: config.server.host
        })

        console.log(`
    ╔═════════════════════════════════════════════════════╗
    ║   Stacksy API Gateway                               ║
    ╠═════════════════════════════════════════════════════╣
    ║   Status: Running                                   ║
    ║   Port: ${config.server.port.toString().padEnd(36)} ║
    ║   Host: ${config.server.host.padEnd(36)}            ║
    ║   Environment: ${config.server.env.padEnd(27)}      ║
    ║   Timestamp: ${new Date().toISOString().padEnd(25)} ║
    ╚═════════════════════════════════════════════════════╝
    `)

        // Graceful shutdown
        const signals = ['SIGINT', 'SIGTERM']
        signals.forEach((signal) => {
            process.on(signal, async () => {
                console.log(`\n${signal} received. Shutting down gracefully...`)
                try {
                    await app.close()
                    console.log('Server closed successfully')
                    process.exit(0)
                } catch (err) {
                    console.error('Error during shutdown:', err)
                    process.exit(1)
                }
            })
        })
    } catch (err) {
        console.error('Error starting server:', err)
        process.exit(1)
    }
}

start()
