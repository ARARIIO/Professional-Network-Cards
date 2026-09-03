import { nanoid } from 'nanoid';

export function generateSlug(): string {
  return nanoid(12);
}
