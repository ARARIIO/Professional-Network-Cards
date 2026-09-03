import { Injectable } from '@nestjs/common';
import type { Card as CardRecord, ContactInvite as InviteRecord, User as UserRecord } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';

export type InviteWithPeople = InviteRecord & {
  fromUser: UserRecord;
  sourceCard: CardRecord;
};

@Injectable()
export class ContactInviteRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<InviteWithPeople | null> {
    return this.prisma.contactInvite.findUnique({
      where: { id },
      include: { fromUser: true, sourceCard: true },
    });
  }

  findByFromAndCard(fromUserId: string, sourceCardId: string): Promise<InviteWithPeople | null> {
    return this.prisma.contactInvite.findUnique({
      where: {
        fromUserId_sourceCardId: { fromUserId, sourceCardId },
      },
      include: { fromUser: true, sourceCard: true },
    });
  }

  findIncomingPending(toUserId: string): Promise<InviteWithPeople[]> {
    return this.prisma.contactInvite.findMany({
      where: { toUserId, status: 'pending' },
      orderBy: { createdAt: 'desc' },
      include: { fromUser: true, sourceCard: true },
    });
  }

  findOutgoing(fromUserId: string): Promise<InviteWithPeople[]> {
    return this.prisma.contactInvite.findMany({
      where: { fromUserId },
      orderBy: { createdAt: 'desc' },
      include: { fromUser: true, sourceCard: true },
    });
  }

  findByFromAndCards(
    fromUserId: string,
    cardIds: string[],
  ): Promise<Array<{ sourceCardId: string; status: string }>> {
    if (cardIds.length === 0) {
      return Promise.resolve([]);
    }
    return this.prisma.contactInvite.findMany({
      where: { fromUserId, sourceCardId: { in: cardIds } },
      select: { sourceCardId: true, status: true },
    });
  }

  create(data: {
    fromUserId: string;
    toUserId: string;
    sourceCardId: string;
  }): Promise<InviteWithPeople> {
    return this.prisma.contactInvite.create({
      data: {
        fromUserId: data.fromUserId,
        toUserId: data.toUserId,
        sourceCardId: data.sourceCardId,
        status: 'pending',
      },
      include: { fromUser: true, sourceCard: true },
    });
  }

  updateStatus(
    id: string,
    status: string,
    respondedAt: Date | null,
  ): Promise<InviteWithPeople> {
    return this.prisma.contactInvite.update({
      where: { id },
      data: { status, respondedAt },
      include: { fromUser: true, sourceCard: true },
    });
  }
}
