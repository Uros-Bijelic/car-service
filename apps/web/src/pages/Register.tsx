import RHFInput from '@/components/RHFComponents/RHFInput';
import { FormProvider, useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router';
import { useRegisterUser } from '@/features/auth/hooks/use-register-user';
import {
    registerSchema,
    type RegisterSchema
} from '@/features/auth/auth-schemas';

export default function Register() {
    const methods = useForm<RegisterSchema>({
        resolver: zodResolver(registerSchema),
        defaultValues: {
            username: '',
            email: '',
            password: ''
        }
    });
    const { mutate: registerUser } = useRegisterUser();

    const onSubmit: SubmitHandler<RegisterSchema> = async (data) => {
        return registerUser(data);
    };

    return (
        <section className=" h-dvh flex-center">
            <div className="border border-blue-600 sm:w-sm max-w-2xl">
                <h2 className="type-h3 text-center mb-4">Register</h2>
                <FormProvider {...methods}>
                    <form
                        onSubmit={methods.handleSubmit(onSubmit)}
                        className="space-y-3 p-4 w-full"
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
                            className="type-link text-center w-full block"
                        >
                            Have an account? Go to Login page.
                        </Link>
                        <div className="flex-center">
                            <Button type="submit">Register</Button>
                        </div>
                    </form>
                </FormProvider>
            </div>
        </section>
    );
}
