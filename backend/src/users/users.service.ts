import { HttpStatus, Injectable } from '@nestjs/common';
import type { User as UserRecord } from '../generated/prisma/client.js';
import { BusinessException } from '../common/exceptions/business.exception.js';
import { User } from './dto/user.entity.js';
import { UserRepository } from './repositories/user.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly users: UserRepository) {}

  toGraphql(record: UserRecord): User {
    const user = new User();
    user.id = record.id;
    user.email = record.email;
    user.name = record.name;
    user.card = null;
    user.contactsCount = 0;
    return user;
  }

  findById(id: string): Promise<UserRecord | null> {
    return this.users.findById(id);
  }

  findByEmail(email: string): Promise<UserRecord | null> {
    return this.users.findByEmail(email);
  }

  async requireById(id: string): Promise<UserRecord> {
    const user = await this.users.findById(id);
    if (user === null) {
      throw new BusinessException('User not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  create(data: {
    email: string;
    password: string;
    name: string;
  }): Promise<UserRecord> {
    return this.users.create(data);
  }
}
