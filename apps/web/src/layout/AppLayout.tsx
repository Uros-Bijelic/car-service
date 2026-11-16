import { Outlet } from 'react-router';
import Header from './Header';

export default function AppLayout() {
    return (
        <div className="min-h-dvh flex flex-col">
            <Header />
            <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col">
                <Outlet />
            </main>
        </div>
    );
}
