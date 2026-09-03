import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class Card {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  userId: string;

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

  @Field(() => String)
  slug: string;

  @Field(() => Boolean)
  isPublic: boolean;

  @Field(() => Int)
  viewsCount: number;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
