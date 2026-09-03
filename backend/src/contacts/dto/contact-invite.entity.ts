import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Request to save another user’s public card. Contact is created only after accept.' })
export class ContactInvite {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  status: string;

  @Field(() => String)
  fromName: string;

  @Field(() => String)
  fromEmail: string;

  @Field(() => String)
  cardName: string;

  @Field(() => String)
  cardSlug: string;

  @Field(() => Date)
  createdAt: Date;
}
