import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/dto/user.entity.js';

@ObjectType()
export class AuthPayload {
  @Field(() => String)
  token: string;

  @Field(() => User)
  user: User;
}
