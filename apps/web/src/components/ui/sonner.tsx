'use client';

import {
    CircleCheckIcon,
    InfoIcon,
    Loader2Icon,
    OctagonXIcon,
    TriangleAlertIcon
} from 'lucide-react';
import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system', resolvedTheme } = useTheme();
    const isDark = resolvedTheme === 'dark';

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            className="toaster group"
            icons={{
                success: <CircleCheckIcon className="size-4" />,
                info: <InfoIcon className="size-4" />,
                warning: <TriangleAlertIcon className="size-4" />,
                error: <OctagonXIcon className="size-4" />,
                loading: <Loader2Icon className="size-4 animate-spin" />
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--success-bg': isDark
                        ? 'oklch(0.28 0.05 160)'
                        : 'oklch(0.96 0.03 160)',
                    '--success-text': isDark
                        ? 'oklch(0.94 0.03 160)'
                        : 'oklch(0.33 0.07 160)',
                    '--info-bg': isDark
                        ? 'oklch(0.28 0.05 235)'
                        : 'oklch(0.96 0.02 235)',
                    '--info-text': isDark
                        ? 'oklch(0.94 0.02 235)'
                        : 'oklch(0.31 0.06 235)',
                    '--warning-bg': isDark
                        ? 'oklch(0.3 0.06 90)'
                        : 'oklch(0.97 0.04 92)',
                    '--warning-text': isDark
                        ? 'oklch(0.95 0.04 90)'
                        : 'oklch(0.38 0.07 92)',
                    '--error-bg': isDark
                        ? 'oklch(0.3 0.08 24)'
                        : 'oklch(0.97 0.03 24)',
                    '--error-text': isDark
                        ? 'oklch(0.94 0.05 24)'
                        : 'oklch(0.4 0.09 24)',
                    '--border-radius': 'var(--radius)'
                } as React.CSSProperties
            }
            toastOptions={{
                classNames: {
                    toast: 'group toast group-[.toaster]:border-border group-[.toaster]:bg-popover group-[.toaster]:text-popover-foreground group-[.toaster]:shadow-lg group-[.toaster]:shadow-black/10 dark:group-[.toaster]:shadow-black/35',
                    description:
                        'group-[.toast]:text-muted-foreground dark:group-[.toast]:text-muted-foreground',
                    actionButton:
                        'group-[.toast]:bg-primary group-[.toast]:text-primary-foreground',
                    cancelButton:
                        'group-[.toast]:bg-muted group-[.toast]:text-muted-foreground'
                }
            }}
            {...props}
        />
    );
};

export { Toaster };
