import { config } from './config'

export const appConfiguation = {
    logger: {
        level: config.logging.level,
        transport: config.logging.prettyPrint
            ? {
                  target: 'pino-pretty',
                  options: {
                      translateTime: 'HH:MM:ss Z',
                      ignore: 'pid,hostname'
                  }
              }
            : undefined
    }
}

export const corsOptions = {
    origin: ['http://localhost:3000'],
    credentials: true
}
