import type { User } from '@/features/user/types';
import { createContext } from 'react';

type AuthContext = {
    user: User | null;
    isLoading: boolean;
};

export const AuthContext = createContext<AuthContext>({
    user: null,
    isLoading: false
});
