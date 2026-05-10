import { login, register } from '@controllers/auth-controller.js';
import { Router, type Request, type Response } from 'express';

const authRoutes: Router = Router();

authRoutes.post('/login', login);

authRoutes.post('/register', register);

export { authRoutes };
