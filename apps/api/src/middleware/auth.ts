import type { Request, Response, NextFunction, RequestHandler } from 'express';
import { asyncHandler } from './async-handler.js';
import { UnauthorizedError } from '../errors/AppError.js';
import { verifyAccessJWT } from '@/utils/jwt.js';
import { authService } from '@/di.js';

export const authenticateToken: RequestHandler = asyncHandler(
    async (req: Request, _res: Response, next: NextFunction) => {
        const authHeader = req.headers['authorization'];

        const token = authHeader && authHeader.split(' ')[1];

        if (!token) {
            throw new UnauthorizedError('Token is not provided');
        }

        const decoded = verifyAccessJWT(token);

        const isBlackListed = await authService.isBlacklisted(token);

        if (isBlackListed) {
            throw new UnauthorizedError('Token has been invalidated');
        }

        req.user = decoded;

        next();
    }
);
