import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType({ description: 'Public card. No id, slug, or view counters.' })
export class PublicCard {
  @Field(() => String)
  name: string;

  @Field(() => String, { nullable: true })
  role: string | null;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  phone: string | null;

  @Field(() => String, { nullable: true })
  website: string | null;

  @Field(() => String, { nullable: true })
  bio: string | null;

  @Field(() => [String])
  skills: string[];

  @Field(() => String, { nullable: true })
  avatarUrl: string | null;

  @Field(() => String)
  backgroundColor: string;

  @Field(() => String, { nullable: true })
  linkedin: string | null;

  @Field(() => String, { nullable: true })
  github: string | null;

  @Field(() => String, { nullable: true })
  twitter: string | null;
}
