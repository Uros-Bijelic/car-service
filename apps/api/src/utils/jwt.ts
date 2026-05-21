import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '@/env.js';

export interface AuthPayload extends JwtPayload {
    id: string;
    email: string;
    username: string;
}

export const generateAccessJWTtoken = (payload: AuthPayload) => {
    const jwtSecret = env.JWT_ACCESS_SECRET;

    return jwt.sign(payload, jwtSecret, { expiresIn: '15mins' });
};
export const generateRefreshJWTtoken = (payload: AuthPayload) => {
    const jwtSecret = env.JWT_REFRESH_SECRET;

    return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
};

export const verifyAccessJWT = (token: string): AuthPayload => {
    const jwtSecret = env.JWT_ACCESS_SECRET;

    return jwt.verify(token, jwtSecret) as AuthPayload;
};

export const verifyRefreshJWT = (token: string): AuthPayload => {
    const jwtSecret = env.JWT_REFRESH_SECRET;

    return jwt.verify(token, jwtSecret) as AuthPayload;
};
