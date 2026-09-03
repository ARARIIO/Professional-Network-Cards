import { useState } from 'react';
import { Navigate, useSearchParams } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { graphqlErrorMessage } from '../utils/graphql-error';
import { postAuthPath } from '../utils/post-auth-path';
import type { LoginValues, RegisterValues } from '../utils/validators';

export function AuthPage() {
  const { user, loading, login, register } = useAuth();
  const [params] = useSearchParams();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);

  if (loading) {
    return null;
  }

  if (user !== null) {
    return <Navigate to={postAuthPath(params.get('next'))} replace />;
  }

  const onLogin = async (values: LoginValues) => {
    setError(null);
    try {
      await login(values);
    } catch (caught) {
      setError(caught instanceof Error ? graphqlErrorMessage(caught) : 'Не удалось войти');
    }
  };

  const onRegister = async (values: RegisterValues) => {
    setError(null);
    try {
      await register(values);
    } catch (caught) {
      setError(
        caught instanceof Error
          ? graphqlErrorMessage(caught)
          : 'Не удалось зарегистрироваться',
      );
    }
  };

  const isSignup = mode === 'register';

  return (
    <div className="auth-wrap">
      <div className="auth-col">
        <div className="auth-hero">
          <div className="auth-mark" />
          <div className="auth-title">
            {isSignup ? 'Создать аккаунт' : 'Вход в Network Cards'}
          </div>
          <div className="auth-sub">
            {isSignup
              ? 'Визитка будет готова за пару минут'
              : 'Визитка, ссылка и контакты — в одном месте'}
          </div>
        </div>
        {isSignup ? (
          <RegisterForm onSubmit={onRegister} error={error} />
        ) : (
          <LoginForm onSubmit={onLogin} error={error} />
        )}
        <div className="auth-switch">
          {isSignup ? 'Уже есть аккаунт? ' : 'Нет аккаунта? '}
          <button
            type="button"
            className="text-btn"
            onClick={() => {
              setError(null);
              setMode(isSignup ? 'login' : 'register');
            }}
          >
            {isSignup ? 'Войти' : 'Регистрация'}
          </button>
        </div>
      </div>
    </div>
  );
}
