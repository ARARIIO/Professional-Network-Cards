import { Field, ObjectType } from '@nestjs/graphql';
import { User } from '../../users/dto/user.entity.js';

@ObjectType({ description: 'Login result. token is the 24h access JWT for GraphiQL; the browser also gets httpOnly cookies.' })
export class AuthPayload {
  @Field(() => String, { description: 'Access JWT. Send as Authorization: Bearer <token> in GraphiQL.' })
  token: string;

  @Field(() => User)
  user: User;
}
