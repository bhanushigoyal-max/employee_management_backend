import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { MESSAGES } from '../lang/messages';

// Extend Express Request interface to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({ message: MESSAGES.AUTH.NO_TOKEN });
      return;
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      res.status(401).json({ message: MESSAGES.AUTH.MALFORMED_TOKEN });
      return;
    }

    // Verify token
    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
    const decoded = jwt.verify(token, secret);

    // Add user info to request
    req.user = decoded;

    next();
  } catch (error) {
    res.status(401).json({ message: MESSAGES.AUTH.INVALID_TOKEN });
  }
};
