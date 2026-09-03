import { gql } from '@apollo/client';
import { USER_FIELDS } from '../types';

export const GET_ME = gql`
  query Me {
    me {
      ${USER_FIELDS}
    }
  }
`;
