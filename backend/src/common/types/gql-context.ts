import type { Request, Response } from 'express';

export type GqlContext = {
  req: Request;
  res: Response;
};
