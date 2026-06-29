import request from 'supertest';
import express from 'express';
import indexRoutes from '../../src/routes/index';
import { getHealthStatus } from '../../src/services/health.service';

jest.mock('../../src/services/health.service');
jest.mock('../../src/routes/auth.routes', () => {
  const { Router } = require('express');
  const router = Router();
  router.get('/test', (req: any, res: any) => res.status(200).send('auth'));
  return router;
});
jest.mock('../../src/routes/employee.routes', () => {
  const { Router } = require('express');
  const router = Router();
  router.get('/test', (req: any, res: any) => res.status(200).send('employee'));
  return router;
});
jest.mock('../../src/routes/location.routes', () => {
  const { Router } = require('express');
  const router = Router();
  router.get('/test', (req: any, res: any) => res.status(200).send('location'));
  return router;
});
jest.mock('../../src/middleware/auth.middleware', () => ({
  authMiddleware: (req: any, res: any, next: any) => next()
}));

const app = express();
app.use(express.json());
app.use('/api', indexRoutes);

describe('Index Routes', () => {
  it('GET /api/health should return health status', async () => {
    (getHealthStatus as jest.Mock).mockReturnValue({ success: true, message: 'Server is up' });
    const response = await request(app).get('/api/health');
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, message: 'Server is up' });
  });

  it('should route /api/auth to auth routes', async () => {
    const response = await request(app).get('/api/auth/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('auth');
  });

  it('should route /api/employees to employee routes', async () => {
    const response = await request(app).get('/api/employees/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('employee');
  });

  it('should route /api/locations to location routes', async () => {
    const response = await request(app).get('/api/locations/test');
    expect(response.status).toBe(200);
    expect(response.text).toBe('location');
  });
});
