import type { ButtonHTMLAttributes, ReactNode } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
};

export function Button({ children, type = 'button', ...props }: Props) {
  return (
    <button type={type} {...props}>
      {children}
    </button>
  );
}
