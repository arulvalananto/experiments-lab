import { query } from './common/db'
import { User } from './types'

// Database class with PostgreSQL implementation
class Database {
    async createUser(user: User): Promise<User> {
        const existingUser = await this.findUserByEmail(user.email)
        if (existingUser) {
            throw new Error('User with this email already exists')
        }

        const result = await query<User>(
            `INSERT INTO users (id, email, password, name, created_at)
             VALUES ($1, $2, $3, $4, $5)
             RETURNING id, email, password, name, created_at as "createdAt"`,
            [user.id, user.email, user.password, user.name, user.createdAt]
        )

        return result[0]
    }

    async findUserByEmail(email: string): Promise<User | null> {
        const result = await query<User>(
            `SELECT id, email, password, name, created_at as "createdAt"
             FROM users
             WHERE email = $1`,
            [email]
        )

        return result.length > 0 ? result[0] : null
    }

    async findUserById(id: string): Promise<User | null> {
        const result = await query<User>(
            `SELECT id, email, password, name, created_at as "createdAt"
             FROM users
             WHERE id = $1`,
            [id]
        )

        return result.length > 0 ? result[0] : null
    }

    async getAllUsers(): Promise<User[]> {
        return query<User>(
            `SELECT id, email, password, name, created_at as "createdAt"
             FROM users
             ORDER BY created_at DESC`
        )
    }

    async deleteUser(id: string): Promise<boolean> {
        const result = await query(`DELETE FROM users WHERE id = $1`, [id])
        return (result as any).rowCount > 0
    }

    async updateUser(
        id: string,
        updates: Partial<Omit<User, 'id' | 'createdAt'>>
    ): Promise<User | null> {
        const fields: string[] = []
        const values: any[] = []
        let paramIndex = 1

        if (updates.email) {
            fields.push(`email = $${paramIndex++}`)
            values.push(updates.email)
        }
        if (updates.password) {
            fields.push(`password = $${paramIndex++}`)
            values.push(updates.password)
        }
        if (updates.name) {
            fields.push(`name = $${paramIndex++}`)
            values.push(updates.name)
        }

        if (fields.length === 0) {
            return this.findUserById(id)
        }

        fields.push(`updated_at = CURRENT_TIMESTAMP`)
        values.push(id)

        const result = await query<User>(
            `UPDATE users
             SET ${fields.join(', ')}
             WHERE id = $${paramIndex}
             RETURNING id, email, password, name, created_at as "createdAt"`,
            values
        )

        return result.length > 0 ? result[0] : null
    }
}

export const db = new Database()
