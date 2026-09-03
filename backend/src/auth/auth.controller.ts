import { Controller, Post, Req, Res } from '@nestjs/common';
import type { Request, Response } from 'express';
import { Public } from '../common/decorators/public.decorator.js';
import { AuthService } from './auth.service.js';
import { AuthPayload } from './dto/auth.payload.js';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('refresh')
  refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<AuthPayload> {
    return this.authService.refresh(req, res);
  }
}
