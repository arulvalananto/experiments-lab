import { Pool, PoolClient } from 'pg'
import { config } from './config'

// Create PostgreSQL connection pool
export const pool = new Pool(
    config.database.url
        ? {
              connectionString: config.database.url
          }
        : {
              host: config.database.host,
              port: config.database.port,
              database: config.database.name,
              user: config.database.user,
              password: config.database.password
          }
)

// Test connection
pool.on('connect', () => {
    console.log('Connected to PostgreSQL database')
})

pool.on('error', (err) => {
    console.error('Unexpected error on idle PostgreSQL client', err)
    process.exit(-1)
})

// Helper function to execute queries
export async function query<T = any>(text: string, params?: any[]): Promise<T[]> {
    const start = Date.now()
    const result = await pool.query(text, params)
    const duration = Date.now() - start
    console.log('Executed query', { text, duration, rows: result.rowCount })
    return result.rows
}

// Helper function to get a client from the pool
export async function getClient(): Promise<PoolClient> {
    return pool.connect()
}

// Initialize database tables
export async function initializeDatabase(): Promise<void> {
    const createUsersTable = `
        CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            name VARCHAR(255) NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
        
        CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    `

    try {
        await query(createUsersTable)
        console.log('Database tables initialized successfully')
    } catch (error) {
        console.error('Failed to initialize database tables:', error)
        throw error
    }
}

// Graceful shutdown
export async function closeDatabase(): Promise<void> {
    await pool.end()
    console.log('Database pool closed')
}
