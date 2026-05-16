import { apiFetch } from '@/lib/apiFetch';
import { useQuery } from '@tanstack/react-query';
import { authApi } from '../auth-api';
import type { AuthResponse } from '../auth-schemas';
import { authQueryKeys } from '../query-keys';

export const useRefetchToken = () => {
    return useQuery({
        queryKey: authQueryKeys.refresh,
        queryFn: async () => {
            return apiFetch<AuthResponse>(authApi.refresh, {
                method: 'POST'
            });
        },
        staleTime: 13 * 60 * 1000, // 13 min
        refetchInterval: 13 * 60 * 1000, // proactively refresh every 13 min
        retry: false
    });
};
