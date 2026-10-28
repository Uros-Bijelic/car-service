import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { createBrowserRouter } from 'react-router';
import PublicRoute from './PublicRoute';
import ProtectedRoute from './ProtectedRoute';
import AppLayout from '@/layout/AppLayout';

export const router = createBrowserRouter([
    {
        element: <ProtectedRoute />,
        children: [
            {
                element: <AppLayout />,
                children: [
                    {
                        path: '/',
                        element: <Home />
                    }
                ]
            }
        ]
    },
    {
        element: <PublicRoute />,
        children: [
            {
                path: '/login',
                element: <Login />
            },
            {
                path: '/register',
                element: <Register />
            }
        ]
    }
]);
