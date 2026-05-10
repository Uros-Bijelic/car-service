import jwt, { type JwtPayload } from 'jsonwebtoken';
import { createPrivateKey } from 'crypto';

export const generateJWTtoken = (payload: JwtPayload) => {
    const jwtSecret = process.env.JWT_SECRET!;

    return jwt.sign(payload, jwtSecret);
};

export const verifyJWT = (token: string) => {
    const jwtSecret = process.env.JWT_SECRET!;
    return jwt.verify(token, jwtSecret);
};
