import RHFInput from '@/components/RHFComponents/RHFInput';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { loginSchema, type LoginSchema } from '@/features/auth/auth-schemas';
import { useLoginUser } from '@/features/auth/hooks/use-login-user';

export default function Login() {
    const methods = useForm<LoginSchema>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            email: '',
            password: ''
        }
    });
    const { mutate: loginUser } = useLoginUser();

    const onSubmit: SubmitHandler<LoginSchema> = (data) => {
        return loginUser(data);
    };

    return (
        <section className=" h-dvh flex-center">
            <div className="border border-blue-600 sm:w-sm max-w-2xl">
                <h2 className="type-h3 text-center mb-4">Login</h2>
                <FormProvider {...methods}>
                    <form
                        onSubmit={methods.handleSubmit(onSubmit)}
                        className="space-y-3 p-4 w-full"
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
                            to="/login"
                            className="type-link text-center w-full block"
                        >
                            Don't have an account? Register now.
                        </Link>
                        <div className="flex-center">
                            <Button type="submit">Login</Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </section>
    );
}
