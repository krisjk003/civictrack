// src/middleware/validation.middleware.ts

import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { BadRequestError } from '../shared/errors/http-errors';

type RequestPart = 'body' | 'query' | 'params';

/**
 * Middleware factory that validates a request part against a Zod schema.
 * On failure, throws a BadRequestError with structured field errors.
 *
 * @example
 * router.post('/', validate(createComplaintSchema, 'body'), controller.create)
 */
export function validate(schema: ZodSchema, part: RequestPart = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req[part]);

    if (!result.success) {
      const zodError = result.error as ZodError;
      const fieldErrors: Record<string, string[]> = {};

      for (const issue of zodError.issues) {
        const field = issue.path.join('.') || 'root';
        if (!fieldErrors[field]) {
          fieldErrors[field] = [];
        }
        fieldErrors[field].push(issue.message);
      }

      const error = new BadRequestError('Validation failed');
      // Attach structured errors by overriding the message temporarily
      // The error middleware will serialize fieldErrors from the error object
      (error as BadRequestError & { fieldErrors: Record<string, string[]> }).fieldErrors =
        fieldErrors;

      next(error);
      return;
    }

    // Replace request part with the parsed (and coerced) data
    req[part] = result.data;
    next();
  };
}