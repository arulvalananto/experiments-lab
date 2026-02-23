import { randomUUID } from 'crypto'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'

import { db } from '../database'
import { generateToken } from '../common/jwt'
import { hashPassword, comparePassword } from '../common/password'
import { RegisterRequest, LoginRequest, AuthResponse } from '../types'

interface RegisterBody {
    Body: RegisterRequest
}

interface LoginBody {
    Body: LoginRequest
}

export async function setupAuthRoutes(fastify: FastifyInstance): Promise<void> {
    // Health check
    fastify.get('/health', async () => {
        return { status: 'ok', service: 'auth' }
    })

    // Register endpoint
    fastify.post<RegisterBody>(
        '/register',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'password', 'name'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string', minLength: 6 },
                        name: { type: 'string', minLength: 1 }
                    }
                }
            }
        },
        async (request: FastifyRequest<RegisterBody>, reply: FastifyReply) => {
            try {
                const { email, password, name } = request.body

                // Check if user already exists
                const existingUser = await db.findUserByEmail(email)
                if (existingUser) {
                    return reply.code(409).send({
                        statusCode: 409,
                        error: 'Conflict',
                        message: 'User with this email already exists'
                    })
                }

                // Hash password
                const hashedPassword = await hashPassword(password)

                // Create user
                const user = await db.createUser({
                    id: randomUUID(),
                    email,
                    password: hashedPassword,
                    name,
                    createdAt: new Date()
                })

                // Generate token
                const token = generateToken({
                    userId: user.id,
                    email: user.email
                })

                const response: AuthResponse = {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    }
                }

                return reply.code(201).send(response)
            } catch (error) {
                request.log.error(error, 'Registration error')
                return reply.code(500).send({
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'Failed to register user'
                })
            }
        }
    )

    // Login endpoint
    fastify.post<LoginBody>(
        '/login',
        {
            schema: {
                body: {
                    type: 'object',
                    required: ['email', 'password'],
                    properties: {
                        email: { type: 'string', format: 'email' },
                        password: { type: 'string' }
                    }
                }
            }
        },
        async (request: FastifyRequest<LoginBody>, reply: FastifyReply) => {
            try {
                const { email, password } = request.body

                // Find user
                const user = await db.findUserByEmail(email)
                if (!user) {
                    return reply.code(401).send({
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Invalid email or password'
                    })
                }

                // Verify password
                const isValidPassword = await comparePassword(password, user.password)
                if (!isValidPassword) {
                    return reply.code(401).send({
                        statusCode: 401,
                        error: 'Unauthorized',
                        message: 'Invalid email or password'
                    })
                }

                // Generate token
                const token = generateToken({
                    userId: user.id,
                    email: user.email
                })

                const response: AuthResponse = {
                    token,
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    }
                }

                return reply.code(200).send(response)
            } catch (error) {
                request.log.error(error, 'Login error')
                return reply.code(500).send({
                    statusCode: 500,
                    error: 'Internal Server Error',
                    message: 'Failed to login'
                })
            }
        }
    )
}
