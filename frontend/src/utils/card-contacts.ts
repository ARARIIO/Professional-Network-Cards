import { hrefOrNull } from './format';

export type CardContactKind = 'email' | 'phone' | 'website';

export type CardContactRow = {
  kind: CardContactKind;
  label: string;
  value: string;
  action: string;
  href: string;
};

export function cardContactRows(fields: {
  email: string;
  phone: string;
  website: string;
}): CardContactRow[] {
  const rows: CardContactRow[] = [];
  const email = fields.email.trim();
  if (email.length > 0) {
    rows.push({
      kind: 'email',
      label: 'Почта',
      value: email,
      action: 'Написать',
      href: `mailto:${email}`,
    });
  }
  const phone = fields.phone.trim();
  if (phone.length > 0) {
    rows.push({
      kind: 'phone',
      label: 'Телефон',
      value: phone,
      action: 'Позвонить',
      href: `tel:${phone}`,
    });
  }
  const website = fields.website.trim();
  const site = hrefOrNull(website.length === 0 ? null : website);
  if (website.length > 0 && site !== null) {
    rows.push({
      kind: 'website',
      label: 'Сайт',
      value: website,
      action: 'Открыть',
      href: site,
    });
  }
  return rows;
}

export function cardSocials(fields: {
  linkedin: string;
  twitter: string;
  github: string;
}): { label: string; href: string }[] {
  const socials: { label: string; href: string }[] = [];
  const linkedin = hrefOrNull(fields.linkedin.trim().length === 0 ? null : fields.linkedin);
  const twitter = hrefOrNull(fields.twitter.trim().length === 0 ? null : fields.twitter);
  const github = hrefOrNull(fields.github.trim().length === 0 ? null : fields.github);
  if (linkedin !== null) {
    socials.push({ label: 'LinkedIn', href: linkedin });
  }
  if (twitter !== null) {
    socials.push({ label: 'X', href: twitter });
  }
  if (github !== null) {
    socials.push({ label: 'GitHub', href: github });
  }
  return socials;
}
