import { z } from 'zod';

const envSchema = z.object({
    NODE_ENV: z
        .enum(['development', 'test', 'production'])
        .default('development'),
    // APP_STAGE: z.enum(['dev', 'test', 'production']).default('dev'),
    PORT: z.coerce.number(),
    DATABASE_URL: z.string().startsWith('postgresql://'),
    JWT_ACCESS_SECRET: z.string().min(44, 'Must be 44 chars long'),
    JWT_REFRESH_SECRET: z.string().min(44, 'Must be 44 chars long'),
    JWT_ACCESS_EXPIRY: z.string().default('15m'),
    JWT_REFRESH_EXPIRY: z.string().default('7d'),
    SALT_ROUNDS: z.coerce.number().min(10).max(20).default(12)
});

export type ENV = z.infer<typeof envSchema>;
let env: ENV;

try {
    env = envSchema.parse(process.env);
} catch (err) {
    if (err instanceof z.ZodError) {
        console.log('Invalid env var');
        console.error(JSON.stringify(z.flattenError(err)));

        err.issues.forEach((err) => {
            const path = err.path.join('.');
            console.log(`${path}: ${err.message}`);
        });

        process.exit(1);
    }

    throw err;
}

export { env };
