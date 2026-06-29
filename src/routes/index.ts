import { Router, Request, Response } from 'express';
import { getHealthStatus } from '../services/health.service';
import employeeRoutes from './employee.routes';
import locationRoutes from './location.routes';
import authRoutes from './auth.routes';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Health check route
router.get('/health', (req: Request, res: Response) => {
  res.status(200).json(getHealthStatus());
});

// Auth routes (generate token)
router.use('/auth', authRoutes);

// Employee routes (protected)
router.use('/employees', authMiddleware, employeeRoutes);

// Location routes (protected)
router.use('/locations', authMiddleware, locationRoutes);

export default router;
