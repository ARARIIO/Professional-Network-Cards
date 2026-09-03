import { Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsEmail, IsOptional, IsString, MaxLength } from 'class-validator';

@InputType()
export class UpdateCardInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  name: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  role: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsEmail()
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
  @MaxLength(240)
  bio: string | null;

  @Field(() => [String], { nullable: true })
  @IsOptional()
  skills: string[] | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatarUrl: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  backgroundColor: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  linkedin: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  github: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  twitter: string | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPublic: boolean | null;
}
