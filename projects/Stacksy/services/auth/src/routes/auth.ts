import { randomUUID } from 'crypto'
import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify'
import { ZodError } from 'zod'

import { db } from '../database'
import { generateToken } from '../common/jwt'
import { hashPassword, comparePassword } from '../common/password'
import { RegisterRequestSchema, LoginRequestSchema, AuthResponse } from '../schemas'
import { RegisterRequest, LoginRequest } from '../types'

interface RegisterBody {
    Body: RegisterRequest
}

interface LoginBody {
    Body: LoginRequest
}

// Helper to handle Zod validation errors
function handleValidationError(error: ZodError, reply: FastifyReply) {
    const validationErrors = error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message
    }))

    return reply.code(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: 'Validation failed',
        errors: validationErrors
    })
}

export async function setupAuthRoutes(fastify: FastifyInstance): Promise<void> {
    // Health check
    fastify.get('/health', async () => {
        return { status: 'ok', service: 'auth' }
    })

    // Register endpoint
    fastify.post<RegisterBody>(
        '/register',
        async (request: FastifyRequest<RegisterBody>, reply: FastifyReply) => {
            try {
                // Validate request body with Zod
                const validatedData = RegisterRequestSchema.parse(request.body)
                const { email, password, name } = validatedData

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
                if (error instanceof ZodError) {
                    return handleValidationError(error, reply)
                }

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
        async (request: FastifyRequest<LoginBody>, reply: FastifyReply) => {
            try {
                // Validate request body with Zod
                const validatedData = LoginRequestSchema.parse(request.body)
                const { email, password } = validatedData

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
                if (error instanceof ZodError) {
                    return handleValidationError(error, reply)
                }

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
