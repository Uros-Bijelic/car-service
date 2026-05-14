import RHFInput from '@/components/RHFComponents/RHFInput';
import { FormProvider, useForm } from 'react-hook-form';

type Props = {};

export default function Register({}: Props) {
    const methods = useForm();

    return (
        <section className=" h-dvh flex-center">
            <div className="border border-blue-600 sm:w-sm max-w-2xl">
                <h2 className="text-center mb-4">Register</h2>
                <FormProvider {...methods}>
                    <form action="" className="space-y-3 p-4 w-full">
                        <RHFInput
                            label="Username"
                            name="username"
                            placeholder="Username"
                        />
                        <RHFInput
                            label="Email"
                            name="email"
                            placeholder="E-mail"
                        />
                        <RHFInput
                            label="Password"
                            name="password"
                            placeholder="Password"
                        />
                    </form>
                </FormProvider>
            </div>
        </section>
    );
}
