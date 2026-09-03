import { Injectable } from '@nestjs/common';
import type { Contact as ContactRecord } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class ContactRepository {
  constructor(private readonly prisma: PrismaService) {}

  create(data: {
    userId: string;
    name: string;
    email: string | null;
    phone: string | null;
    website: string | null;
    bio: string | null;
    skills: string[];
    sourceCardId: string | null;
  }): Promise<ContactRecord> {
    return this.prisma.contact.create({ data });
  }

  findByUser(
    userId: string,
    take: number,
    skip: number,
  ): Promise<ContactRecord[]> {
    return this.prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take,
      skip,
    });
  }

  countByUserId(userId: string): Promise<number> {
    return this.prisma.contact.count({ where: { userId } });
  }

  findById(id: string): Promise<ContactRecord | null> {
    return this.prisma.contact.findUnique({ where: { id } });
  }

  delete(id: string): Promise<ContactRecord> {
    return this.prisma.contact.delete({ where: { id } });
  }

  findAllByUser(userId: string): Promise<ContactRecord[]> {
    return this.prisma.contact.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
