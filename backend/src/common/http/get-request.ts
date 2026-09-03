import { ExecutionContext } from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import type { Request, Response } from 'express';
import type { GqlContext } from '../types/gql-context.js';

export function getRequest(context: ExecutionContext): Request {
  if (context.getType<'http' | 'graphql'>() === 'graphql') {
    const gql = GqlExecutionContext.create(context);
    return gql.getContext<GqlContext>().req;
  }
  return context.switchToHttp().getRequest<Request>();
}

export function getResponse(context: ExecutionContext): Response {
  if (context.getType<'http' | 'graphql'>() === 'graphql') {
    const gql = GqlExecutionContext.create(context);
    return gql.getContext<GqlContext>().res;
  }
  return context.switchToHttp().getResponse<Response>();
}
