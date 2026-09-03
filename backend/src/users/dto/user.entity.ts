import { Field, ID, Int, ObjectType } from '@nestjs/graphql';
import { Card } from '../../cards/entities/card.entity.js';

@ObjectType({ description: 'Account without password hash.' })
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  name: string;

  @Field(() => Card, { nullable: true })
  card: Card | null;

  @Field(() => Int)
  contactsCount: number;
}
