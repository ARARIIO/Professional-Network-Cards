import { gql } from '@apollo/client';
import { USER_FIELDS } from '../types';

export const REGISTER = gql`
  mutation Register($input: RegisterInput!) {
    register(input: $input) {
      token
      user {
        ${USER_FIELDS}
      }
    }
  }
`;

export const LOGIN = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
      token
      user {
        ${USER_FIELDS}
      }
    }
  }
`;

export const LOGOUT = gql`
  mutation Logout {
    logout
  }
`;
