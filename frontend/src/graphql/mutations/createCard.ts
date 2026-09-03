import { gql } from '@apollo/client';
import { CARD_FIELDS } from '../types';

export const CREATE_CARD = gql`
  mutation CreateCard($input: CreateCardInput!) {
    createCard(input: $input) {
      ${CARD_FIELDS}
    }
  }
`;

export const UPDATE_CARD = gql`
  mutation UpdateCard($input: UpdateCardInput!) {
    updateCard(input: $input) {
      ${CARD_FIELDS}
    }
  }
`;

export const DELETE_CARD = gql`
  mutation DeleteCard {
    deleteCard
  }
`;
