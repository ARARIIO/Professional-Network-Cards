import { gql } from '@apollo/client';

export const SEARCH_PUBLIC_CARDS = gql`
  query SearchPublicCards($query: String, $limit: Int) {
    searchPublicCards(query: $query, limit: $limit) {
      slug
      name
      role
      email
      avatarUrl
      backgroundColor
      alreadySaved
      inviteStatus
    }
  }
`;
