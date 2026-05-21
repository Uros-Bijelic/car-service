import type { Response, Request, RequestHandler } from 'express';
import type { NewUser } from '@/db/schema.js';

import type { LoginSchema } from '@repo/types/auth';
import { asyncHandler } from '@/middleware/async-handler.js';
import type { AuthService } from '@/services/auth-service.js';
import { clearCookieOptions, refreshCookieOptions } from '@/utils/cookie.js';

export class AuthController {
    constructor(private authService: AuthService) {}

    register: RequestHandler = asyncHandler(
        async (req: Request<unknown, unknown, NewUser>, res: Response) => {
            const { user, accessToken, refreshToken } =
                await this.authService.register(req.body);
            res.cookie('refreshToken', refreshToken, refreshCookieOptions);

            return res.status(201).json({
                user,
                accessToken
            });
        }
    );

    login: RequestHandler = asyncHandler(
        async (req: Request<unknown, unknown, LoginSchema>, res: Response) => {
            const { email, password } = req.body;

            const { user, accessToken, refreshToken } =
                await this.authService.login(email, password);
            res.cookie('refreshToken', refreshToken, refreshCookieOptions);

            return res.status(200).json({
                user,
                accessToken
            });
        }
    );

    refreshToken: RequestHandler = asyncHandler(
        async (req: Request<unknown, unknown, LoginSchema>, res: Response) => {
            const incomingRefreshToken = req.cookies.refreshToken;

            const { user, accessToken, refreshToken } =
                await this.authService.refreshToken(incomingRefreshToken);

            res.cookie('refreshToken', refreshToken, refreshCookieOptions);

            res.status(200).json({
                user,
                accessToken
            });
        }
    );

    logout: RequestHandler = asyncHandler(
        async (req: Request, res: Response) => {
            const refreshToken = req.cookies.refreshToken;

            await this.authService.logout(refreshToken);

            res.clearCookie('refreshToken', clearCookieOptions);

            return res.json({ message: 'Logged out' });
        }
    );
}
