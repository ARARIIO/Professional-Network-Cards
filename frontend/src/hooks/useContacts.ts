import { useMutation, useQuery } from '@apollo/client/react';
import { GET_MY_CONTACTS } from '../graphql/queries/getMyContacts';
import { DELETE_CONTACT, SAVE_CONTACT } from '../graphql/mutations/saveContact';
import type { Contact } from '../graphql/types';
import { useAuth } from './useAuth';

type ContactsData = {
  myContacts: Contact[];
};

export function useContacts() {
  const { user } = useAuth();
  const { data, loading, error, refetch } = useQuery<ContactsData>(GET_MY_CONTACTS, {
    skip: user === null,
    fetchPolicy: 'network-only',
    variables: { limit: 100, offset: 0 },
  });
  const [saveContact] = useMutation(SAVE_CONTACT);
  const [deleteContact] = useMutation(DELETE_CONTACT);

  const contacts =
    data === null || typeof data !== 'object' ? [] : data.myContacts;

  return {
    contacts,
    loading,
    errorMessage: error === null || typeof error !== 'object' ? null : error.message,
    saveContact: async (input: {
      name: string;
      email: string | null;
      phone: string | null;
      website: string | null;
      bio: string | null;
      skills: string[];
    }) => {
      await saveContact({ variables: { input } });
      await refetch();
    },
    deleteContact: async (id: string) => {
      await deleteContact({ variables: { id } });
      await refetch();
    },
    refetch,
  };
}
