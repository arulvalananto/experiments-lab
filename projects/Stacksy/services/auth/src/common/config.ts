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
    logging: {
        level: process.env.LOG_LEVEL || 'info',
        prettyPrint: process.env.PRETTY_LOGS === 'true'
    }
}
