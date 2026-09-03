import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'Public card in the signed-in directory. Includes slug for save/open; no internal id.',
})
export class PublicCardHit {
  @Field(() => String)
  slug: string;

  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  role: string | null;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String)
  backgroundColor: string;

  @Field(() => Boolean)
  alreadySaved: boolean;

  @Field(() => String, { description: 'none, pending, accepted, or declined' })
  inviteStatus: string;
}
