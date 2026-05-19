import env from '@/env.js';
import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
    const saltRounds = env.SALT_ROUNDS;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    return hashedPassword;
};

export const comparePasswords = async (
    password: string,
    hashedPassword: string
) => {
    return await bcrypt.compare(password, hashedPassword);
};
