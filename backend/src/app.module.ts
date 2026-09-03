import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { AnalyticsModule } from './analytics/analytics.module.js';
import { AuthModule } from './auth/auth.module.js';
import { CardsModule } from './cards/cards.module.js';
import { graphqlConfig } from './config/graphql.config.js';
import { ContactsModule } from './contacts/contacts.module.js';
import { PrismaModule } from './database/prisma.module.js';
import { UsersModule } from './users/users.module.js';
import { StorageModule } from './storage/storage.module.js';
import { AppController } from './app.controller.js';
import { AppService } from './app.service.js';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      ...graphqlConfig(),
      driver: ApolloDriver,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CardsModule,
    ContactsModule,
    AnalyticsModule,
    StorageModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
