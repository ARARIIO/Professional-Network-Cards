import { Injectable } from '@nestjs/common';
import type { User as UserRecord } from '../../generated/prisma/client.js';
import { PrismaService } from '../../database/prisma.service.js';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  findById(id: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserRecord> {
    return this.prisma.user.create({ data });
  }
}
