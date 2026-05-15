import { authApi } from '@/features/auth/auth-api';
import type { AuthResponse } from '@/features/auth/auth-schemas';
import { queryClient } from './query-client';
import { authQueryKeys } from '@/features/auth/query-keys';

let accessToken: string | null = null;

export const getAccessToken = () => accessToken;
export const setAccessToken = (token: string | null) => {
    accessToken = token;
};
const BASE_URL = import.meta.env.VITE_BASE_API_URL;

const fetchWithAuth = async (
    url: string,
    options?: RequestInit,
    token?: string | null
) => {
    return fetch(BASE_URL + url, {
        credentials: 'include',
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
            ...options?.headers
        }
    });
};

export const apiFetch = async <T>(
    url: string,
    options?: RequestInit
): Promise<T> => {
    const response = await fetchWithAuth(url, options, accessToken);

    if (response.status === 401) {
        const data = await apiFetch<AuthResponse>(authApi.refresh, {
            method: 'POST'
        });

        setAccessToken(data.accessToken);
        queryClient.setQueryData(authQueryKeys.refresh, data);

        const retried = await fetchWithAuth(url, options, data.accessToken);

        if (!retried.ok) {
            const error = await retried
                .json()
                .catch(() => ({ message: 'Something went wrong!' }));
            throw new Error(error.message);
        }

        return retried.json();
    }

    if (!response.ok) {
        const error = await response
            .json()
            .catch(() => ({ message: 'Something went wrong!' }));
        throw new Error(error.message);
    }

    return response.json();
};
