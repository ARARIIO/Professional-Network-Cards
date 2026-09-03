import { CombinedGraphQLErrors } from '@apollo/client';

export function graphqlErrorMessage(error: { message: string }): string {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors[0];
    if (typeof first === 'object' && first !== null && typeof first.message === 'string') {
      return first.message;
    }
  }
  return error.message;
}
