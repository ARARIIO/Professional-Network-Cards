import { ArgumentsHost, ExecutionContext } from '@nestjs/common';
import { GqlArgumentsHost, GqlExecutionContext } from '@nestjs/graphql';
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

export function getRequestFromHost(host: ArgumentsHost): Request {
  if (host.getType<'http' | 'graphql'>() === 'graphql') {
    return GqlArgumentsHost.create(host).getContext<GqlContext>().req;
  }
  return host.switchToHttp().getRequest<Request>();
}
