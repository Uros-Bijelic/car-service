import { useRefetchToken } from '@/features/auth/hooks/use-refetch-token';
import { setAccessToken } from '@/lib/apiFetch';
import { AuthContext } from './auth-context';

type Props = {
    children: React.ReactNode;
};

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
