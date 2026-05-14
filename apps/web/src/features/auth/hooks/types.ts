import type { User } from '@/features/user/types';

export type RegisterResponse = {
    user: User;
    accessToken: string;
};

export type LoginResponse = {
    user: User;
    accessToken: string;
};
