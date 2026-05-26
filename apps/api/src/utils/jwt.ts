import jwt, { type JwtPayload, type SignOptions } from 'jsonwebtoken';
import { createHash } from 'crypto';
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

export const parseTokenExpiryToSeconds = (
    expiry: SignOptions['expiresIn']
): number => {
    if (typeof expiry === 'number') {
        return expiry;
    }
    if (!expiry) {
        return 900;
    }
    if (expiry.endsWith('d')) return parseInt(expiry) * 24 * 60 * 60;
    if (expiry.endsWith('h')) return parseInt(expiry) * 60 * 60;
    if (expiry.endsWith('m')) return parseInt(expiry) * 60;
    if (expiry.endsWith('s')) return parseInt(expiry);
    return 900;
};

export const hashToken = (token: string) => {
    return createHash('sha256').update(token).digest('hex');
};

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
