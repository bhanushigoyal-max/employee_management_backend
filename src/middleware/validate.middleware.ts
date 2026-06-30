import { Request, Response, NextFunction } from 'express';
import { z, ZodError, ZodTypeAny } from 'zod';
import { MESSAGES } from '../lang/messages';

export const validateRequest = (schema: ZodTypeAny) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Form-data naturally appends '[]' for array fields (like 'skills[]').
      // We strip these out so our validation schema sees the expected keys ('skills').
      if (req.body) {
        Object.keys(req.body).forEach(key => {
          if (key.endsWith('[]')) {
            const newKey = key.slice(0, -2);
            if (req.body[newKey] === undefined) {
              req.body[newKey] = req.body[key];
            }
          }
        });
      }

      // Validate the request body and update it with the parsed values
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          success: false,
          message: MESSAGES.VALIDATION.VALIDATION_FAILED,
          errors: error.issues.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
        return;
      }
      next(error);
    }
  };
};
