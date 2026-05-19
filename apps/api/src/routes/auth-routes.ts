import { Router } from 'express';
import { z } from 'zod';
import {
    login,
    logout,
    refreshToken,
    register
} from '@/controllers/auth-controller.js';
import { insertUserSchema } from '@/db/schema.js';
import { validateBody } from '@/middleware/validation.js';

export const loginSchema = z.object({
    email: z.email('Invalid Email!'),
    password: z.string().min(6, 'Password must be at least 6 characters long!')
});

export type LoginSchema = z.infer<typeof loginSchema>;

const authRoutes: Router = Router();

authRoutes.post('/login', validateBody(loginSchema), login);

authRoutes.post('/register', validateBody(insertUserSchema), register);

authRoutes.post('/refresh-token', refreshToken);

authRoutes.post('/logout', logout);

export { authRoutes };
