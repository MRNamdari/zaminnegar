'use client';
import LoginForm from '@/app/_components/auth/login/LoginForm';
import LoginBg from '../../../../public/login-back.png';
export default function LoginPage() {
  return (
      <div
        className="min-h-screen w-full bg-cover bg-bottom bg-no-repeat flex items-center"
        style={{ backgroundImage: `url(${LoginBg.src})` }}
      >
        <div className="form_wrapper flex items-center justify-center min-w-full">
          <LoginForm />
        </div>
      </div>
  );
}
