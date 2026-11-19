import * as React from 'react';
import { Switch as SwitchPrimitive } from 'radix-ui';
import { cn } from '@/lib/utils';

type SwitchWithProps = React.ComponentProps<typeof SwitchPrimitive.Root> & {
    size?: 'sm' | 'default' | 'lg';
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
};

const iconClassName =
    'pointer-events-none absolute z-10 transition-colors top-1/2 flex -translate-y-1/2 [&_svg]:size-3! group-data-[size=lg]/switch:[&_svg]:size-4!';

export default function SwitchWithIcons({
    className,
    size = 'default',
    startIcon,
    endIcon,
    ...props
}: SwitchWithProps) {
    return (
        <SwitchPrimitive.Root
            data-slot="switch"
            data-size={size}
            className={cn(
                'peer group/switch relative inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none group-has-focus-visible/field-label:border-transparent group-has-focus-visible/field-label:ring-0 after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 data-[size=default]:h-[18.4px] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 data-checked:bg-primary data-unchecked:bg-input dark:data-unchecked:bg-input/80 data-disabled:cursor-not-allowed data-disabled:opacity-50 data-[size=lg]:h-7 data-[size=lg]:w-12 cursor-pointer',
                className
            )}
            {...props}
        >
            {startIcon && (
                <span
                    aria-hidden
                    className={cn(
                        iconClassName,
                        'left-0.5 group-data-[size=lg]/switch:left-1 group-data-checked/switch:text-primary-foreground/70! group-data-unchecked/switch:text-primary dark:group-data-unchecked/switch:text-background'
                    )}
                >
                    {startIcon}
                </span>
            )}
            {endIcon && (
                <span
                    aria-hidden
                    className={cn(
                        iconClassName,
                        'right-0.5 group-data-[size=lg]/switch:right-1 group-data-checked/switch:text-primary group-data-unchecked/switch:text-muted-foreground'
                    )}
                >
                    {endIcon}
                </span>
            )}
            <SwitchPrimitive.Thumb
                data-slot="switch-thumb"
                className="pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 group-data-[size=default]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=sm]/switch:data-checked:translate-x-[calc(100%-2px)] dark:data-checked:bg-primary-foreground group-data-[size=default]/switch:data-unchecked:translate-x-0 group-data-[size=sm]/switch:data-unchecked:translate-x-0 dark:data-unchecked:bg-foreground relative group-data-[size=lg]/switch:size-6 group-data-[size=lg]/switch:data-checked:translate-x-[calc(100%-2px)] group-data-[size=lg]/switch:data-unchecked:translate-x-0"
            />
        </SwitchPrimitive.Root>
    );
}
