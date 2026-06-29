import { Router, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { MESSAGES } from '../lang/messages';

const router = Router();

// Route to generate a random token
router.get('/token', (req: Request, res: Response) => {
  try {
    // Generate a random payload
    const payload = {
      id: Math.random().toString(36).substring(2, 15),
      role: 'admin',
      generatedAt: new Date().toISOString()
    };

    const secret = process.env.JWT_SECRET || 'super_secret_jwt_key_12345';
    const expiresIn = process.env.JWT_EXPIRES_IN || '24h';

    // Sign the token
    const token = jwt.sign(payload, secret, { expiresIn: expiresIn as any });

    res.status(200).json({
      message: MESSAGES.AUTH.TOKEN_GENERATED,
      token,
      expiresIn
    });
  } catch (error) {
    res.status(500).json({ message: MESSAGES.AUTH.ERROR_GENERATING, error });
  }
});

export default router;
