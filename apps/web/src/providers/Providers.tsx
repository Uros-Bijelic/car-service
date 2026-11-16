import { QueryClientProvider } from '@tanstack/react-query';
import { RouterProvider } from 'react-router/dom';
import { queryClient } from '@/lib/query-client';
import { Toaster } from '@/components/ui/sonner';
import AuthProvider from '@/features/auth/providers/AuthProvider';
import { ThemeProvider } from 'next-themes';
import { router } from '@/router/Router';

export default function AppProviders() {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            storageKey="car-service-theme"
        >
            <QueryClientProvider client={queryClient}>
                <AuthProvider>
                    <RouterProvider router={router} />
                    <Toaster richColors position="top-right" duration={3000} />
                </AuthProvider>
            </QueryClientProvider>
        </ThemeProvider>
    );
}
