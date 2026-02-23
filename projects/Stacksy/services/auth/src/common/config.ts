import dotenv from 'dotenv'

dotenv.config()

export interface Config {
    server: {
        port: number
        host: string
        env: string
    }
    jwt: {
        secret: string
        expiresIn: string
    }
    database: {
        url?: string
        host: string
        port: number
        name: string
        user: string
        password: string
    }
    logging: {
        level: string
        prettyPrint: boolean
    }
}

export const config: Config = {
    server: {
        port: parseInt(process.env.PORT || '3001', 10),
        host: process.env.HOST || '0.0.0.0',
        env: process.env.NODE_ENV || 'development'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production',
        expiresIn: process.env.JWT_EXPIRES_IN || '1h'
    },
    database: {
        url: process.env.DATABASE_URL,
        host: process.env.DB_HOST || 'localhost',
        port: parseInt(process.env.DB_PORT || '5432', 10),
        name: process.env.DB_NAME || 'stacksy_auth',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'password'
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        prettyPrint: process.env.PRETTY_LOGS === 'true'
    }
}
