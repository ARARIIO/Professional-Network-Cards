import { Injectable } from '@nestjs/common';
import { Int, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { OptionalUser } from '../common/decorators/optional-user.decorator.js';
import { Public } from '../common/decorators/public.decorator.js';
import { OptionalJwtGuard } from '../common/guards/optional-jwt.guard.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { Card } from '../cards/entities/card.entity.js';
import { CardsService } from '../cards/cards.service.js';
import { ContactsService } from '../contacts/contacts.service.js';
import { User } from './dto/user.entity.js';
import { UsersService } from './users.service.js';

@Resolver(() => User)
@Injectable()
export class UsersResolver {
  constructor(
    private readonly usersService: UsersService,
    private readonly cardsService: CardsService,
    private readonly contactsService: ContactsService,
  ) {}

  @Public()
  @UseGuards(OptionalJwtGuard)
  @Query(() => User, { nullable: true, description: 'Current user when a valid JWT cookie or Bearer token is present, otherwise null.' })
  async me(@OptionalUser() user: AuthUser | null): Promise<User | null> {
    if (user === null) {
      return null;
    }
    const record = await this.usersService.findById(user.id);
    if (record === null) {
      return null;
    }
    return this.usersService.toGraphql(record);
  }

  @ResolveField(() => Card, { nullable: true })
  card(@Parent() user: User): Promise<Card | null> {
    return this.cardsService.findGraphqlByUserId(user.id);
  }

  @ResolveField(() => Int)
  contactsCount(@Parent() user: User): Promise<number> {
    return this.contactsService.countByUserId(user.id);
  }
}
