import { CombinedGraphQLErrors } from '@apollo/client';

export const WRONG_CREDENTIALS = 'Неверный email или пароль';
export const EMAIL_TAKEN = 'Этот email уже зарегистрирован';
export const SERVER_UNAVAILABLE = 'Сервер недоступен, попробуйте ещё раз';

export function graphqlErrorMessage(error: { message: string }): string {
  return translateServerMessage(rawGraphqlMessage(error));
}

function rawGraphqlMessage(error: { message: string }): string {
  if (CombinedGraphQLErrors.is(error)) {
    const first = error.errors[0];
    if (typeof first === 'object' && first !== null && typeof first.message === 'string') {
      return first.message;
    }
  }
  return error.message;
}

export function translateServerMessage(raw: string): string {
  if (
    raw === 'Invalid credentials' ||
    raw === 'Unauthorized' ||
    raw.includes('status code 401')
  ) {
    return WRONG_CREDENTIALS;
  }
  if (raw === 'Email already registered') {
    return EMAIL_TAKEN;
  }
  if (
    raw.includes('Failed to fetch') ||
    raw.includes('status code 502') ||
    raw.includes('status code 503') ||
    raw.includes('status code 504')
  ) {
    return SERVER_UNAVAILABLE;
  }
  return raw;
}
