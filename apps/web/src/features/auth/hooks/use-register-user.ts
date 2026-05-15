import { apiFetch, setAccessToken } from '@/lib/apiFetch';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { useNavigate } from 'react-router';
import type { AuthResponse, RegisterSchema } from '../auth-schemas';
import { authApi } from '../auth-api';

export const useRegisterUser = () => {
    const navigate = useNavigate();

    return useMutation({
        mutationFn: async (data: RegisterSchema) => {
            return apiFetch<AuthResponse>(authApi.register, {
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
