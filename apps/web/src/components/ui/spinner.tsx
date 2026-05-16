import * as React from 'react';

import { cn } from '@/lib/utils';

type SpinnerSize = 'sm' | 'md' | 'lg';

const sizeClasses: Record<SpinnerSize, string> = {
    sm: 'size-4 border-2',
    md: 'size-7 border-[3px]',
    lg: 'size-10 border-4'
};

type SpinnerProps = React.ComponentProps<'span'> & {
    size?: SpinnerSize;
};

function Spinner({ className, size = 'md', ...props }: SpinnerProps) {
    return (
        <span
            role="status"
            aria-label="Loading"
            data-slot="spinner"
            className={cn(
                'inline-block animate-spin rounded-full border-solid border-primary/30 border-t-primary align-[-0.125em]',
                sizeClasses[size],
                className
            )}
            {...props}
        />
    );
}

export { Spinner };
