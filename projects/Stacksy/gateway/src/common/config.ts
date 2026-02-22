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
    }
    rateLimit: {
        max: number
        timeWindow: number
    }
    services: {
        auth: string
        tool: string
    }
    logging: {
        level: string
        prettyPrint: boolean
    }
    cors: {
        origin: string
    }
}

export const config: Config = {
    server: {
        port: parseInt(process.env.PORT || '3000', 10),
        host: process.env.HOST || '0.0.0.0',
        env: process.env.NODE_ENV || 'development'
    },
    jwt: {
        secret: process.env.JWT_SECRET || 'default-secret-change-in-production'
    },
    rateLimit: {
        max: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
        timeWindow: parseInt(process.env.RATE_LIMIT_TIME_WINDOW || '60000', 10)
    },
    services: {
        auth: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
        tool: process.env.TOOL_SERVICE_URL || 'http://localhost:3002'
    },
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        prettyPrint: process.env.PRETTY_LOGS === 'true'
    },
    cors: {
        origin: process.env.CORS_ORIGIN || '*'
    }
}
