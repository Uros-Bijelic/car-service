import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

type LoadingSpinnerVariant = 'fullscreen' | 'inline' | 'button';

type Props = {
    variant?: LoadingSpinnerVariant;
    className?: string;
};

export default function LoadingSpinner({
    variant = 'inline',
    className
}: Props) {
    if (variant === 'button') {
        return (
            <span className={cn('inline-flex items-center', className)}>
                <Spinner size="sm" className="border-current/30 border-t-current" />
                <span className="sr-only">Loading</span>
            </span>
        );
    }

    if (variant === 'fullscreen') {
        return (
            <div
                className={cn(
                    'fixed inset-0 z-50 flex items-center justify-center bg-background/65 backdrop-blur-[2px] dark:bg-background/75',
                    className
                )}
            >
                <Spinner size="lg" />
                <span className="sr-only">Loading</span>
            </div>
        );
    }

    return (
        <div className={cn('flex items-center justify-center', className)}>
            <Spinner size="md" />
            <span className="sr-only">Loading</span>
        </div>
    );
}
