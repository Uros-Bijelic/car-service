import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            staleTime: Infinity, // we will refetch only on invalidate query
            retry: 1, // retry failed requests once
            refetchOnWindowFocus: false // don't refetch when tab is focused
        }
    }
});
