import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { asyncHandler } from './async-handler.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { verifyAccessJWT } from '@/utils/jwt.js';

export const authenticateToken: RequestHandler = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        const authToken = req.headers['authorization'];

        const token = authToken && authToken.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('Token is not provided');
        }

        const decoded = verifyAccessJWT(token);

        req.user = decoded;

        next();
    }
);
