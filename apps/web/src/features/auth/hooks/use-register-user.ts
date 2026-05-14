import { apiFetch } from '@/lib/apiFetch';
import { useMutation } from '@tanstack/react-query';
import { authApi } from '../auth-api';
import type { AuthResponse, RegisterSchema } from '../auth.schemas';

export const useRegisterUser = () => {
    return useMutation({
        mutationFn: async (data: RegisterSchema) => {
            return apiFetch<AuthResponse>(authApi.register, null, {
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
