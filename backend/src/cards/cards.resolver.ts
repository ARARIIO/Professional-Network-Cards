import { UseGuards } from '@nestjs/common';
import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OptionalUser } from '../common/decorators/optional-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard.js';
import { clientIp, clientUserAgent } from '../common/http/client-meta.js';
import type { AuthUser } from '../common/types/auth-user.js';
import type { GqlContext } from '../common/types/gql-context.js';
import { CardsService } from './cards.service.js';
import { CreateCardInput } from './dto/create-card.input.js';
import { UpdateCardInput } from './dto/update-card.input.js';
import { Card } from './entities/card.entity.js';
import { PublicCard } from './entities/public-card.entity.js';

@Resolver(() => Card)
export class CardsResolver {
  constructor(private readonly cardsService: CardsService) {}

  @Query(() => Card, { nullable: true })
  myCard(@CurrentUser() user: AuthUser): Promise<Card | null> {
    return this.cardsService.myCard(user.id);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Query(() => PublicCard)
  getCard(
    @Args('slug') slug: string,
    @OptionalUser() viewer: AuthUser | null,
    @Context() context: GqlContext,
  ): Promise<PublicCard> {
    return this.cardsService.publicBySlug(
      slug,
      viewer,
      clientIp(context.req),
      clientUserAgent(context.req),
    );
  }

  @Mutation(() => Card)
  createCard(
    @Args('input') input: CreateCardInput,
    @CurrentUser() user: AuthUser,
  ): Promise<Card> {
    return this.cardsService.create(user.id, input);
  }

  @Mutation(() => Card)
  updateCard(
    @Args('input') input: UpdateCardInput,
    @CurrentUser() user: AuthUser,
  ): Promise<Card> {
    return this.cardsService.update(user.id, input);
  }

  @Mutation(() => Boolean)
  deleteCard(@CurrentUser() user: AuthUser): Promise<boolean> {
    return this.cardsService.delete(user.id);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Mutation(() => Boolean)
  recordCardView(
    @Args('cardId') cardId: string,
    @OptionalUser() viewer: AuthUser | null,
    @Context() context: GqlContext,
  ): Promise<boolean> {
    return this.cardsService.recordViewByCardId(
      cardId,
      viewer,
      clientIp(context.req),
      clientUserAgent(context.req),
    );
  }
}
