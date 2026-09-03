import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { numberOrNull } from '../common/nullish.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { ContactsService } from './contacts.service.js';
import { Contact } from './dto/contact.entity.js';
import { SaveContactInput } from './dto/save-contact.input.js';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private readonly contactsService: ContactsService) {}

  @Query(() => [Contact])
  myContacts(
    @CurrentUser() user: AuthUser,
    @Args('limit', { type: () => Int, nullable: true }) limit: number | null,
    @Args('offset', { type: () => Int, nullable: true }) offset: number | null,
  ): Promise<Contact[]> {
    return this.contactsService.list(
      user.id,
      numberOrNull(limit),
      numberOrNull(offset),
    );
  }

  @Mutation(() => Contact)
  saveContact(
    @Args('input') input: SaveContactInput,
    @CurrentUser() user: AuthUser,
  ): Promise<Contact> {
    return this.contactsService.save(user.id, input);
  }

  @Mutation(() => Boolean)
  deleteContact(
    @Args('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<boolean> {
    return this.contactsService.delete(user.id, id);
  }
}
