import { Outlet } from 'react-router';
import Header from './Header';
// import Header from '@/components/Header';

export default function AppLayout() {
    return (
        <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1 w-7xl border-4 border-blue-500 m-auto">
                <Outlet />
            </main>
        </div>
    );
}
