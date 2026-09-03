import { gql } from '@apollo/client';
import { PUBLIC_CARD_FIELDS } from '../types';

export const GET_CARD = gql`
  query GetCard($slug: String!) {
    getCard(slug: $slug) {
      ${PUBLIC_CARD_FIELDS}
    }
  }
`;
