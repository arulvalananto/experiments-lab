import { z } from 'zod'

// User schema for database
export const UserSchema = z.object({
    id: z.uuid(),
    email: z.email(),
    password: z.string(),
    name: z.string(),
    createdAt: z.date()
})

// Registration request schema
export const RegisterRequestSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(6, 'Password must be at least 6 characters'),
    name: z.string().min(1, 'Name is required').max(255, 'Name is too long')
})

// Login request schema
export const LoginRequestSchema = z.object({
    email: z.email('Invalid email address'),
    password: z.string().min(1, 'Password is required')
})

// Auth response schema
export const AuthResponseSchema = z.object({
    token: z.string(),
    user: z.object({
        id: z.uuid(),
        email: z.email(),
        name: z.string()
    })
})

// Token payload schema
export const TokenPayloadSchema = z.object({
    userId: z.uuid(),
    email: z.email()
})

// Type exports (inferred from schemas)
export type User = z.infer<typeof UserSchema>
export type RegisterRequest = z.infer<typeof RegisterRequestSchema>
export type LoginRequest = z.infer<typeof LoginRequestSchema>
export type AuthResponse = z.infer<typeof AuthResponseSchema>
export type TokenPayload = z.infer<typeof TokenPayloadSchema>
