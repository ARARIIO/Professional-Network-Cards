import { useQuery } from '@apollo/client/react';
import { GET_CARD_ANALYTICS } from '../graphql/queries/getCardAnalytics';
import type { CardAnalytics } from '../graphql/types';

type AnalyticsData = {
  cardAnalytics: CardAnalytics;
};

export function useAnalytics(skip = false) {
  const { data, loading, error } = useQuery<AnalyticsData>(GET_CARD_ANALYTICS, {
    skip,
    fetchPolicy: 'network-only',
  });

  const analytics =
    data === null || typeof data !== 'object' ? null : data.cardAnalytics;

  return {
    analytics,
    loading,
    errorMessage: error === null || typeof error !== 'object' ? null : error.message,
  };
}
