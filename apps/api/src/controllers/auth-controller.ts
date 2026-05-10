import { hashPassword } from '@utils/password.js';
import type { Response, Request } from 'express';
import { db } from '@db/db.js';
import { users } from '@db/schema.js';
import { DatabaseError } from 'pg';
import { DrizzleQueryError } from 'drizzle-orm';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, firstName, lastName, phone } =
            req.body;

        const hashedPassword = await hashPassword(password);

        const [user] = await db
            .insert(users)
            .values({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone
            })
            .returning({
                username: users.username,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                phone: users.phone
            });

        return res.status(201).json({
            message: 'User created',
            user
        });
    } catch (e) {
        console.error('Error on register', e);
        if (
            e instanceof DrizzleQueryError &&
            e.cause instanceof DatabaseError
        ) {
            const pgError = e.cause;
            if (pgError.code === '23505') {
                if (pgError.constraint === 'users_username_unique') {
                    return res.status(409).json({
                        error: 'An account with provided username already exists.'
                    });
                }
                if (pgError.constraint === 'users_email_unique') {
                    return res.status(409).json({
                        error: 'An account with provided email already exists.'
                    });
                }
            }
        }

        return res.status(500).json({
            error: 'Failed to create a new user'
        });
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        // const { username, email, password } = req.body;
        res.send('login');
    } catch (e) {
        console.error('Error on login', e);
    }
};
