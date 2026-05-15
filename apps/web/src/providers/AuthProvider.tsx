import { useRefetchToken } from '@/features/auth/hooks/use-refetch-token';
import type { User } from '@/features/user/types';
import { setAccessToken } from '@/lib/apiFetch';
import { createContext } from 'react';

type AuthContext = {
    user: User | null;
    isLoading: boolean;
};

type Props = {
    children: React.ReactNode;
};

const AuthContext = createContext<AuthContext>({
    user: null,
    isLoading: false
});

export default function AuthProvider({ children }: Props) {
    const { data, isLoading } = useRefetchToken();

    const user = data?.user ?? null;

    if (data?.accessToken) {
        setAccessToken(data.accessToken);
    } else {
        setAccessToken(null);
    }

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
