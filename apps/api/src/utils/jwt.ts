import jwt, { type JwtPayload } from 'jsonwebtoken';
import { env } from '@/env.js';

export interface AuthPayload extends JwtPayload {
    id: string;
    email: string;
    username: string;
}

const jwtAccessSecret = env.JWT_ACCESS_SECRET;
const jwtAccessExpiry = env.JWT_ACCESS_EXPIRY;
const jwtRefreshSecret = env.JWT_REFRESH_SECRET;
const jwtRefreshExpiry = env.JWT_REFRESH_EXPIRY;

export const generateAccessJWTtoken = ({
    id,
    email,
    username
}: AuthPayload) => {
    return jwt.sign({ id, email, username }, jwtAccessSecret, {
        expiresIn: jwtAccessExpiry
    });
};

export const generateRefreshJWTtoken = ({
    id,
    email,
    username
}: AuthPayload) => {
    return jwt.sign({ id, email, username }, jwtRefreshSecret, {
        expiresIn: jwtRefreshExpiry
    });
};

export const verifyAccessJWT = (token: string): AuthPayload => {
    return jwt.verify(token, jwtAccessSecret) as AuthPayload;
};

export const verifyRefreshJWT = (token: string): AuthPayload => {
    return jwt.verify(token, jwtRefreshSecret) as AuthPayload;
};

export const safeVerifyRefreshJWT = (token: string): AuthPayload | null => {
    try {
        return verifyRefreshJWT(token);
    } catch {
        return null;
    }
};
