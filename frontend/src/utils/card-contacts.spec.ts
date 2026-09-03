import { describe, expect, it } from 'vitest';
import { cardContactRows } from './card-contacts';

describe('cardContactRows', () => {
  it('skips empty phone and website', () => {
    expect(
      cardContactRows({
        email: 'a@b.c',
        phone: '  ',
        website: '',
      }),
    ).toEqual([
      {
        kind: 'email',
        label: 'Почта',
        value: 'a@b.c',
        action: 'Написать',
        href: 'mailto:a@b.c',
      },
    ]);
  });
});
