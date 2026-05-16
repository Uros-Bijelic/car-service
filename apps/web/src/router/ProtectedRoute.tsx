import { useAuth } from '@/features/auth/hooks/use-auth';
import { Navigate, Outlet } from 'react-router';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function ProtectedRoute() {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return <LoadingSpinner variant="fullscreen" />;
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
