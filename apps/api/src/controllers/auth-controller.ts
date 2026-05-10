import { hashPassword } from '@utils/password.js';
import type { Response, Request } from 'express';
import { db } from '@db/db.js';
import { users, type NewUser } from '@db/schema.js';
import { DatabaseError } from 'pg';
import { DrizzleQueryError } from 'drizzle-orm';
import { generateJWTtoken } from '@utils/jwt.js';

export const register = async (
    req: Request<unknown, unknown, NewUser>,
    res: Response
) => {
    try {
        const { email, password, username, firstName, lastName, phone } =
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
                id: users.id,
                username: users.username,
                email: users.email,
                firstName: users.firstName,
                lastName: users.lastName,
                phone: users.phone
            });

        if (!user) {
            return res.status(500).json({
                error: 'Failed to create user'
            });
        }

        const token = generateJWTtoken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        res.cookie('token', token, {
            httpOnly: true, // Prevents JS access (XSS protection)
            secure: process.env.NODE_ENV === 'production', // Only sent over HTTPS in production
            sameSite: 'strict', // Helps mitigate CSRF attacks
            maxAge: 1000 * 60 * 60 // Cookie expiration (1 hour in ms)
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
