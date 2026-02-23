import { User } from './types'

// In-memory database for demonstration
// Replace with actual database in production
class Database {
    private users: Map<string, User> = new Map()
    private emailIndex: Map<string, string> = new Map()

    async createUser(user: User): Promise<User> {
        if (this.emailIndex.has(user.email)) {
            throw new Error('User with this email already exists')
        }

        this.users.set(user.id, user)
        this.emailIndex.set(user.email, user.id)
        return user
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const userId = this.emailIndex.get(email)
        if (!userId) return null
        return this.users.get(userId) || null
    }

    async findUserById(id: string): Promise<User | null> {
        return this.users.get(id) || null
    }

    async getAllUsers(): Promise<User[]> {
        return Array.from(this.users.values())
    }
}

export const db = new Database()
