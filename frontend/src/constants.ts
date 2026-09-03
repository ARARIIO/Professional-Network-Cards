const graphqlFromEnv = import.meta.env.VITE_GRAPHQL_URL;
export const GRAPHQL_URL =
  typeof graphqlFromEnv === 'string' && graphqlFromEnv.length > 0
    ? graphqlFromEnv
    : 'http://localhost:3000/graphql';

const apiFromEnv = import.meta.env.VITE_API_URL;
export const API_URL =
  typeof apiFromEnv === 'string' && apiFromEnv.length > 0
    ? apiFromEnv
    : 'http://localhost:3000';
