import { Module, forwardRef } from '@nestjs/common';
import { AnalyticsModule } from '../analytics/analytics.module.js';
import { StorageModule } from '../storage/storage.module.js';
import { CardsController } from './cards.controller.js';
import { CardsResolver } from './cards.resolver.js';
import { CardsService } from './cards.service.js';
import { CardRepository } from './repositories/card.repository.js';
import { NanoidSlugGenerator } from './strategies/slug-generator.strategy.js';

@Module({
  imports: [forwardRef(() => AnalyticsModule), StorageModule],
  controllers: [CardsController],
  providers: [
    CardsService,
    CardsResolver,
    CardRepository,
    NanoidSlugGenerator,
  ],
  exports: [CardsService],
})
export class CardsModule {}
