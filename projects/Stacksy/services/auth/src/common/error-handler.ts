import { FastifyError, FastifyReply, FastifyRequest } from 'fastify'

import { config } from './config'

export const globalErrorHandler = async (
    error: FastifyError,
    request: FastifyRequest,
    reply: FastifyReply
) => {
    request.log.error(error)

    const statusCode = error.statusCode || 500
    const message = statusCode === 500 ? 'Internal Server Error' : error.message

    reply.code(statusCode).send({
        statusCode,
        error: error.name,
        message,
        ...(config.server.env === 'development' && { stack: error.stack })
    })
}
