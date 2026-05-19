import { authApi } from '@/features/auth/auth-api';
import { authQueryKeys } from '@/features/auth/query-keys';
import { apiFetch, setAccessToken } from '@/lib/apiFetch';
import { queryClient } from '@/lib/query-client';
import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';

type LogoutResponse = {
    message: string;
};

export const useLogoutUser = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async () => {
            return apiFetch<LogoutResponse>(authApi.logout, {
                method: 'POST'
            });
        },
        onSuccess: () => {
            toast.success('You have logged out successfully');
        },
        onError: (error) => {
            toast.error(error.message);
        },
        onSettled: () => {
            setAccessToken(null);
            queryClient.setQueryData(authQueryKeys.refresh, null);
            navigate('/login', { replace: true });
        }
    });
};
