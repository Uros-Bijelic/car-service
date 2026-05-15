import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import { router } from '../router/router';
import { queryClient } from '@/lib/query-client';
import AuthProvider from './AuthProvider';

export const AppProviders = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
            </AuthProvider>
        </QueryClientProvider>
    );
};
