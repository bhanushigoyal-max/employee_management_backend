import { authMiddleware } from '../../src/middleware/auth.middleware';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

jest.mock('jsonwebtoken');

describe('Auth Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction;

  beforeEach(() => {
    mockRequest = {
      headers: {}
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
    nextFunction = jest.fn();
    process.env.JWT_SECRET = 'test_secret';
  });

  it('should call next() if valid token is provided', () => {
    mockRequest.headers!.authorization = 'Bearer validtoken';
    const decodedUser = { id: 1, name: 'Test' };
    (jwt.verify as jest.Mock).mockReturnValue(decodedUser);

    authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(jwt.verify).toHaveBeenCalledWith('validtoken', 'test_secret');
    expect((mockRequest as Request).user).toEqual(decodedUser);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should return 401 if no auth header is provided', () => {
    authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authentication failed: No token provided' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if auth header does not start with Bearer', () => {
    mockRequest.headers!.authorization = 'Basic token';
    
    authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authentication failed: No token provided' });
  });

  it('should return 401 if token is malformed (no token after Bearer)', () => {
    mockRequest.headers!.authorization = 'Bearer ';
    
    authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authentication failed: Malformed token' });
  });

  it('should return 401 if token is invalid', () => {
    mockRequest.headers!.authorization = 'Bearer invalidtoken';
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('Invalid token');
    });

    authMiddleware(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockResponse.status).toHaveBeenCalledWith(401);
    expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Authentication failed: Invalid token' });
  });
});
