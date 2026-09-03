import { createContext, type ReactNode } from 'react';
import type { User } from '../graphql/types';

export type AuthContextValue = {
  user: User | null;
  loading: boolean;
  register: (input: {
    email: string;
    password: string;
    name: string;
  }) => Promise<void>;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
};

export const AuthContext = createContext<AuthContextValue | null>(null);

export type AuthProviderProps = {
  children: ReactNode;
};
