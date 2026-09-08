const graphqlFromEnv = import.meta.env.VITE_GRAPHQL_URL;
const apiFromEnv = import.meta.env.VITE_API_URL;

export const GRAPHQL_URL = publicGraphqlUrl(
  import.meta.env.PROD,
  typeof graphqlFromEnv === 'string' ? graphqlFromEnv : null,
);

export const API_URL = publicApiUrl(
  import.meta.env.PROD,
  typeof apiFromEnv === 'string' ? apiFromEnv : null,
);

export function publicGraphqlUrl(isProd: boolean, fromEnv: string | null): string {
  if (fromEnv !== null && fromEnv.length > 0) {
    return fromEnv;
  }
  return isProd ? '/graphql' : 'http://localhost:3000/graphql';
}

export function publicApiUrl(isProd: boolean, fromEnv: string | null): string {
  if (fromEnv !== null) {
    return fromEnv.replace(/\/$/, '');
  }
  return isProd ? '' : 'http://localhost:3000';
}
