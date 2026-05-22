import { createClient, type RedisClientType } from 'redis';
import { env } from '@/env.js';

export const redis: RedisClientType = createClient({
    url: env.REDIS_URL
});

redis.on('error', (err) => console.error('Redis Client Error', err));
redis.on('connect', () => console.log('Redis connected'));

await redis.connect();
