import RHFInput from '@/components/RHFComponents/RHFInput';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { loginSchema, type LoginSchema } from '@/features/auth/auth-schemas';
import { useLoginUser } from '@/features/auth/hooks/use-login-user';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Login() {
    const methods = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const { mutate: loginUser, isPending } = useLoginUser();

    const onSubmit: SubmitHandler<LoginSchema> = (data) => {
        loginUser(data);
    };

    return (
        <section className="h-dvh flex-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/85 p-6 shadow-xl shadow-black/10 backdrop-blur-md dark:border-border dark:bg-card/75 dark:shadow-black/35 sm:p-8">
                <h2 className="type-h3 mb-2 text-center">Login</h2>
                <p className="type-small mb-6 text-center text-muted-foreground">
                    Welcome back. Sign in to continue.
                </p>
                <FormProvider {...methods}>
                    <form
                        onSubmit={methods.handleSubmit(onSubmit)}
                        className="w-full space-y-4"
                    >
                        <RHFInput
                            label="Email"
                            name="email"
                            placeholder="E-mail"
                            type="email"
                        />
                        <RHFInput
                            label="Password"
                            name="password"
                            placeholder="Password"
                            type="password"
                        />
                        <Link
                            to="/register"
                            className="type-link block w-full text-center text-muted-foreground hover:text-foreground"
                        >
                            Don't have an account? Register now.
                        </Link>
                        <div className="flex-center pt-1">
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isPending}
                            >
                                {isPending && (
                                    <LoadingSpinner
                                        variant="button"
                                        className="mr-2"
                                    />
                                )}
                                Login
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </section>
    );
}
