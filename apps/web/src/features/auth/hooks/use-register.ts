import { apiFetch } from '@/lib/apiFetch';
import { useMutation } from '@tanstack/react-query';
import { authApi } from './auth-api';
import type { RegisterSchema } from '@/pages/Register';
import type { RegisterResponse } from './types';

export const useRegister = () => {
    return useMutation({
        mutationFn: async (data: RegisterSchema) => {
            return apiFetch<RegisterResponse>(authApi.register, null, {
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
