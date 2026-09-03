import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginValues } from '../../utils/validators';

type Props = {
  onSubmit: (values: LoginValues) => Promise<void>;
  error: string | null;
};

export function LoginForm({ onSubmit, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { isSubmitting },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  return (
    <form
      className="panel auth-card"
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <div>
        <div className="field-label">Email</div>
        <input
          className="field-input"
          placeholder="name@company.com"
          {...register('email')}
        />
      </div>
      <div>
        <div className="field-label">Пароль</div>
        <input
          className="field-input"
          type="password"
          placeholder="••••••••"
          {...register('password')}
        />
      </div>
      {error !== null ? <p className="form-error">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={isSubmitting}>
        Войти
      </button>
    </form>
  );
}
