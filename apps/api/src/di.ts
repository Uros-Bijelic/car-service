import { db } from '@/db/db.js';
import { UserRepository } from '@/repositories/user-repository.js';
import { AuthService } from '@/services/auth-service.js';
import { AuthController } from '@/controllers/auth-controller.js';

const userRepo = new UserRepository(db);
export const authService = new AuthService(userRepo);
export const authController = new AuthController(authService);
