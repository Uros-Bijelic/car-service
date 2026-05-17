import { comparePasswords, hashPassword } from '@utils/password.js';
import type { Response, Request } from 'express';
import { db } from '@db/db.js';
import { users, type NewUser } from '@db/schema.js';
import { DatabaseError } from 'pg';
import { DrizzleQueryError, eq } from 'drizzle-orm';
import {
    generateAccessJWTtoken,
    generateRefreshJWTtoken,
    verifyRefreshJWT
} from '@utils/jwt.js';
import type { LoginSchema } from '@routes/auth-routes.js';
import type { JwtPayload } from 'jsonwebtoken';
import env from '@env/.js';

const isProd = env.NODE_ENV === 'production';

const refreshCookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? ('none' as const) : ('lax' as const),
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
};

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
                phone: users.phone,
                createdAt: users.createdAt,
                updatedAt: users.updatedAt
            });

        if (!user) {
            return res.status(500).json({
                message: 'Failed to create user'
            });
        }

        const accessToken = generateAccessJWTtoken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        const refreshToken = generateRefreshJWTtoken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        res.cookie('refreshToken', refreshToken, refreshCookieOptions);

        return res.status(201).json({
            user,
            accessToken
        });
    } catch (e) {
        console.error('Error on register', e);
        if (
            e instanceof DrizzleQueryError &&
            e.cause instanceof DatabaseError
        ) {
            const pgError = e.cause;
            if (pgError.code === '23505') {
                return res.status(409).json({
                    message: 'An account with these credentials already exists.'
                });
            }
        }

        return res.status(500).json({
            message: 'Failed to create a new user'
        });
    }
};

export const login = async (
    req: Request<unknown, unknown, LoginSchema>,
    res: Response
) => {
    try {
        const { email, password } = req.body;

        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const isValidPassword = await comparePasswords(password, user.password);

        if (!isValidPassword) {
            return res.status(401).json({
                message: 'Invalid credentials'
            });
        }

        const accessToken = generateAccessJWTtoken({
            id: user.id,
            email: user.email,
            username: user.username
        });
        const refreshToken = generateRefreshJWTtoken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        res.cookie('refreshToken', refreshToken, refreshCookieOptions);

        res.json({
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            },
            accessToken
        });
    } catch (e) {
        console.error('Error on login', e);

        res.status(500).json({
            message: 'Failed to login'
        });
    }
};

export const refreshToken = async (req: Request, res: Response) => {
    try {
        const incomingRefreshToken = req.cookies.refreshToken;

        if (!incomingRefreshToken) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        const payload = verifyRefreshJWT(incomingRefreshToken) as JwtPayload;

        const user = await db.query.users.findFirst({
            where: eq(users.id, payload.id),
            columns: {
                id: true,
                email: true,
                username: true,
                firstName: true,
                lastName: true,
                phone: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) {
            return res.status(401).json({
                message: 'Unauthorized'
            });
        }

        const accessToken = generateAccessJWTtoken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        const rotatedRefreshToken = generateRefreshJWTtoken({
            id: user.id,
            email: user.email,
            username: user.username
        });

        res.cookie('refreshToken', rotatedRefreshToken, refreshCookieOptions);

        res.status(200).json({
            user,
            accessToken
        });
    } catch (e) {
        console.log('Invalid refresh token', e);
        return res.status(401).json({ message: 'Invalid refresh token' });
    }
};

export const logout = async (req: Request, res: Response) => {
    const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
        return res.status(401).json({
            message: 'Already logged out'
        });
    }

    res.clearCookie('refreshToken', {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? ('none' as const) : ('lax' as const)
    });

    return res.json({ message: 'Logged out' });
};
