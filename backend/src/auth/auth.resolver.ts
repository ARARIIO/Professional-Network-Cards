import { Args, Context, Mutation, Resolver } from '@nestjs/graphql';
import { Public } from '../common/decorators/public.decorator.js';
import type { GqlContext } from '../common/types/gql-context.js';
import { AuthService } from './auth.service.js';
import { AuthPayload } from './dto/auth.payload.js';
import { LoginInput } from './dto/login.input.js';
import { RegisterInput } from './dto/register.input.js';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Mutation(() => AuthPayload, { description: 'Create an account. Sets httpOnly cookies and returns an access token for GraphiQL.' })
  register(
    @Args('input') input: RegisterInput,
    @Context() context: GqlContext,
  ): Promise<AuthPayload> {
    return this.authService.register(input, context.res);
  }

  @Public()
  @Mutation(() => AuthPayload, { description: 'Sign in. Sets httpOnly cookies and returns an access token for GraphiQL.' })
  login(
    @Args('input') input: LoginInput,
    @Context() context: GqlContext,
  ): Promise<AuthPayload> {
    return this.authService.login(input, context.res);
  }

  @Public()
  @Mutation(() => Boolean, { description: 'Clear access and refresh cookies. Works without a live access token.' })
  logout(@Context() context: GqlContext): boolean {
    return this.authService.logout(context.res);
  }
}
