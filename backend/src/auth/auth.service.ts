import { HttpStatus, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Request, Response } from 'express';
import type { User as UserRecord } from '../generated/prisma/client.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { env } from '../common/env.js';
import {
  ACCESS_COOKIE,
  ACCESS_MAX_AGE_MS,
  authCookieOptions,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_MS,
} from '../common/http/cookies.js';
import { readRefreshToken } from '../common/http/tokens.js';
import type {
  JwtAccessPayload,
  JwtRefreshPayload,
} from '../common/types/jwt-payload.js';
import { normalizeEmail } from '../common/email.js';
import { UsersService } from '../users/users.service.js';
import { AuthPayload } from './dto/auth.payload.js';
import { LoginInput } from './dto/login.input.js';
import { RegisterInput } from './dto/register.input.js';

const BCRYPT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(input: RegisterInput, res: Response): Promise<AuthPayload> {
    const email = accountEmail(input.email);
    const existing = await this.usersService.findByEmail(email);
    if (existing !== null) {
      throw new BusinessException('Email already registered', HttpStatus.CONFLICT);
    }
    const password = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
    const user = await this.usersService.create({
      email,
      password,
      name: input.name,
    });
    return this.issue(user, res);
  }

  async login(input: LoginInput, res: Response): Promise<AuthPayload> {
    const email = accountEmail(input.email);
    const user = await this.usersService.findByEmail(email);
    if (user === null) {
      throw new BusinessException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    const matches = await bcrypt.compare(input.password, user.password);
    if (matches === false) {
      throw new BusinessException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    return this.issue(user, res);
  }

  logout(res: Response): boolean {
    res.clearCookie(ACCESS_COOKIE, authCookieOptions(0));
    res.clearCookie(REFRESH_COOKIE, authCookieOptions(0));
    return true;
  }

  async refresh(req: Request, res: Response): Promise<AuthPayload> {
    const token = readRefreshToken(req);
    if (token === null) {
      throw new BusinessException('Refresh token missing', HttpStatus.UNAUTHORIZED);
    }
    try {
      const payload = this.jwtService.verify<JwtRefreshPayload>(token, {
        secret: env('JWT_REFRESH_SECRET'),
      });
      if (payload.typ !== 'refresh') {
        throw new BusinessException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
      }
      const user = await this.usersService.requireById(payload.sub);
      return this.issue(user, res);
    } catch (error) {
      if (error instanceof BusinessException) {
        throw error;
      }
      throw new BusinessException('Invalid refresh token', HttpStatus.UNAUTHORIZED);
    }
  }

  private issue(user: UserRecord, res: Response): AuthPayload {
    const accessPayload: JwtAccessPayload = {
      sub: user.id,
      email: user.email,
      typ: 'access',
    };
    const refreshPayload: JwtRefreshPayload = {
      sub: user.id,
      email: user.email,
      typ: 'refresh',
    };
    const token = this.jwtService.sign(accessPayload, {
      secret: env('JWT_SECRET'),
      expiresIn: '24h',
    });
    const refresh = this.jwtService.sign(refreshPayload, {
      secret: env('JWT_REFRESH_SECRET'),
      expiresIn: '7d',
    });
    res.cookie(ACCESS_COOKIE, token, authCookieOptions(ACCESS_MAX_AGE_MS));
    res.cookie(REFRESH_COOKIE, refresh, authCookieOptions(REFRESH_MAX_AGE_MS));
    const payload = new AuthPayload();
    payload.token = token;
    payload.user = this.usersService.toGraphql(user);
    return payload;
  }
}

function accountEmail(raw: string): string {
  const email = normalizeEmail(raw);
  if (email === null) {
    throw new BusinessException('Invalid credentials', HttpStatus.UNAUTHORIZED);
  }
  return email;
}
