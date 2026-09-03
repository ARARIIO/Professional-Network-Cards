import { Args, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CurrentUser } from '../common/decorators/current-user.decorator.js';
import { numberOrNull } from '../common/nullish.js';
import type { AuthUser } from '../common/types/auth-user.js';
import { ContactsService } from './contacts.service.js';
import { Contact } from './dto/contact.entity.js';
import { ContactInvite } from './dto/contact-invite.entity.js';
import { SaveContactInput } from './dto/save-contact.input.js';

@Resolver(() => Contact)
export class ContactsResolver {
  constructor(private readonly contactsService: ContactsService) {}

  @Query(() => [Contact], { description: 'Saved contacts for the signed-in user.' })
  myContacts(
    @CurrentUser() user: AuthUser,
    @Args('limit', { type: () => Int, nullable: true, description: 'Page size' }) limit: number | null,
    @Args('offset', { type: () => Int, nullable: true, description: 'Skip this many rows' }) offset: number | null,
  ): Promise<Contact[]> {
    return this.contactsService.list(
      user.id,
      numberOrNull(limit),
      numberOrNull(offset),
    );
  }

  @Query(() => [ContactInvite], { description: 'Pending requests to save your public card.' })
  incomingContactInvites(@CurrentUser() user: AuthUser): Promise<ContactInvite[]> {
    return this.contactsService.incomingInvites(user.id);
  }

  @Query(() => [ContactInvite], { description: 'Requests you sent to save someone else’s card.' })
  outgoingContactInvites(@CurrentUser() user: AuthUser): Promise<ContactInvite[]> {
    return this.contactsService.outgoingInvites(user.id);
  }

  @Mutation(() => ContactInvite, {
    description: 'Ask the card owner for permission to save their public card.',
  })
  sendContactInvite(
    @Args('sourceSlug', { description: 'Public card slug' }) sourceSlug: string,
    @CurrentUser() user: AuthUser,
  ): Promise<ContactInvite> {
    return this.contactsService.sendInvite(user.id, sourceSlug);
  }

  @Mutation(() => ContactInvite, { description: 'Accept or decline a pending invite. Accept creates contacts both ways when both cards are public.' })
  respondContactInvite(
    @Args('id') id: string,
    @Args('accept', { type: () => Boolean }) accept: boolean,
    @CurrentUser() user: AuthUser,
  ): Promise<ContactInvite> {
    return this.contactsService.respondInvite(user.id, id, accept);
  }

  @Mutation(() => Contact, { description: 'Save a contact without a public card (manual / CSV). Public cards require sendContactInvite.' })
  saveContact(
    @Args('input') input: SaveContactInput,
    @CurrentUser() user: AuthUser,
  ): Promise<Contact> {
    return this.contactsService.save(user.id, input);
  }

  @Mutation(() => Boolean, { description: 'Delete a contact owned by the signed-in user.' })
  deleteContact(
    @Args('id') id: string,
    @CurrentUser() user: AuthUser,
  ): Promise<boolean> {
    return this.contactsService.delete(user.id, id);
  }
}
