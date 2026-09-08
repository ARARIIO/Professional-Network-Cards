import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  EMAIL_HINT,
  NAME_HINT,
  PASSWORD_HINT,
  registerSchema,
  type RegisterValues,
} from '../../utils/validators';

type Props = {
  onSubmit: (values: RegisterValues) => Promise<void>;
  error: string | null;
};

export function RegisterForm({ onSubmit, error }: Props) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    mode: 'onTouched',
  });

  const nameInvalid = typeof errors.name?.message === 'string';
  const emailInvalid = typeof errors.email?.message === 'string';
  const passwordInvalid = typeof errors.password?.message === 'string';

  return (
    <form
      className="panel auth-card"
      noValidate
      onSubmit={handleSubmit((values) => onSubmit(values))}
    >
      <div>
        <div className="field-label">Имя</div>
        <input
          className={nameInvalid ? 'field-input is-error' : 'field-input'}
          placeholder="Илья Александров"
          autoComplete="name"
          {...register('name')}
        />
        {nameInvalid ? <div className="field-error">{NAME_HINT}</div> : null}
      </div>
      <div>
        <div className="field-label">Email</div>
        <input
          className={emailInvalid ? 'field-input is-error' : 'field-input'}
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
          className={passwordInvalid ? 'field-input is-error' : 'field-input'}
          type="password"
          placeholder="••••••••"
          autoComplete="new-password"
          {...register('password')}
        />
        {passwordInvalid ? (
          <div className="field-error">{PASSWORD_HINT}</div>
        ) : (
          <div className="field-hint">{PASSWORD_HINT}</div>
        )}
      </div>
      {error !== null ? <p className="form-error">{error}</p> : null}
      <button className="auth-submit" type="submit" disabled={isSubmitting}>
        Зарегистрироваться
      </button>
    </form>
  );
}
