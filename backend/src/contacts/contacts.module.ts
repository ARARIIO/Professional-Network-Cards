import { Module } from '@nestjs/common';
import { ContactsController } from './contacts.controller.js';
import { ContactsResolver } from './contacts.resolver.js';
import { ContactsService } from './contacts.service.js';
import { ContactRepository } from './repositories/contact.repository.js';

@Module({
  controllers: [ContactsController],
  providers: [ContactsService, ContactsResolver, ContactRepository],
  exports: [ContactsService],
})
export class ContactsModule {}
