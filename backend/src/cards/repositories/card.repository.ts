import { Injectable } from '@nestjs/common';
import type { Card as CardRecord, Prisma } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  findByUserId(userId: string): Promise<CardRecord | null> {
    return this.prisma.card.findUnique({ where: { userId } });
  }

  findById(id: string): Promise<CardRecord | null> {
    return this.prisma.card.findUnique({ where: { id } });
  }

  findBySlug(slug: string): Promise<CardRecord | null> {
    return this.prisma.card.findUnique({ where: { slug } });
  }

  findPublicExceptUser(
    excludeUserId: string,
    query: string | null,
    take: number,
  ): Promise<CardRecord[]> {
    const term = query === null ? null : query.trim();
    const textFilter =
      term === null || term.length === 0
        ? {}
        : {
            OR: [
              { name: { contains: term, mode: 'insensitive' as const } },
              { email: { contains: term, mode: 'insensitive' as const } },
              { slug: { contains: term, mode: 'insensitive' as const } },
            ],
          };
    return this.prisma.card.findMany({
      where: {
        isPublic: true,
        userId: { not: excludeUserId },
        ...textFilter,
      },
      orderBy: { updatedAt: 'desc' },
      take,
    });
  }

  create(data: Prisma.CardUncheckedCreateInput): Promise<CardRecord> {
    return this.prisma.card.create({ data });
  }

  update(id: string, data: Prisma.CardUpdateInput): Promise<CardRecord> {
    return this.prisma.card.update({ where: { id }, data });
  }

  deleteByUserId(userId: string): Promise<CardRecord> {
    return this.prisma.card.delete({ where: { userId } });
  }
}
