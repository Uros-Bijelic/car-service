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

const parseError = async (response: Response) => {
    const payload = await response
        .json()
        .catch(() => ({ message: 'Something went wrong!' }));

    throw new Error(
        payload?.message ?? payload?.error ?? 'Something went wrong!'
    );
};

export const apiFetch = async <T>(
    url: string,
    options?: RequestInit
): Promise<T> => {
    const response = await fetchWithAuth(url, options, accessToken);

    if (response.ok) {
        return response.json();
    }

    const isAuthMutation = url === authApi.login || url === authApi.register;

    if (response.status !== 401 || url === authApi.refresh || isAuthMutation) {
        await parseError(response);
    }

    // Refresh ONCE via low-level fetch (no recursion).
    const refreshResponse = await fetchWithAuth(authApi.refresh, {
        method: 'POST'
    });

    if (!refreshResponse.ok) {
        setAccessToken(null);
        queryClient.setQueryData(authQueryKeys.refresh, null);

        // Avoid redirect loop on auth pages
        const path = window.location.pathname;
        const isAuthPage = path === '/login' || path === '/register';
        if (!isAuthPage) {
            window.location.assign('/login');
        }

        await parseError(refreshResponse);
    }

    const refreshData = (await refreshResponse.json()) as AuthResponse;
    setAccessToken(refreshData.accessToken);
    queryClient.setQueryData(authQueryKeys.refresh, refreshData);

    // Retry original request once with new token.
    const retried = await fetchWithAuth(url, options, refreshData.accessToken);

    if (!retried.ok) {
        await parseError(retried);
    }

    return retried.json();
};
