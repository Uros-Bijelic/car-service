import { apiFetch } from '@/lib/apiFetch';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../auth-api';
import type { AuthResponse, LoginSchema } from '../auth-schemas';

export const useLoginUser = () => {
    return useMutation({
        mutationFn: async (data: LoginSchema) => {
            return apiFetch<AuthResponse>(authApi.login, null, {
                method: 'POST',
                body: JSON.stringify(data)
            });
        },
        onSuccess: (data) => {
            // setToken(data.accessToken);
            // toast.success('Account created successfully!');
        },
        onError: (error) => {
            // toast.error(error.message);
        }
    });
};
