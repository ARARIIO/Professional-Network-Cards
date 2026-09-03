import { Controller, Get, Param, Req, UseGuards, UseInterceptors } from '@nestjs/common';
import type { Request } from 'express';
import { OptionalUser } from '../common/decorators/optional-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard.js';
import { TransformInterceptor } from '../common/interceptors/transform.interceptor.js';
import { clientIp, clientUserAgent } from '../common/http/client-meta.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { CardsService } from './cards.service.js';
import { PublicCard } from './entities/public-card.entity.js';

@Controller('cards')
export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @UseInterceptors(TransformInterceptor)
  @Get(':slug')
  getBySlug(
    @Param('slug') slug: string,
    @OptionalUser() viewer: AuthUser | null,
    @Req() req: Request,
  ): Promise<PublicCard> {
    return this.cardsService.publicBySlug(
      slug,
      viewer,
      clientIp(req),
      clientUserAgent(req),
    );
  }
}
