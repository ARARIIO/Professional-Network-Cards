import { useMutation, useQuery } from '@apollo/client/react';
import { GET_MY_CARD } from '../graphql/queries/getMyCard';
import { CREATE_CARD, DELETE_CARD, UPDATE_CARD } from '../graphql/mutations/createCard';
import type { Card } from '../graphql/types';

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
  const { data, loading, error, refetch } = useQuery<MyCardData>(GET_MY_CARD);
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
      await createCard({ variables: { input } });
      await refetch();
    },
    updateCard: async (input: UpdateInput) => {
      await updateCard({ variables: { input } });
      await refetch();
    },
    deleteCard: async () => {
      await deleteCard();
      await refetch();
    },
    saving: createState.loading || updateState.loading || deleteState.loading,
  };
}
