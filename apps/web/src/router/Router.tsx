import Home from '@/pages/Home';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import { createBrowserRouter } from 'react-router';

export const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />
    },
    {
        path: '/register',
        element: <Register />
    },
    {
        path: '/login',
        element: <Login />
    }
]);
