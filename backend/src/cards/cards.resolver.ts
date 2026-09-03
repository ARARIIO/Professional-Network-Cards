import { Inject, UseGuards, forwardRef } from '@nestjs/common';
import { Args, Context, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { OptionalUser } from '../common/decorators/optional-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard.js';
import { clientIp, clientUserAgent } from '../common/http/client-meta.js';
import { numberOrNull, stringOrNull } from '../common/nullish.js';
import type { AuthUser } from '../common/types/auth-user.js';
import type { GqlContext } from '../common/types/gql-context.js';
import { CardsService } from './cards.service.js';
import { CreateCardInput } from './dto/create-card.input.js';
import { UpdateCardInput } from './dto/update-card.input.js';
import { Card } from './entities/card.entity.js';
import { PublicCard } from './entities/public-card.entity.js';
import { PublicCardHit } from './entities/public-card-hit.entity.js';
import { ContactsService } from '../contacts/contacts.service.js';

@Resolver(() => Card)
export class CardsResolver {
  constructor(
    private readonly cardsService: CardsService,
    @Inject(forwardRef(() => ContactsService))
    private readonly contactsService: ContactsService,
  ) {}

  @Query(() => Card, { nullable: true, description: 'Signed-in user card, or null if none exists.' })
  myCard(@CurrentUser() user: AuthUser): Promise<Card | null> {
    return this.cardsService.myCard(user.id);
  }

  @Query(() => [PublicCardHit], {
    description:
      'Public cards for the signed-in directory. Empty query lists recent cards excluding the viewer. Does not record views.',
  })
  searchPublicCards(
    @CurrentUser() user: AuthUser,
    @Args('query', {
      type: () => String,
      nullable: true,
      description: 'Match name, email, or slug',
    })
    query: string | null,
    @Args('limit', {
      type: () => Int,
      nullable: true,
      description: 'Max rows, default 20',
    })
    limit: number | null,
  ): Promise<PublicCardHit[]> {
    return this.cardsService.searchPublic(user.id, stringOrNull(query), numberOrNull(limit));
  }

  @ResolveField(() => Int)
  savesCount(@Parent() card: Card): Promise<number> {
    return this.contactsService.countBySourceCardId(card.id);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Query(() => PublicCard, { description: 'Public card by slug. Records a view (IP + user-agent).' })
  getCard(
    @Args('slug', { description: 'Share slug from /c/:slug' }) slug: string,
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

  @Mutation(() => Card, { description: 'Create the owner card. Slug is generated server-side.' })
  createCard(
    @Args('input') input: CreateCardInput,
    @CurrentUser() user: AuthUser,
  ): Promise<Card> {
    return this.cardsService.create(user.id, input);
  }

  @Mutation(() => Card, { description: 'Update the owner card. Null input fields are left unchanged.' })
  updateCard(
    @Args('input') input: UpdateCardInput,
    @CurrentUser() user: AuthUser,
  ): Promise<Card> {
    return this.cardsService.update(user.id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete the owner card and its stored avatar.' })
  deleteCard(@CurrentUser() user: AuthUser): Promise<boolean> {
    return this.cardsService.delete(user.id);
  }

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Mutation(() => Boolean, { description: 'Record a view by internal card id (TZ extra; public GET /cards/:slug also records).' })
  recordCardView(
    @Args('cardId', { description: 'Owner Card.id, not the public slug' }) cardId: string,
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
