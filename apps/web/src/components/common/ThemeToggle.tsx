import { Moon, Sun } from 'lucide-react';
import SwitchWithIcons from './SwitchWithIcons';
import { useTheme } from 'next-themes';

export default function ThemeToggle() {
    const { setTheme, resolvedTheme } = useTheme();

    return (
        <SwitchWithIcons
            startIcon={<Sun />}
            endIcon={<Moon />}
            size="lg"
            checked={resolvedTheme === 'dark'}
            onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            aria-label="Dark mode"
        />
    );
}
