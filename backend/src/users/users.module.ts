import { Module, forwardRef } from '@nestjs/common';
import { CardsModule } from '../cards/cards.module.js';
import { ContactsModule } from '../contacts/contacts.module.js';
import { UserRepository } from './repositories/user.repository.js';
import { UsersResolver } from './users.resolver.js';
import { UsersService } from './users.service.js';

@Module({
  imports: [forwardRef(() => CardsModule), forwardRef(() => ContactsModule)],
  providers: [UsersService, UsersResolver, UserRepository],
  exports: [UsersService],
})
export class UsersModule {}
