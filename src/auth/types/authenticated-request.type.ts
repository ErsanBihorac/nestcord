import type { Request } from 'express';
import type { JwtPayload } from './jwt-payload.type.js';

export type AuthenticatedRequest = Request & {
  user: JwtPayload;
};
