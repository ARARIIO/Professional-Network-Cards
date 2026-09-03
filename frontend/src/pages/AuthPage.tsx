import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { LoginForm } from '../components/auth/LoginForm';
import { RegisterForm } from '../components/auth/RegisterForm';
import { useAuth } from '../hooks/useAuth';
import { graphqlErrorMessage } from '../utils/graphql-error';
import type { LoginValues, RegisterValues } from '../utils/validators';

export function AuthPage() {
  const { user, login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [error, setError] = useState<string | null>(null);

  if (user !== null) {
    return <Navigate to="/dashboard" replace />;
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
              : 'Визитка, ссылка и QR — в одном месте'}
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
