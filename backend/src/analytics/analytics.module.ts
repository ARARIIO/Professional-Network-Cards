import { Module, forwardRef } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module.js';
import { AnalyticsResolver } from './analytics.resolver.js';
import { AnalyticsService } from './analytics.service.js';
import { CardViewRepository } from './repositories/card-view.repository.js';

@Module({
  imports: [forwardRef(() => CardsModule)],
  providers: [AnalyticsService, AnalyticsResolver, CardViewRepository],
  exports: [AnalyticsService],
})
export class AnalyticsModule {}
