import type { Response, Request } from 'express';

export const register = async (req: Request, res: Response) => {
    try {
        // const { username, email, password } = req.body;
        res.send('register');
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
