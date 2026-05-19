import { Button } from '@/components/ui/button';
import { useLogoutUser } from '@/features/auth/hooks/use-logout-user';

export default function Home() {
    const { mutate: logoutUser, isPending } = useLogoutUser();

    return (
        <section className="p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-xl font-semibold">Home Page</h1>
                <Button onClick={() => logoutUser()} disabled={isPending}>
                    Logout
                </Button>
            </div>
        </section>
    );
}
