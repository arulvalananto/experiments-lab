import { config } from './config'

export const appConfiguration = {
    logger: {
        level: config.logging.level,
        transport: config.logging.prettyPrint
            ? {
                  target: 'pino-pretty',
                  options: {
                      translateTime: 'HH:MM:ss Z',
                      ignore: 'pid,hostname',
                      colorize: true
                  }
              }
            : undefined
    },
    requestIdHeader: 'x-request-id',
    requestIdLogLabel: 'reqId',
    disableRequestLogging: false,
    trustProxy: true
}
