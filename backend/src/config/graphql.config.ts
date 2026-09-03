import { join } from 'node:path';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import { ApolloDriver } from '@nestjs/apollo';
import type { Request, Response } from 'express';
import { envOr } from '../common/env.js';
import type { GqlContext } from '../common/types/gql-context.js';

type ApolloExpressContext = {
  req: Request;
  res: Response;
};

export function graphqlConfig(): ApolloDriverConfig {
  const isProd = envOr('NODE_ENV', 'development') === 'production';
  return {
    driver: ApolloDriver,
    autoSchemaFile: join(process.cwd(), 'src/graphql/schema.graphql'),
    sortSchema: true,
    graphiql: isProd === false,
    context: (ctx: ApolloExpressContext): GqlContext => ({
      req: ctx.req,
      res: ctx.res,
    }),
  };
}
