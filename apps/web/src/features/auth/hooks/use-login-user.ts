import { apiFetch, setAccessToken } from '@/lib/apiFetch';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import { authApi } from '../auth-api';
import type { AuthResponse, LoginSchema } from '../auth-schemas';

export const useLoginUser = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: LoginSchema) => {
            return apiFetch<AuthResponse>(authApi.login, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        onSuccess: (data) => {
            setAccessToken(data.accessToken);
            toast.success('Account created successfully!');
            navigate('/');
        },
        onError: (error) => {
            toast.error(error.message);
        }
    });
};
