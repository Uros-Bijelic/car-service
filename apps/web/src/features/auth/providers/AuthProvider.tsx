import { useRefetchToken } from '@/features/auth/hooks/use-refetch-token';
import { setAccessToken } from '@/lib/apiFetch';
import { AuthContext } from './auth-context';
import { useEffect } from 'react';

type Props = {
    children: React.ReactNode;
};

export default function AuthProvider({ children }: Props) {
    const { data, isLoading } = useRefetchToken();

    const user = data?.user ?? null;

    useEffect(() => {
        setAccessToken(data?.accessToken ?? null);
    }, [data?.accessToken]);

    return (
        <AuthContext.Provider value={{ user, isLoading }}>
            {children}
        </AuthContext.Provider>
    );
}
