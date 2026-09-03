import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, MinLength } from 'class-validator';

@InputType()
export class SaveContactInput {
  @Field(() => String)
  @IsString()
  @MinLength(1)
  name: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  email: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  phone: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  website: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio: string | null;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  skills: string[] | null;

  @Field(() => String, { nullable: true, description: 'Public card slug when saving from /c/:slug' })
  @IsOptional()
  @IsString()
  sourceSlug: string | null;
}
