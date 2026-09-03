import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcrypt';
import { PrismaClient } from '../src/generated/prisma/client.js';

const url = process.env.DATABASE_URL;
if (typeof url !== 'string' || url.length === 0) {
  throw new Error('DATABASE_URL is required for seed');
}

const adapter = new PrismaPg({ connectionString: url });
const prisma = new PrismaClient({ adapter });

async function seed(): Promise<void> {
  const password = await hash('Demo12345!', 10);

  const demo = await prisma.user.upsert({
    where: { email: 'demo@pnc.local' },
    update: { name: 'Demo User', password },
    create: {
      email: 'demo@pnc.local',
      password,
      name: 'Demo User',
    },
  });

  await prisma.card.upsert({
    where: { userId: demo.id },
    update: {
      name: 'Demo User',
      role: 'Product Engineer · PNC',
      email: 'demo@pnc.local',
      phone: '+7 700 000 0000',
      website: 'https://example.com',
      bio: 'Product engineer. Digital business cards.',
      skills: ['TypeScript', 'NestJS', 'React'],
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      backgroundColor: '#2e3a4e',
      slug: 'demo-user',
      isPublic: true,
    },
    create: {
      userId: demo.id,
      name: 'Demo User',
      role: 'Product Engineer · PNC',
      email: 'demo@pnc.local',
      phone: '+7 700 000 0000',
      website: 'https://example.com',
      bio: 'Product engineer. Digital business cards.',
      skills: ['TypeScript', 'NestJS', 'React'],
      linkedin: 'https://linkedin.com',
      github: 'https://github.com',
      twitter: null,
      backgroundColor: '#2e3a4e',
      slug: 'demo-user',
      isPublic: true,
    },
  });

  const alex = await prisma.user.upsert({
    where: { email: 'alex@pnc.local' },
    update: { name: 'Alex Ivanova', password },
    create: {
      email: 'alex@pnc.local',
      password,
      name: 'Alex Ivanova',
    },
  });

  await prisma.card.upsert({
    where: { userId: alex.id },
    update: {
      name: 'Alex Ivanova',
      role: 'Designer · Studio',
      email: 'alex@pnc.local',
      bio: 'Designer turning systems into products.',
      skills: ['Figma', 'Design systems'],
      backgroundColor: '#3f6b53',
      slug: 'alex-ivanova',
      isPublic: true,
    },
    create: {
      userId: alex.id,
      name: 'Alex Ivanova',
      role: 'Designer · Studio',
      email: 'alex@pnc.local',
      phone: null,
      website: null,
      bio: 'Designer turning systems into products.',
      skills: ['Figma', 'Design systems'],
      linkedin: null,
      github: null,
      twitter: null,
      backgroundColor: '#3f6b53',
      slug: 'alex-ivanova',
      isPublic: true,
    },
  });

  const existing = await prisma.contact.findFirst({
    where: { userId: demo.id, email: 'alex@pnc.local' },
  });
  if (existing === null) {
    await prisma.contact.create({
      data: {
        userId: demo.id,
        name: 'Alex Ivanova',
        email: 'alex@pnc.local',
        phone: null,
        website: null,
        bio: 'Designer turning systems into products.',
        skills: ['Figma', 'Design systems'],
        sourceCardId: null,
      },
    });
  }
}

try {
  await seed();
} finally {
  await prisma.$disconnect();
}
