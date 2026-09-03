import { z } from 'zod';

export const EMAIL_HINT = 'Введите email в формате name@company.com';

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
  password: z.string().min(8),
  name: z.string().min(1),
});

export const loginSchema = z.object({
  email: z.string().email(EMAIL_HINT),
  password: z.string().min(8),
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
