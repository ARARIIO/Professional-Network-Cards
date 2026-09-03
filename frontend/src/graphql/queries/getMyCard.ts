import { gql } from '@apollo/client';
import { CARD_FIELDS } from '../types';

export const GET_MY_CARD = gql`
  query MyCard {
    myCard {
      ${CARD_FIELDS}
    }
  }
`;
