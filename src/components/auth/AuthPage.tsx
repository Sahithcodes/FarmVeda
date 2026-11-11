import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { AuthLayout } from './AuthLayout';
import { LoginForm } from './LoginForm';
import { SignUpForm } from './SignUpForm';
import { ForgotPasswordForm } from './ForgotPasswordForm';

export const AuthPage: React.FC = () => {
  const { authScreen } = useAuth();

  return (
    <AuthLayout>
      {authScreen === 'login' && <LoginForm />}
      {authScreen === 'signup' && <SignUpForm />}
      {authScreen === 'forgot_password' && <ForgotPasswordForm />}
    </AuthLayout>
  );
};

