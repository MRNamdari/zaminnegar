'use client';
import { useAppForm } from '@/app/_components/form/hooks/form';
import { fa } from 'zod/locales';
import z from 'zod';

z.config(fa());

import { LoginDto } from '@zaminnegar/api-client';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { QueryProviders } from '@/app/_lib/QueryProviders';
import { useLoginMutation } from '@/app/features/auth/mutation';
export default function LoginPage() {
  return (
    <QueryProviders>
      <LoginForm />
    </QueryProviders>
  );
}

function LoginForm() {
  const router = useRouter();
  const loginMutation = useLoginMutation();
  const form = useAppForm({
    defaultValues: {
      username: '',
      password: '',
    },
    validators: {
      onBlur: LoginDto,
    },
    onSubmit: async ({ value }) => {
      const result = await loginMutation.mutateAsync(value);

      if (!result.success) {
        toast.error(result.message);
        return;
      }

      // The session cookie is already stored; navigate so server components see it.
      router.replace('/map');
      router.refresh();
    },
  });
  return (
    <form
      className="max-w-5xl mx-auto flex flex-col gap-4"
      onSubmit={(e) => {
        e.stopPropagation();
        e.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.AppForm>
        <form.AppField name="username">
          {({ TextField }) => <TextField label="نام کاربری" type="text" />}
        </form.AppField>
        <form.AppField name="password">
          {({ TextField }) => <TextField label="گذرواژه" type="password" />}
        </form.AppField>

        <form.Subscribe
          selector={(state) => ({
            canSubmit: state.canSubmit,
            isSubmitting: state.isSubmitting,
            isSubmitted: state.isSubmitted,
            errors: state.errors,
            values: state.values,
          })}
        >
          {(state) => (
            <>
              <form.SubmitButton
                label="ورود"
                disabled={!state.canSubmit || state.isSubmitting}
              />
              <pre className="text-xs whitespace-pre-wrap">
                {JSON.stringify(state, null, 2)}
              </pre>
            </>
          )}
        </form.Subscribe>
      </form.AppForm>
    </form>
  );
}
