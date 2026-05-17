import * as z from 'zod/v4';

const userSchema = z.object({
    id: z.uuid(),
    username: z.string().min(3, 'Username must be at least 3 characters long'),
    email: z.email('Invalid email!'),
    firstName: z.string().nullish(),
    lastName: z.string().nullish(),
    createdAt: z.string(),
    updatedAt: z.string()
});

export type User = z.infer<typeof userSchema>;
