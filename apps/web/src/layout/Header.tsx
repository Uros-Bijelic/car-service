import { Link } from 'react-router';
import UserMenu from '@/components/common/UserMenu';
import { useAuth } from '@/features/auth/hooks/use-auth';
import ThemeToggle from '@/components/common/ThemeToggle';

export default function Header() {
    const { user } = useAuth();

    return (
        <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
            <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4">
                <Link to="/" className="font-heading font-bold">
                    Car Service
                </Link>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    {user && <UserMenu user={user} />}
                </div>
            </div>
        </header>
    );
}
