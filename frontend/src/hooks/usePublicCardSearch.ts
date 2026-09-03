import { useMutation, useQuery } from '@apollo/client/react';
import { SEARCH_PUBLIC_CARDS } from '../graphql/queries/searchPublicCards';
import { SEND_CONTACT_INVITE } from '../graphql/mutations/contact-invite';
import type { PublicCardHit } from '../graphql/types';
import { useAuth } from './useAuth';

type SearchData = {
  searchPublicCards: PublicCardHit[];
};

export function usePublicCardSearch(query: string) {
  const { user } = useAuth();
  const trimmed = query.trim();
  const { data, loading, error, refetch } = useQuery<SearchData>(SEARCH_PUBLIC_CARDS, {
    skip: user === null,
    fetchPolicy: 'network-only',
    variables: {
      query: trimmed.length === 0 ? null : trimmed,
      limit: 20,
    },
  });
  const [sendInvite, sendState] = useMutation(SEND_CONTACT_INVITE);

  const hits =
    data === null ||
    typeof data !== 'object' ||
    Array.isArray(data.searchPublicCards) === false
      ? []
      : data.searchPublicCards;

  return {
    hits,
    loading,
    errorMessage: error === null || typeof error !== 'object' ? null : error.message,
    saving: sendState.loading,
    inviteFromHit: async (hit: PublicCardHit) => {
      await sendInvite({ variables: { sourceSlug: hit.slug } });
      await refetch();
    },
    refetch,
  };
}

export function hitActionLabel(hit: PublicCardHit): string {
  if (hit.alreadySaved || hit.inviteStatus === 'accepted') {
    return 'Сохранено';
  }
  if (hit.inviteStatus === 'pending') {
    return 'Ожидает ответа';
  }
  if (hit.inviteStatus === 'declined') {
    return 'Отправить снова';
  }
  return 'Предложить';
}

export function hitActionDisabled(hit: PublicCardHit): boolean {
  if (hit.alreadySaved || hit.inviteStatus === 'accepted') {
    return true;
  }
  return hit.inviteStatus === 'pending';
}
