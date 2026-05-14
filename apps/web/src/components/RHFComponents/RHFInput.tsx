import { Controller, useFormContext } from 'react-hook-form';
import { Field, FieldError, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';

type Props = {
    label: React.ReactNode;
    name: string;
} & React.ComponentProps<'input'>;

export default function RHFInput({ label, name, ...rest }: Props) {
    const { control } = useFormContext();

    return (
        <Controller
            name={name}
            control={control}
            render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>{label}</FieldLabel>
                    <Input
                        {...field}
                        aria-invalid={fieldState.invalid}
                        autoComplete="off"
                        {...rest}
                    />
                    {fieldState.invalid && (
                        <FieldError errors={[fieldState.error]} />
                    )}
                </Field>
            )}
        />
    );
}
