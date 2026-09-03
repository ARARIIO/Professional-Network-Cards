import { Global, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtGuard } from '../common/guards/jwt.guard.js';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard.js';
import { env } from '../common/env.js';
import { UsersModule } from '../users/users.module.js';
import { AuthController } from './auth.controller.js';
import { AuthResolver } from './auth.resolver.js';
import { AuthService } from './auth.service.js';
import { JwtStrategy } from './strategies/jwt.strategy.js';

@Global()
@Module({
  imports: [
    UsersModule,
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: () => ({
        secret: env('JWT_SECRET'),
        signOptions: { expiresIn: '24h' },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthResolver,
    JwtStrategy,
    OptionalJwtGuard,
    {
      provide: APP_GUARD,
      useClass: JwtGuard,
    },
  ],
  exports: [AuthService, JwtModule, OptionalJwtGuard],
})
export class AuthModule {}
