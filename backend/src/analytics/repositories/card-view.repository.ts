import { Injectable } from '@nestjs/common';
import type { CardView as CardViewRecord } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';

type ViewDate = {
  viewedAt: Date;
};

@Injectable()
export class CardViewRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    cardId: string;
    userId: string | null;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<CardViewRecord> {
    return this.prisma.$transaction(async (tx) => {
      const row = await tx.cardView.create({ data });
      await tx.card.update({
        where: { id: data.cardId },
        data: { viewsCount: { increment: 1 } },
      });
      return row;
    });
  }

  deleteOlderThan(cutoff: Date): Promise<{ count: number }> {
    return this.prisma.cardView.deleteMany({
      where: { viewedAt: { lt: cutoff } },
    });
  }

  findRecent(cardId: string, take: number): Promise<CardViewRecord[]> {
    return this.prisma.cardView.findMany({
      where: { cardId },
      orderBy: { viewedAt: 'desc' },
      take,
    });
  }

  findSince(cardId: string, since: Date): Promise<ViewDate[]> {
    return this.prisma.cardView.findMany({
      where: { cardId, viewedAt: { gte: since } },
      select: { viewedAt: true },
    });
  }
}
