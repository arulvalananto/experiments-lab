import { buildApp } from './app'
import { config } from './common/config'
import { initializeDatabase, closeDatabase } from './common/db'

async function start() {
    try {
        // Initialize database tables
        console.log('Initializing database...')
        await initializeDatabase()
        console.log('Database initialized successfully')

        // Build and start the app
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

                try {
                    // Close Fastify server
                    await app.close()
                    app.log.info('Server closed')

                    // Close database connections
                    await closeDatabase()
                    app.log.info('Database connections closed')

                    process.exit(0)
                } catch (err) {
                    app.log.error(err, 'Error during shutdown')
                    process.exit(1)
                }
            })
        })
    } catch (err) {
        console.error('Failed to start server:', err)
        process.exit(1)
    }
}

start()
