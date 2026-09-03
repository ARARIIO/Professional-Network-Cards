import { useMutation, useQuery } from '@apollo/client/react';
import { GET_MY_CARD } from '../graphql/queries/getMyCard';
import { GET_ME } from '../graphql/queries/getMe';
import { CREATE_CARD, DELETE_CARD, UPDATE_CARD } from '../graphql/mutations/createCard';
import type { Card } from '../graphql/types';
import { useAuth } from './useAuth';

type MyCardData = {
  myCard: Card | null;
};

type CardInput = {
  name: string;
  role: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  bio: string | null;
  skills: string[];
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  avatarUrl: string | null;
  backgroundColor: string | null;
  isPublic: boolean | null;
};

type UpdateInput = CardInput;

export function useCard() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery<MyCardData>(GET_MY_CARD, {
    skip: user === null,
    fetchPolicy: 'network-only',
  });
  const [createCard, createState] = useMutation<{ createCard: Card }>(CREATE_CARD);
  const [updateCard, updateState] = useMutation<{ updateCard: Card }>(UPDATE_CARD);
  const [deleteCard, deleteState] = useMutation<{ deleteCard: boolean }>(DELETE_CARD);

  const card = data === null || typeof data !== 'object' ? null : data.myCard;

  return {
    card,
    loading,
    errorMessage: error === null || typeof error !== 'object' ? null : error.message,
    refetch,
    createCard: async (input: CardInput) => {
      await createCard({ variables: { input }, refetchQueries: [{ query: GET_ME }] });
      await refetch();
    },
    updateCard: async (input: UpdateInput) => {
      await updateCard({ variables: { input }, refetchQueries: [{ query: GET_ME }] });
      await refetch();
    },
    deleteCard: async () => {
      await deleteCard({ refetchQueries: [{ query: GET_ME }] });
      await refetch();
    },
    saving: createState.loading || updateState.loading || deleteState.loading,
  };
}
