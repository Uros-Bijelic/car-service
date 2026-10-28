import { createContext } from 'react';

type Theme = 'light' | 'dark' | 'system';

type ThemeContextValue = {
    theme: Theme;
    resolvedTheme: 'light' | 'dark';
    setTheme: (theme: Theme) => void;
};

export const ThemeContext = createContext<ThemeContextValue | null>(null);
