import { gql } from '@apollo/client';

export const RECORD_CARD_VIEW = gql`
  mutation RecordCardView($cardId: String!) {
    recordCardView(cardId: $cardId)
  }
`;
