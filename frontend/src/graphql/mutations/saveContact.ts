import { gql } from '@apollo/client';

export const SAVE_CONTACT = gql`
  mutation SaveContact($input: SaveContactInput!) {
    saveContact(input: $input) {
      id
      name
      email
      phone
      website
      bio
      skills
      createdAt
    }
  }
`;

export const DELETE_CONTACT = gql`
  mutation DeleteContact($id: String!) {
    deleteContact(id: $id)
  }
`;
