import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type ReactNode,
} from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ME } from '../graphql/queries/getMe';
import { LOGIN, LOGOUT, REGISTER } from '../graphql/mutations/register';
import type { AuthPayload, User } from '../graphql/types';

type MeData = {
  me: User | null;
};

type RegisterData = {
  register: AuthPayload;
};

type LoginData = {
  login: AuthPayload;
};

type LogoutData = {
  logout: boolean;
};

type AuthContextValue = {
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

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data, loading, refetch } = useQuery<MeData>(GET_ME);
  const [registerMutation] = useMutation<RegisterData>(REGISTER);
  const [loginMutation] = useMutation<LoginData>(LOGIN);
  const [logoutMutation] = useMutation<LogoutData>(LOGOUT);

  const user = data === null || typeof data !== 'object' ? null : data.me;

  const register = useCallback(
    async (input: { email: string; password: string; name: string }) => {
      await registerMutation({ variables: { input } });
      await refetch();
    },
    [registerMutation, refetch],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      await loginMutation({ variables: { input } });
      await refetch();
    },
    [loginMutation, refetch],
  );

  const logout = useCallback(async () => {
    await logoutMutation();
    await refetch();
  }, [logoutMutation, refetch]);

  const value = useMemo(
    () => ({
      user,
      loading,
      register,
      login,
      logout,
    }),
    [user, loading, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuthContext(): AuthContextValue {
  const value = useContext(AuthContext);
  if (value === null) {
    throw new Error('useAuthContext must be used within AuthProvider');
  }
  return value;
}
