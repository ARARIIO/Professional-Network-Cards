import { HttpStatus, Injectable } from '@nestjs/common';
import { Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { CardsService } from '../cards/cards.service.js';
import { AnalyticsService } from './analytics.service.js';
import { CardAnalytics } from './entities/card-view.entity.js';

@Resolver(() => CardAnalytics)
@Injectable()
export class AnalyticsResolver {
  constructor(
    private readonly analyticsService: AnalyticsService,
    private readonly cardsService: CardsService,
  ) {}

  @Query(() => CardAnalytics, { description: 'Owner-only view stats: totals, 7-day series, recent IP/user-agent rows.' })
  async cardAnalytics(@CurrentUser() user: AuthUser): Promise<CardAnalytics> {
    const card = await this.cardsService.myCard(user.id);
    if (card === null) {
      throw new BusinessException('Card not found', HttpStatus.NOT_FOUND);
    }
    return this.analyticsService.forCard(card.id, card.viewsCount);
  }
}
