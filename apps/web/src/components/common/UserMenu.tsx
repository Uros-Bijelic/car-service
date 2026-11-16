import {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuSeparator
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import { Menu } from 'lucide-react';
import { useLogoutUser } from '@/features/auth/hooks/use-logout-user';

type Props = {};

export default function UserMenu({}: Props) {
    const { mutate: logoutUser, isPending } = useLogoutUser();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon" aria-label="Open menu">
                    <Menu />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuGroup>
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                </DropdownMenuGroup>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                    {/* <DropdownMenuItem
                                role="menuitemcheckbox"
                                aria-checked={isDark}
                                onSelect={(event) => {
                                    event.preventDefault(); // keep the menu open
                                    setTheme(isDark ? 'light' : 'dark');
                                }}
                            >
                                <Switch
                                    size="lg"
                                    checked={isDark}
                                    tabIndex={-1}
                                    aria-hidden
                                    className="pointer-events-none"
                                    startIcon={<Sun />}
                                    endIcon={<Moon />}
                                />
                            </DropdownMenuItem> */}
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
