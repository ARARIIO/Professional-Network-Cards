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
