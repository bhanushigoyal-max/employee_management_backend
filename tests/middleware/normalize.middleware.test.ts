import { normalizeEmployeeFormData } from '../../src/middleware/normalize.middleware';
import { Request, Response, NextFunction } from 'express';

describe('Normalize Employee FormData Middleware', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  let nextFunction: NextFunction = jest.fn();

  beforeEach(() => {
    mockRequest = {};
    mockResponse = {};
    nextFunction = jest.fn();
  });

  it('should normalize array keys ending with []', () => {
    mockRequest.body = {
      'skills[]': ['JavaScript', 'TypeScript'],
      'preferredMode[]': 'Email',
      firstName: 'John'
    };

    normalizeEmployeeFormData(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.body).toHaveProperty('skills', ['JavaScript', 'TypeScript']);
    expect(mockRequest.body).toHaveProperty('preferredMode', 'Email');
    expect(mockRequest.body).toHaveProperty('firstName', 'John');
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should not overwrite existing keys without []', () => {
    mockRequest.body = {
      'skills[]': ['React'],
      skills: ['Vue'],
    };

    normalizeEmployeeFormData(mockRequest as Request, mockResponse as Response, nextFunction);

    expect(mockRequest.body.skills).toEqual(['Vue']);
    expect(nextFunction).toHaveBeenCalled();
  });

  it('should proceed if req.body is undefined', () => {
    normalizeEmployeeFormData(mockRequest as Request, mockResponse as Response, nextFunction);
    
    expect(mockRequest.body).toBeUndefined();
    expect(nextFunction).toHaveBeenCalled();
  });
});
