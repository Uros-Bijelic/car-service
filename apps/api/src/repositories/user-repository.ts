import { eq } from 'drizzle-orm';
import { db } from '@/db/db.js';
import { users, type NewUser, type User } from '@/db/schema.js';
import { AppError } from '@/errors/AppError.js';

export type NoPasswordUser = Omit<User, 'password'>;

export class UserRepository {
    constructor(private database: typeof db) {}

    async createUser({
        email,
        password,
        username,
        firstName,
        lastName,
        phone,
        role
    }: NewUser): Promise<NoPasswordUser> {
        const [user] = await this.database
            .insert(users)
            .values({
                username,
                email,
                password,
                firstName,
                lastName,
                phone,
                role
            })
            .returning({
                id: users.id,
                username: users.username,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                phone: users.phone,
                role: users.role,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt
            });

        if (!user) throw new AppError('Failed to create user', 500);

        return user;
    }

    async findByEmail(email: string) {
        return this.database.query.users.findFirst({
            where: eq(users.email, email),
            columns: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phone: true
            }
        });
    }

    async findById(id: string) {
        return this.database.query.users.findFirst({
            where: eq(users.id, id),
            columns: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phone: true
            }
        });
    }

    async findByUsername(username: string) {
        return this.database.query.users.findFirst({
            where: eq(users.username, username),
            columns: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phone: true
            }
        });
    }

    async findByEmailWithPassword(email: string) {
        return this.database.query.users.findFirst({
            where: eq(users.email, email)
        });
    }
}
