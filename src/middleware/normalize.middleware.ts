import { Request, Response, NextFunction } from 'express';

export const normalizeEmployeeFormData = (req: Request, res: Response, next: NextFunction) => {
  if (req.body) {
    const body = { ...req.body };

    // 1. Strip '[]' from array keys (e.g., 'skills[]' -> 'skills', 'preferredMode[]' -> 'preferredMode')
    Object.keys(body).forEach((key) => {
      if (key.endsWith('[]')) {
        const newKey = key.slice(0, -2);
        if (!body[newKey]) {
          body[newKey] = body[key];
        }
      }
    });

    req.body = body;
  }
  next();
};
