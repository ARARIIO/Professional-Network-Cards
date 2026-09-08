import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EMAIL_HINT,
  PASSWORD_HINT,
  loginSchema,
  type LoginValues,
} from '../../utils/validators';

type Props = {
  onSubmit: (values: LoginValues) => Promise<void>;
  error: string | null;
};

export function LoginForm({ onSubmit, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onTouched',
  });

  const emailInvalid = typeof errors.email?.message === 'string';
  const passwordInvalid = typeof errors.password?.message === 'string';
  const credentialsFailed = error !== null;

  return (
    <form
      className="panel auth-card"
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <div>
        <div className="field-label">Email</div>
        <input
          className={emailInvalid || credentialsFailed ? 'field-input is-error' : 'field-input'}
          placeholder="name@company.com"
          type="email"
          autoComplete="email"
          {...register('email')}
        />
        {emailInvalid ? <div className="field-error">{EMAIL_HINT}</div> : null}
      </div>
      <div>
        <div className="field-label">Пароль</div>
        <input
          className={passwordInvalid || credentialsFailed ? 'field-input is-error' : 'field-input'}
          type="password"
          placeholder="••••••••"
          autoComplete="current-password"
          {...register('password')}
        />
        {passwordInvalid ? (
          <div className="field-error">{PASSWORD_HINT}</div>
        ) : (
          <div className="field-hint">{PASSWORD_HINT}</div>
        )}
      </div>
      {error !== null ? (
        <p className="form-error" role="alert">
          {error}
        </p>
      ) : null}
      <button className="auth-submit" type="submit" disabled={isSubmitting}>
        Войти
      </button>
    </form>
  );
}
