// di.ts
import { db } from '@/db/db.js';
import { UserRepository } from '@/repositories/user-repository.js';
import { AuthService } from '@/services/auth-service.js';
import { AuthController } from '@/controllers/auth-controller.js';

// built once, shared everywhere
const userRepo = new UserRepository(db);
const authService = new AuthService(userRepo);
export const authController = new AuthController(authService);
