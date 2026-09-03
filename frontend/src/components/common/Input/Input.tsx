import type { InputHTMLAttributes } from 'react';

type Props = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error: string | null;
};

export function Input({ label, error, id, ...props }: Props) {
  const inputId = typeof id === 'string' ? id : label;
  return (
    <label htmlFor={inputId}>
      <span>{label}</span>
      <input id={inputId} {...props} />
      {error !== null ? <small>{error}</small> : null}
    </label>
  );
}
