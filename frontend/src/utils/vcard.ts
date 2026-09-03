import type { PublicCard } from '../graphql/types';

export function buildVCard(card: PublicCard, pageUrl: string): string {
  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeVCard(card.name)}`,
    `N:${escapeVCard(card.name)};;;`,
  ];
  if (card.role !== null && card.role.length > 0) {
    lines.push(`TITLE:${escapeVCard(card.role)}`);
  }
  lines.push(`EMAIL;TYPE=INTERNET:${escapeVCard(card.email)}`);
  if (card.phone !== null && card.phone.length > 0) {
    lines.push(`TEL;TYPE=CELL:${escapeVCard(card.phone)}`);
  }
  if (card.website !== null && card.website.length > 0) {
    lines.push(`URL:${escapeVCard(card.website)}`);
  }
  lines.push(`URL:${escapeVCard(pageUrl)}`);
  if (card.bio !== null && card.bio.length > 0) {
    lines.push(`NOTE:${escapeVCard(card.bio)}`);
  }
  lines.push('END:VCARD');
  return `${lines.join('\r\n')}\r\n`;
}

function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}
