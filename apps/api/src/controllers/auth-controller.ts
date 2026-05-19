import { comparePasswords, hashPassword } from '@/utils/password.js';
import type { Response, Request, RequestHandler, CookieOptions } from 'express';
import { db } from '@/db/db.js';
import { users, type NewUser } from '@/db/schema.js';
import { eq } from 'drizzle-orm';
import {
    generateAccessJWTtoken,
    generateRefreshJWTtoken,
    verifyRefreshJWT
} from '@/utils/jwt.js';
import type { LoginSchema } from '@/routes/auth-routes.js';
import type { JwtPayload } from 'jsonwebtoken';
import env from '@/env.js';
import { asyncHandler } from '@/middleware/async-handler.js';
import { AppError, UnauthorizedError } from '../errors/AppError.js';

const isProd = env.NODE_ENV === 'production';

const refreshCookieOptions: CookieOptions = {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
};

export const register: RequestHandler = asyncHandler(
    async (req: Request<unknown, unknown, NewUser>, res: Response) => {
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
            throw new AppError('Failed to create user', 500);
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
    }
);

export const login: RequestHandler = asyncHandler(
    async (req: Request<unknown, unknown, LoginSchema>, res: Response) => {
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
            throw new UnauthorizedError();
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
    }
);

export const refreshToken: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const incomingRefreshToken = req.cookies.refreshToken;

        if (!incomingRefreshToken) {
            throw new UnauthorizedError();
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
            throw new UnauthorizedError();
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
    }
);

export const logout: RequestHandler = asyncHandler(
    async (req: Request, res: Response) => {
        const refreshToken = req.cookies.refreshToken;

        if (!refreshToken) {
            throw new UnauthorizedError('Not logged in');
        }

        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? ('none' as const) : ('lax' as const)
        });

        return res.json({ message: 'Logged out' });
    }
);
