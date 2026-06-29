import request from 'supertest';
import express from 'express';
import authRoutes from '../../src/routes/auth.routes';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

const app = express();
app.use(express.json());
app.use('/auth', authRoutes);

describe('Auth Routes', () => {
  it('GET /auth/token should generate and return a token', async () => {
    (jwt.sign as jest.Mock).mockReturnValue('mocked-token');
    
    const response = await request(app).get('/auth/token');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('message', 'Token generated successfully');
    expect(response.body).toHaveProperty('token', 'mocked-token');
    expect(response.body).toHaveProperty('expiresIn');
  });

  it('GET /auth/token should return 500 on error', async () => {
    (jwt.sign as jest.Mock).mockImplementation(() => { throw new Error('JWT error'); });
    
    const response = await request(app).get('/auth/token');
    
    expect(response.status).toBe(500);
    expect(response.body).toHaveProperty('message', 'Error generating token');
  });
});
