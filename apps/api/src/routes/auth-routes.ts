import { Router } from 'express';
import { authController } from '@/di.js';
import { validateBody } from '@/middleware/validation.js';
import { loginSchema, registerSchema } from '@repo/types/auth';

const authRoutes: Router = Router();

authRoutes.post('/login', validateBody(loginSchema), authController.login);

authRoutes.post(
    '/register',
    validateBody(registerSchema),
    authController.register
);

authRoutes.post('/refresh-token', authController.refreshToken);

authRoutes.post('/logout', authController.logout);

export { authRoutes };
