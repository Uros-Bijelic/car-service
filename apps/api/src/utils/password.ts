import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) => {
    const solt = 12;
    const hashedPassword = await bcrypt.hash(password, solt);
    console.log('hashedPassword', hashedPassword);

    return hashedPassword;
};

export const comparePasswords = async (
    password: string,
    hashedPassword: string
) => {
    return await bcrypt.compare(password, hashedPassword);
};
