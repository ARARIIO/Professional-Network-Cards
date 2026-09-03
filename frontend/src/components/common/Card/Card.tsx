import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Panel({ children }: Props) {
  return <section>{children}</section>;
}
