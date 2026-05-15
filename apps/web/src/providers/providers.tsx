import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import { router } from '../router/router';
import { queryClient } from '@/lib/query-client';
import AuthProvider from './AuthProvider';
import { Toaster } from '@/components/ui/sonner';

export const AppProviders = () => {
    return (
        <QueryClientProvider client={queryClient}>
            <AuthProvider>
                <RouterProvider router={router} />
                <Toaster richColors position="top-right" />
            </AuthProvider>
        </QueryClientProvider>
    );
};
