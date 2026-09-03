import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Saved contact owned by the signed-in user.' })
export class Contact {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  email: string | null;

  @Field(() => String, { nullable: true })
  phone: string | null;

  @Field(() => String, { nullable: true })
  website: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => [String])
  skills: string[];

  @Field(() => Date)
  createdAt: Date;
}
