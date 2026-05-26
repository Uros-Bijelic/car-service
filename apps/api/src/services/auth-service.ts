import type { NewUser } from '@/db/schema.js';
import { env } from '@/env.js';
import { ConflictError, UnauthorizedError } from '@/errors/AppError.js';
import { REDIS_KEYS } from '@/lib/redis-keys.js';
import { redis } from '@/lib/redis.js';
import { UserRepository } from '@/repositories/user-repository.js';
import {
    generateAccessJWTtoken,
    generateRefreshJWTtoken,
    hashToken,
    parseTokenExpiryToSeconds,
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

        const isRefreshBlacklisted =
            await this.isBlacklisted(incomingRefreshToken);
        if (isRefreshBlacklisted) {
            throw new UnauthorizedError('Refresh token has been invalidated');
        }

        const payload = safeVerifyRefreshJWT(incomingRefreshToken);

        if (!payload) {
            throw new UnauthorizedError('Invalid or expired refresh token');
        }

        const user = await this.userRepo.findById(payload.id);

        if (!user) {
            throw new UnauthorizedError('User not found');
        }

        const refreshExpiry = parseTokenExpiryToSeconds(env.JWT_REFRESH_EXPIRY);

        await redis.set(
            REDIS_KEYS.blacklist(hashToken(incomingRefreshToken)),
            '1',
            {
                EX: refreshExpiry
            }
        );

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

    async isBlacklisted(token: string) {
        const result = await redis.get(REDIS_KEYS.blacklist(hashToken(token)));
        return result !== null;
    }

    async logout(incomingRefreshToken: string, accessToken: string | null) {
        if (!incomingRefreshToken) {
            throw new UnauthorizedError('Not logged in');
        }

        const refreshExpiry = parseTokenExpiryToSeconds(env.JWT_REFRESH_EXPIRY);
        const accessExpiry = parseTokenExpiryToSeconds(env.JWT_ACCESS_EXPIRY);

        await Promise.all([
            redis.set(
                REDIS_KEYS.blacklist(hashToken(incomingRefreshToken)),
                '1',
                {
                    EX: refreshExpiry
                }
            ),
            accessToken
                ? redis.set(REDIS_KEYS.blacklist(hashToken(accessToken)), '1', {
                      EX: accessExpiry
                  })
                : Promise.resolve()
        ]);
    }
}
