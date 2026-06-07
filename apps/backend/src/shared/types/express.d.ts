// src/shared/types/express.d.ts

import { UserRole } from './roles.types';

/**
 * Shape of the authenticated user attached to req.user
 * by the auth middleware after token verification.
 */
export interface AuthenticatedUser {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      file?: Express.Multer.File;
      files?: Express.Multer.File[];
    }
  }
}