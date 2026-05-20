import { eq } from 'drizzle-orm';
import { db } from '@/db/db.js';
import { users, type NewUser, type User } from '@/db/schema.js';
import { hashPassword } from '@/utils/password.js';
import { AppError } from '@/errors/AppError.js';

export type SafeUser = Omit<User, 'password'>;

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
    }: NewUser): Promise<SafeUser> {
        const hashedPassword = await hashPassword(password);

        const [user] = await this.database
            .insert(users)
            .values({
                username,
                email,
                password: hashedPassword,
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
}
