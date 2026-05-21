import { defineConfig } from 'drizzle-kit';
import { config as loadEnv } from 'dotenv';
import { z } from 'zod';

loadEnv({ path: '.env' });

const migrationEnv = z.object({
    DATABASE_URL: z.string().startsWith('postgresql://')
});

const { DATABASE_URL } = migrationEnv.parse(process.env);

export default defineConfig({
    dialect: 'postgresql',
    schema: './src/db/schema.ts',
    out: './drizzle',
    dbCredentials: {
        url: DATABASE_URL,
        ssl: true
    },
    verbose: true,
    strict: true
});
