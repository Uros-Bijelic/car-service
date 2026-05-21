import type { NewUser } from '@/db/schema.js';
import { ConflictError, UnauthorizedError } from '@/errors/AppError.js';
import { UserRepository } from '@/repositories/user-repository.js';
import {
    generateAccessJWTtoken,
    generateRefreshJWTtoken,
    safeVerifyRefreshJWT
} from '@/utils/jwt.js';
import { comparePasswords, hashPassword } from '@/utils/password.js';

export class AuthService {
    constructor(private userRepo: UserRepository) {}

    async register({
        email,
        password,
        username,
        firstName,
        lastName,
        phone,
        role
    }: NewUser) {
        const existingEmail = await this.userRepo.findByEmail(email);
        if (existingEmail) {
            throw new ConflictError('Account already exists');
        }

        const existingUsername = await this.userRepo.findByUsername(username);
        if (existingUsername) {
            throw new ConflictError('Account already exists');
        }

        const hashedPassword = await hashPassword(password);

        const user = await this.userRepo.createUser({
            username,
            email,
            password: hashedPassword,
            firstName,
            lastName,
            phone,
            role
        });

        const payload = {
            id: user.id,
            email: user.email,
            username: user.username
        };
        const accessToken = generateAccessJWTtoken(payload);
        const refreshToken = generateRefreshJWTtoken(payload);

        return { user, accessToken, refreshToken };
    }

    async login(email: string, incomingPassword: string) {
        const user = await this.userRepo.findByEmailWithPassword(email);

        if (!user) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const isValidPassword = await comparePasswords(
            incomingPassword,
            user.password
        );

        if (!isValidPassword) {
            throw new UnauthorizedError('Invalid credentials');
        }

        const { password, ...noPasswordUser } = user;
        const payload = {
            id: noPasswordUser.id,
            email: noPasswordUser.email,
            username: noPasswordUser.username
        };

        const accessToken = generateAccessJWTtoken(payload);
        const refreshToken = generateRefreshJWTtoken(payload);

        return {
            user: noPasswordUser,
            accessToken,
            refreshToken
        };
    }

    async refreshToken(incomingRefreshToken: string) {
        if (!incomingRefreshToken) {
            throw new UnauthorizedError('Refresh token is missing');
        }

        const payload = safeVerifyRefreshJWT(incomingRefreshToken);

        if (!payload) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        const user = await this.userRepo.findById(payload.id);

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        const newPayload = {
            id: user.id,
            email: user.email,
            username: user.username
        };

        const accessToken = generateAccessJWTtoken(newPayload);
        const refreshToken = generateRefreshJWTtoken(newPayload);

        return {
            user,
            accessToken,
            refreshToken
        };
    }

    async logout(incomingRefreshToken: string) {
        if (!incomingRefreshToken) {
            throw new UnauthorizedError('Not logged in');
        }
    }
}
