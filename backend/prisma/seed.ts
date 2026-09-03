import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client.js';

const url = process.env.DATABASE_URL;
if (typeof url !== 'string' || url.length === 0) {
  throw new Error('DATABASE_URL is required for seed');
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

const DEMO_PASSWORD = 'Demo12345!';

const USER_AGENTS = [
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 14_5) AppleWebKit/537.36 Chrome/128.0.0.0 Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_6 like Mac OS X) AppleWebKit/605.1.15 Version/17.6 Mobile/15E148 Safari/604.1',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/127.0.0.0 Safari/537.36',
  'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0.0.0 Mobile Safari/537.36',
] as const;

const IPS = ['185.61.12.40', '91.210.8.17', '77.88.55.80', '2a02:6b8::2', '10.8.0.14'] as const;

type CardSeed = {
  slug: string;
  name: string;
  role: string | null;
  email: string;
  phone: string | null;
  website: string | null;
  bio: string | null;
  skills: string[];
  linkedin: string | null;
  github: string | null;
  twitter: string | null;
  backgroundColor: string;
  isPublic: boolean;
};

type PersonSeed = {
  email: string;
  name: string;
  card: CardSeed;
};

const PEOPLE: PersonSeed[] = [
  {
    email: 'demo@pnc.local',
    name: 'Артём Волков',
    card: {
      slug: 'demo-user',
      name: 'Артём Волков',
      role: 'Product Engineer · PNC',
      email: 'demo@pnc.local',
      phone: '+7 700 000 0000',
      website: 'https://example.com',
      bio: 'Собираю цифровые визитки: Nest, React и аккуратная аналитика просмотров.',
      skills: ['TypeScript', 'NestJS', 'React', 'Prisma'],
      linkedin: 'https://linkedin.com/in/artem-volkov',
      github: 'https://github.com/artem-volkov',
      twitter: null,
      backgroundColor: '#2e3a4e',
      isPublic: true,
    },
  },
  {
    email: 'alex@pnc.local',
    name: 'Алекс Иванова',
    card: {
      slug: 'alex-ivanova',
      name: 'Алекс Иванова',
      role: 'Product Designer · Studio',
      email: 'alex@pnc.local',
      phone: '+7 701 111 2233',
      website: 'https://alexivanova.design',
      bio: 'Дизайн-системы и интерфейсы B2B. Превращаю хаос в понятные экраны.',
      skills: ['Figma', 'Design systems', 'Research'],
      linkedin: 'https://linkedin.com/in/alex-ivanova',
      github: null,
      twitter: 'https://x.com/alexivanova',
      backgroundColor: '#3f6b53',
      isPublic: true,
    },
  },
  {
    email: 'maria@pnc.local',
    name: 'Мария Петрова',
    card: {
      slug: 'maria-petrova',
      name: 'Мария Петрова',
      role: 'Frontend · Fintech',
      email: 'maria@pnc.local',
      phone: '+7 702 222 3344',
      website: 'https://maria.dev',
      bio: 'Интерфейсы платежей и дашборды. Люблю доступность и быстрый TTI.',
      skills: ['React', 'Vite', 'CSS', 'a11y'],
      linkedin: 'https://linkedin.com/in/maria-petrova',
      github: 'https://github.com/maria-petrova',
      twitter: null,
      backgroundColor: '#4b3f6b',
      isPublic: true,
    },
  },
  {
    email: 'kirill@pnc.local',
    name: 'Кирилл Соколов',
    card: {
      slug: 'kirill-sokolov',
      name: 'Кирилл Соколов',
      role: 'Backend · Platform',
      email: 'kirill@pnc.local',
      phone: '+7 703 333 4455',
      website: null,
      bio: 'API, очереди и база. Cockroach и Prisma в проде без сюрпризов.',
      skills: ['Node.js', 'PostgreSQL', 'GraphQL'],
      linkedin: null,
      github: 'https://github.com/kirill-sokolov',
      twitter: null,
      backgroundColor: '#6b4f3f',
      isPublic: true,
    },
  },
  {
    email: 'nina@pnc.local',
    name: 'Нина Орлова',
    card: {
      slug: 'nina-orlova',
      name: 'Нина Орлова',
      role: 'Product Manager · Marketplace',
      email: 'nina@pnc.local',
      phone: '+7 704 444 5566',
      website: 'https://ninaorlova.pm',
      bio: 'Discovery, метрики и дорожная карта. Связываю инженеров и бизнес.',
      skills: ['Roadmapping', 'Analytics', 'Interviews'],
      linkedin: 'https://linkedin.com/in/nina-orlova',
      github: null,
      twitter: null,
      backgroundColor: '#2b5fe3',
      isPublic: true,
    },
  },
  {
    email: 'oleg@pnc.local',
    name: 'Олег Ким',
    card: {
      slug: 'oleg-kim',
      name: 'Олег Ким',
      role: 'DevOps · Cloud',
      email: 'oleg@pnc.local',
      phone: null,
      website: 'https://olegkim.cloud',
      bio: 'CI, контейнеры и наблюдаемость. Чтобы демо не падало в пятницу.',
      skills: ['Docker', 'Kubernetes', 'S3'],
      linkedin: null,
      github: 'https://github.com/oleg-kim',
      twitter: null,
      backgroundColor: '#18181a',
      isPublic: true,
    },
  },
  {
    email: 'draft@pnc.local',
    name: 'Черновик Картов',
    card: {
      slug: 'draft-user',
      name: 'Черновик Картов',
      role: 'Не опубликовано',
      email: 'draft@pnc.local',
      phone: null,
      website: null,
      bio: 'Приватная визитка: slug есть, в публичной выдаче не показывается.',
      skills: ['Draft'],
      linkedin: null,
      github: null,
      twitter: null,
      backgroundColor: '#2e3a4e',
      isPublic: false,
    },
  },
];

type SeededPerson = {
  email: string;
  userId: string;
  cardId: string;
  card: CardSeed;
};

function byEmail(people: SeededPerson[], email: string): SeededPerson {
  for (const person of people) {
    if (person.email === email) {
      return person;
    }
  }
  throw new Error(`Seed person missing: ${email}`);
}

function startOfUtcDay(daysAgo: number): Date {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() - daysAgo, 10, 15, 0));
}

function viewStamp(daysAgo: number, index: number): Date {
  const base = startOfUtcDay(daysAgo);
  return new Date(base.getTime() + index * 37 * 60 * 1000);
}

async function upsertPerson(password: string, person: PersonSeed): Promise<SeededPerson> {
  const user = await prisma.user.upsert({
    where: { email: person.email },
    update: { name: person.name, password },
    create: {
      email: person.email,
      password,
      name: person.name,
    },
  });

  const cardPayload = {
    name: person.card.name,
    role: person.card.role,
    email: person.card.email,
    phone: person.card.phone,
    website: person.card.website,
    bio: person.card.bio,
    skills: person.card.skills,
    linkedin: person.card.linkedin,
    github: person.card.github,
    twitter: person.card.twitter,
    backgroundColor: person.card.backgroundColor,
    slug: person.card.slug,
    isPublic: person.card.isPublic,
  };

  const card = await prisma.card.upsert({
    where: { userId: user.id },
    update: cardPayload,
    create: {
      userId: user.id,
      ...cardPayload,
    },
  });

  return { email: person.email, userId: user.id, cardId: card.id, card: person.card };
}

function contactFromCard(ownerId: string, source: SeededPerson) {
  return {
    userId: ownerId,
    name: source.card.name,
    email: source.card.email,
    phone: source.card.phone,
    website: source.card.website,
    bio: source.card.bio,
    skills: source.card.skills,
    sourceCardId: source.cardId,
  };
}

function buildViews(
  cardId: string,
  countsByDayAgo: number[],
  viewerIds: Array<string | null>,
): Array<{
  cardId: string;
  userId: string | null;
  ipAddress: string;
  userAgent: string;
  viewedAt: Date;
}> {
  const rows: Array<{
    cardId: string;
    userId: string | null;
    ipAddress: string;
    userAgent: string;
    viewedAt: Date;
  }> = [];

  for (let dayAgo = 0; dayAgo < countsByDayAgo.length; dayAgo += 1) {
    const count = countsByDayAgo[dayAgo];
    if (typeof count !== 'number') {
      continue;
    }
    for (let index = 0; index < count; index += 1) {
      const viewer = viewerIds[(dayAgo + index) % viewerIds.length];
      const viewerId = typeof viewer === 'string' ? viewer : null;
      rows.push({
        cardId,
        userId: viewerId,
        ipAddress: IPS[(dayAgo + index) % IPS.length],
        userAgent: USER_AGENTS[(dayAgo + index) % USER_AGENTS.length],
        viewedAt: viewStamp(dayAgo, index),
      });
    }
  }

  return rows;
}

async function seed(): Promise<void> {
  const password = await hash(DEMO_PASSWORD, 10);

  const people: SeededPerson[] = [];
  for (const person of PEOPLE) {
    people.push(await upsertPerson(password, person));
  }

  const demo = byEmail(people, 'demo@pnc.local');
  const alex = byEmail(people, 'alex@pnc.local');
  const maria = byEmail(people, 'maria@pnc.local');
  const kirill = byEmail(people, 'kirill@pnc.local');
  const nina = byEmail(people, 'nina@pnc.local');
  const oleg = byEmail(people, 'oleg@pnc.local');

  const userIds = people.map((person) => person.userId);
  const cardIds = people.map((person) => person.cardId);

  await prisma.contact.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.cardView.deleteMany({ where: { cardId: { in: cardIds } } });

  await prisma.contact.createMany({
    data: [
      contactFromCard(demo.userId, alex),
      contactFromCard(demo.userId, maria),
      contactFromCard(demo.userId, kirill),
      contactFromCard(demo.userId, nina),
      contactFromCard(demo.userId, oleg),
      {
        userId: demo.userId,
        name: 'Елена Кузнецова',
        email: 'elena.meetup@example.com',
        phone: '+7 705 555 6677',
        website: null,
        bio: 'Знакомство на митапе, карточки в системе нет.',
        skills: ['HR', 'Hiring'],
        sourceCardId: null,
      },
      contactFromCard(alex.userId, demo),
      contactFromCard(alex.userId, maria),
      contactFromCard(maria.userId, demo),
      contactFromCard(kirill.userId, demo),
      contactFromCard(nina.userId, oleg),
    ],
  });

  const anonymous: string | null = null;
  const demoViews = buildViews(demo.cardId, [8, 5, 3, 7, 4, 6, 11], [
    anonymous,
    alex.userId,
    maria.userId,
    anonymous,
    kirill.userId,
    anonymous,
    nina.userId,
  ]);
  const alexViews = buildViews(alex.cardId, [2, 1, 0, 3, 1, 2, 4], [
    anonymous,
    demo.userId,
    maria.userId,
    anonymous,
  ]);
  const mariaViews = buildViews(maria.cardId, [1, 2, 1, 0, 2, 1, 3], [anonymous, demo.userId, alex.userId]);
  const kirillViews = buildViews(kirill.cardId, [0, 1, 1, 2, 0, 1, 2], [anonymous, demo.userId]);
  const ninaViews = buildViews(nina.cardId, [1, 0, 1, 1, 2, 0, 2], [anonymous, oleg.userId]);
  const olegViews = buildViews(oleg.cardId, [0, 0, 1, 0, 1, 1, 2], [anonymous, nina.userId]);

  const allViews = [...demoViews, ...alexViews, ...mariaViews, ...kirillViews, ...ninaViews, ...olegViews];
  await prisma.cardView.createMany({ data: allViews });

  const counts = new Map<string, number>();
  for (const view of allViews) {
    const previous = counts.get(view.cardId);
    counts.set(view.cardId, (typeof previous === 'number' ? previous : 0) + 1);
  }

  for (const person of people) {
    const viewsCount = counts.get(person.cardId);
    await prisma.card.update({
      where: { id: person.cardId },
      data: { viewsCount: typeof viewsCount === 'number' ? viewsCount : 0 },
    });
  }
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
