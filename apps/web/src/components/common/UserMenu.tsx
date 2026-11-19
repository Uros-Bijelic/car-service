import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuLabel
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { UserRoundPen } from 'lucide-react';
import { useLogoutUser } from '@/features/auth/hooks/use-logout-user';
import type { User } from '@/features/user/types';

type Props = {
    user: User;
};

export default function UserMenu({ user }: Props) {
    const { mutate: logoutUser, isPending } = useLogoutUser();

    const fullName =
        [user.firstName, user.lastName]
            .filter((name) => Boolean(name))
            .join(' ') || '';

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="outline"
                    size="icon"
                    aria-label="Open menu"
                    className="cursor-pointer"
                >
                    <UserRoundPen />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {fullName && <DropdownMenuLabel>{fullName}</DropdownMenuLabel>}
                {fullName && <DropdownMenuSeparator />}
                <DropdownMenuGroup>
                    <DropdownMenuItem
                        disabled={isPending}
                        onSelect={() => logoutUser()}
                    >
                        Logout
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
