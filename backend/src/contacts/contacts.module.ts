import { Module, forwardRef } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module.js';
import { ContactsController } from './contacts.controller.js';
import { ContactsResolver } from './contacts.resolver.js';
import { ContactsService } from './contacts.service.js';
import { ContactInviteRepository } from './repositories/contact-invite.repository.js';
import { ContactRepository } from './repositories/contact.repository.js';

@Module({
  imports: [forwardRef(() => CardsModule)],
  controllers: [ContactsController],
  providers: [ContactsService, ContactsResolver, ContactRepository, ContactInviteRepository],
  exports: [ContactsService, ContactRepository, ContactInviteRepository],
})
export class ContactsModule {}
