import RHFInput from '@/components/RHFComponents/RHFInput';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { useRegisterUser } from '@/features/auth/hooks/use-register-user';
import {
    registerSchema,
    type RegisterSchema
} from '@repo/types/auth';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export default function Register() {
    const methods = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    });
    const { mutate: registerUser, isPending } = useRegisterUser();

    const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
        registerUser(data);
    };

    return (
        <section className="h-dvh flex-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-border/70 bg-card/85 p-6 shadow-xl shadow-black/10 backdrop-blur-md dark:border-border dark:bg-card/75 dark:shadow-black/35 sm:p-8">
                <h2 className="type-h3 mb-2 text-center">Register</h2>
                <p className="type-small mb-6 text-center text-muted-foreground">
                    Create your account to get started.
                </p>
                <FormProvider {...methods}>
                    <form
                        onSubmit={methods.handleSubmit(onSubmit)}
                        className="w-full space-y-4"
                    >
                        <RHFInput
                            label="Username"
                            name="username"
                            placeholder="Username"
                        />
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
                            to="/login"
                            className="type-link block w-full text-center text-muted-foreground hover:text-foreground"
                        >
                            Have an account? Go to Login page.
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
                                Register
                            </Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </section>
    );
}
