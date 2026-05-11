import jwt, { type JwtPayload } from 'jsonwebtoken';

export const generateAccessJWTtoken = (payload: JwtPayload) => {
    const jwtSecret = process.env.JWT_ACCESS_SECRET!;

    return jwt.sign(payload, jwtSecret, { expiresIn: '15mins' });
};
export const generateRefreshJWTtoken = (payload: JwtPayload) => {
    const jwtSecret = process.env.JWT_REFRESH_SECRET!;

    return jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
};

export const verifyAccessJWT = (token: string) => {
    const jwtSecret = process.env.JWT_ACCESS_SECRET!;

    return jwt.verify(token, jwtSecret);
};

export const verifyRefreshJWT = (token: string) => {
    const jwtSecret = process.env.JWT_REFRESH_SECRET!;

    return jwt.verify(token, jwtSecret);
};
