// src/middlewares/auth.guard.ts
import { getSession } from '@auth/express';
import { authConfig } from '../lib/auth';
import { Request, Response, NextFunction } from 'express';

export const requireAuth = async (req: Request, res: Response, next: NextFunction) => {
  const session = await getSession(req, authConfig);
  // getSession(req: Request, config: AuthConfig)

  if (!session) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // optionally attach session to req.user
  (req as any).user = session.user;

  next();
};
