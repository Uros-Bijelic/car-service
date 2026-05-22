import { redis } from '@/lib/redis.js';
import rateLimit from 'express-rate-limit';
import RedisStore from 'rate-limit-redis';

const authStore = new RedisStore({
    prefix: 'rl:auth:',
    sendCommand: (...args: string[]) => redis.sendCommand(args)
});

const generalStore = new RedisStore({
    prefix: 'rl:general:',
    sendCommand: (...args: string[]) => redis.sendCommand(args)
});

export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 10, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    store: authStore, // Redis, Memcached, etc. See below.,
    message: { error: 'Too many login attempts. Please wait 15 minutes.' }
});

export const generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    limit: 100, // Limit each IP to 100 requests per `window` (here, per 15 minutes).
    standardHeaders: 'draft-8', // draft-6: `RateLimit-*` headers; draft-7 & draft-8: combined `RateLimit` header
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers.
    ipv6Subnet: 56, // Set to 60 or 64 to be less aggressive, or 52 or 48 to be more aggressive
    store: generalStore, // Redis, Memcached, etc. See below.,
    message: { error: 'Too many requests, please try again later.' }
});
