import { z } from 'zod';

export const EMAIL_HINT = 'Введите email в формате name@company.com';
export const NAME_HINT = 'Введите имя';
export const PASSWORD_HINT = 'Пароль не короче 8 символов';

export const CARD_SWATCHES = [
  '#2e3a4e',
  '#3f6b53',
  '#6b4f3f',
  '#4b3f6b',
  '#2b5fe3',
  '#18181a',
] as const;

export const DEFAULT_CARD_BG = '#2e3a4e';

export const registerSchema = z.object({
  email: z.string().email(EMAIL_HINT),
  password: z.string().min(8, PASSWORD_HINT),
  name: z.string().min(1, NAME_HINT),
});

export const loginSchema = z.object({
  email: z.string().email(EMAIL_HINT),
  password: z.string().min(8, PASSWORD_HINT),
});

export const cardSchema = z.object({
  name: z.string().min(1),
  role: z.string(),
  email: z.string().email(EMAIL_HINT),
  phone: z.string(),
  website: z.string(),
  bio: z.string().max(240),
  skills: z.array(z.string()),
  linkedin: z.string(),
  github: z.string(),
  twitter: z.string(),
  avatarUrl: z.string(),
  backgroundColor: z.string(),
  isPublic: z.boolean(),
});

export type RegisterValues = z.infer<typeof registerSchema>;
export type LoginValues = z.infer<typeof loginSchema>;
export type CardValues = z.infer<typeof cardSchema>;

export function mergeWatchedCardValues(
  defaults: CardValues,
  watched: object,
): CardValues {
  return {
    name: readString(watched, 'name', defaults.name),
    role: readString(watched, 'role', defaults.role),
    email: readString(watched, 'email', defaults.email),
    phone: readString(watched, 'phone', defaults.phone),
    website: readString(watched, 'website', defaults.website),
    bio: readString(watched, 'bio', defaults.bio),
    skills: readStringArray(watched, 'skills', defaults.skills),
    linkedin: readString(watched, 'linkedin', defaults.linkedin),
    github: readString(watched, 'github', defaults.github),
    twitter: readString(watched, 'twitter', defaults.twitter),
    avatarUrl: readString(watched, 'avatarUrl', defaults.avatarUrl),
    backgroundColor: readString(watched, 'backgroundColor', defaults.backgroundColor),
    isPublic: readBoolean(watched, 'isPublic', defaults.isPublic),
  };
}

function readString(source: object, key: string, fallback: string): string {
  if (!(key in source)) {
    return fallback;
  }
  const record: Record<string, string> = {};
  for (const [entryKey, entryValue] of Object.entries(source)) {
    if (typeof entryValue === 'string') {
      record[entryKey] = entryValue;
    }
  }
  const value = record[key];
  return typeof value === 'string' ? value : fallback;
}

function readStringArray(source: object, key: string, fallback: string[]): string[] {
  if (!(key in source)) {
    return fallback;
  }
  for (const [entryKey, entryValue] of Object.entries(source)) {
    if (entryKey === key && Array.isArray(entryValue)) {
      return entryValue.filter((item) => typeof item === 'string');
    }
  }
  return fallback;
}

function readBoolean(source: object, key: string, fallback: boolean): boolean {
  if (!(key in source)) {
    return fallback;
  }
  for (const [entryKey, entryValue] of Object.entries(source)) {
    if (entryKey === key && typeof entryValue === 'boolean') {
      return entryValue;
    }
  }
  return fallback;
}
