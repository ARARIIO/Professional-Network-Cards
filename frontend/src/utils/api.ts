import { ApolloClient, HttpLink, InMemoryCache } from '@apollo/client';
import { GRAPHQL_URL } from '../constants';

export const apolloClient = new ApolloClient({
  link: new HttpLink({
    uri: GRAPHQL_URL,
    credentials: 'include',
  }),
  cache: new InMemoryCache(),
});
