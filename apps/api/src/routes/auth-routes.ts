import { login, register } from '@controllers/auth-controller.js';
import { insertUserSchema } from '@db/schema.js';
import { validateBody } from '@middleware/validation.js';
import { Router } from 'express';

import { z } from 'zod';

export const registerSchema = z.object({
    username: z.string().min(3, 'Username must be at least 3 characters long!'),
    email: z.email('Invalid Email!'),
    password: z.string().min(8, 'Password must be at least 8 characters long!'),
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    phone: z.string().optional()
});

export type RegisterSchema = z.infer<typeof registerSchema>;

const authRoutes: Router = Router();

authRoutes.post('/login', login);

authRoutes.post('/register', validateBody(insertUserSchema), register);

export { authRoutes };
