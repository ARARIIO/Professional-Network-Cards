import { gql } from '@apollo/client';

export const GET_MY_CONTACTS = gql`
  query MyContacts($limit: Int, $offset: Int) {
    myContacts(limit: $limit, offset: $offset) {
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
