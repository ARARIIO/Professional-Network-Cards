import { useCallback, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { GET_ME } from '../graphql/queries/getMe';
import { LOGIN, LOGOUT, REGISTER } from '../graphql/mutations/register';
import type { AuthPayload, User } from '../graphql/types';
import { apolloClient } from '../utils/api';
import { refreshSession } from '../utils/session';
import { AuthContext, type AuthProviderProps } from './auth-context';

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

export function AuthProvider({ children }: AuthProviderProps) {
  const [bootstrapped, setBootstrapped] = useState(false);
  const { data, loading, refetch } = useQuery<MeData>(GET_ME, {
    skip: bootstrapped === false,
    fetchPolicy: 'network-only',
  });
  const [registerMutation] = useMutation<RegisterData>(REGISTER);
  const [loginMutation] = useMutation<LoginData>(LOGIN);
  const [logoutMutation] = useMutation<LogoutData>(LOGOUT);

  useEffect(() => {
    void (async () => {
      await refreshSession();
      setBootstrapped(true);
    })();
  }, []);

  const user = data === null || typeof data !== 'object' ? null : data.me;

  const register = useCallback(
    async (input: { email: string; password: string; name: string }) => {
      await registerMutation({ variables: { input } });
      await apolloClient.resetStore();
    },
    [registerMutation],
  );

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      await loginMutation({ variables: { input } });
      await apolloClient.resetStore();
    },
    [loginMutation],
  );

  const logout = useCallback(async () => {
    try {
      await logoutMutation();
    } catch {
      void 0;
    }
    await apolloClient.clearStore();
    await refetch();
  }, [logoutMutation, refetch]);

  const value = useMemo(
    () => ({
      user,
      loading: bootstrapped === false || loading,
      register,
      login,
      logout,
    }),
    [user, bootstrapped, loading, register, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
