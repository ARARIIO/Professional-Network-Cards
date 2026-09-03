import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import { env } from '../common/env.js';
import { emitLog, emptyLogFields } from '../common/logging/emit-log.js';

type PrismaLogSink = {
  $on: (
    eventType: 'warn' | 'error',
    callback: (event: { message: string }) => void,
  ) => void;
};

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    const adapter = new PrismaPg({ connectionString: env('DATABASE_URL') });
    super({
      adapter,
      log: [
        { emit: 'event', level: 'warn' },
        { emit: 'event', level: 'error' },
      ],
    });
    const sink = this as PrismaLogSink;
    sink.$on('warn', (event) => {
      emitLog({
        level: 'warn',
        context: 'Prisma',
        msg: event.message,
        ...emptyLogFields(),
      });
    });
    sink.$on('error', (event) => {
      emitLog({
        level: 'error',
        context: 'Prisma',
        msg: event.message,
        ...emptyLogFields(),
      });
    });
  }

  async onModuleInit(): Promise<void> {
    await this.$connect();
  }

  async onModuleDestroy(): Promise<void> {
    await this.$disconnect();
  }
}
