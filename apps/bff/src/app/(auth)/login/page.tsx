'use client';
import { QueryProviders } from '@/app/_lib/QueryProviders';
import LoginBg from '../../../../public/login-bg.png';
import LoginForm from '@/app/components/auth/login/LoginForm';
export default function LoginPage() {
  return (
    <QueryProviders>
      <div
        className="min-h-screen w-full bg-cover bg-bottom bg-no-repeat flex items-center"
        style={{ backgroundImage: `url(${LoginBg.src})` }}
      >
        <div className="form_wrapper flex min-w-full">
          <LoginForm />
        </div>
      </div>
    </QueryProviders>
  );
}
