// src/middleware/auth.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { auth, firestore } from '../config/firebase.config';
import { Collections } from '../config/database.config';
import { UnauthorizedError, ForbiddenError } from '../shared/errors/http-errors';
import { UserRole } from '../shared/types/roles.types';
import { AuthenticatedUser } from '../shared/types/express.d';

/**
 * Verifies the Firebase Bearer token from the Authorization header.
 * Attaches the authenticated user (uid, email, name, role) to req.user.
 */
export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedError('Missing or malformed Authorization header. Expected: Bearer <token>');
    }

    const idToken = authHeader.split('Bearer ')[1].trim();

    if (!idToken) {
      throw new UnauthorizedError('Bearer token is empty');
    }

    // Verify token with Firebase Admin SDK
    const decodedToken = await auth.verifyIdToken(idToken);

    // Fetch the user's Firestore document for role information
    const userDoc = await firestore
      .collection(Collections.USERS)
      .doc(decodedToken.uid)
      .get();

    if (!userDoc.exists) {
      // User authenticated via Firebase but no Firestore profile yet.
      // Allow with default citizen role — profile created on first PUT /users/me
      req.user = {
        uid: decodedToken.uid,
        email: decodedToken.email ?? '',
        name: decodedToken.name ?? '',
        role: UserRole.CITIZEN,
      };
    } else {
      const userData = userDoc.data() as AuthenticatedUser;
      req.user = {
        uid: decodedToken.uid,
        email: userData.email ?? decodedToken.email ?? '',
        name: userData.name ?? decodedToken.name ?? '',
        role: userData.role ?? UserRole.CITIZEN,
      };
    }
    console.log("Authenticated user:", req.user);
    next();
  } catch (error: unknown) {
    if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
      next(error);
      return;
    }

    // Firebase token errors
    if (error instanceof Error) {
      const firebaseAuthErrors = [
        'auth/id-token-expired',
        'auth/id-token-revoked',
        'auth/invalid-id-token',
        'auth/argument-error',
      ];

      const isFirebaseAuthError = firebaseAuthErrors.some((code) =>
        error.message.includes(code),
      );

      if (isFirebaseAuthError) {
        next(new UnauthorizedError('Invalid or expired Firebase token'));
        return;
      }
    }

    next(new UnauthorizedError('Authentication failed'));
  }
  
}

/**
 * Authorization middleware factory.
 * Use after `authenticate`. Checks if req.user.role is in the allowed roles.
 *
 * @example router.get('/admin', authenticate, authorize(UserRole.ADMIN), handler)
 */
export function authorize(...allowedRoles: UserRole[]) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      next(new UnauthorizedError('User is not authenticated'));
      return;
    }

    if (!allowedRoles.includes(req.user.role)) {
      next(
        new ForbiddenError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`,
        ),
      );
      return;
    }

    next();
  };
}