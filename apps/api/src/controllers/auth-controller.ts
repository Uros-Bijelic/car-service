import { hashPassword } from '@utils/password.js';
import type { Response, Request } from 'express';
import { db } from '@db/db.js';
import { users } from '@db/schema.js';

export const register = async (req: Request, res: Response) => {
    try {
        const { username, email, password, firstName, lastName, phone } =
            req.body;

        const hashedPassword = await hashPassword(password);

        const result = await db
            .insert(users)
            .values({
                username,
                email,
                password: hashedPassword,
                firstName,
                lastName,
                phone
            })
            .returning({
                username,
                email,
                firstName,
                lastName,
                phone
            });

        console.log('result', result);
    } catch (e) {
        console.error('Error on register', e);
    }
};

export const login = async (req: Request, res: Response) => {
    try {
        // const { username, email, password } = req.body;
        res.send('login');
    } catch (e) {
        console.error('Error on login', e);
    }
};
