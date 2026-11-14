'use client';
import { LoginFormValue } from '@/app/components/auth/login/schema/AddUser.schema';
import LoginBg from '../../../../public/login-bg.png';
import LoginForm from '@/app/components/auth/login/LoginForm';

export default function LoginPage() {
  const handleLogin = (values: LoginFormValue) => {
    console.log(values);
  };
  return (
    <div
      className="min-h-screen w-full bg-cover bg-bottom bg-no-repeat flex items-center"
      style={{ backgroundImage: `url(${LoginBg.src})` }}
    >
      <div className="form_wrapper flex min-w-full">
        <LoginForm onSubmit={handleLogin} />
      </div>
    </div>
  );
}
