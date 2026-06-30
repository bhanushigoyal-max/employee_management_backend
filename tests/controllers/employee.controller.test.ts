import { EmployeeController } from '../../src/controllers/employee.controller';
import { EmployeeService } from '../../src/services/employee.service';
import { Request, Response } from 'express';

jest.mock('../../src/services/employee.service');

describe('Employee Controller', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockRequest = {
      body: {},
      params: {},
      query: {},
    };
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    jest.clearAllMocks();
  });

  const validEmployeeData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john@example.com',
    mobile: '1234567890',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    department: 'HR',
    skills: ['JavaScript'],
    country: 'USA',
    state: 'CA',
    city: 'Los Angeles',
    address: '123 Main St',
    preferredMode: ['Email'],
  };

  describe('createEmployee', () => {


    it('should return 400 if resume file is missing', async () => {
      mockRequest.body = validEmployeeData;
      mockRequest.files = {};

      await EmployeeController.createEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Resume file is required' });
    });

    it('should return 201 with success false if duplicate exists', async () => {
      mockRequest.body = validEmployeeData;
      mockRequest.files = {
        resume: [{ location: 'https://s3.amazonaws.com/bucket/uploads/resume.pdf', key: 'uploads/resume.pdf' }] as any,
      };
      (EmployeeService.checkDuplicate as jest.Mock).mockResolvedValue('email');

      await EmployeeController.createEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'An employee with this email already exists.' });
    });

    it('should return 201 with success true on successful creation', async () => {
      mockRequest.body = validEmployeeData;
      mockRequest.files = {
        resume: [{ location: 'https://s3.amazonaws.com/bucket/uploads/resume.pdf', key: 'uploads/resume.pdf' }] as any,
        profileImage: [{ location: 'https://s3.amazonaws.com/bucket/uploads/img.png', key: 'uploads/img.png' }] as any,
      };
      (EmployeeService.checkDuplicate as jest.Mock).mockResolvedValue(null);
      (EmployeeService.createEmployee as jest.Mock).mockResolvedValue({ id: '1', ...validEmployeeData });

      await EmployeeController.createEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Employee created successfully',
        data: expect.any(Object)
      });
    });
  });

  describe('getAllEmployees', () => {
    it('should return 200 with employees list', async () => {
      (EmployeeService.getAllEmployees as jest.Mock).mockResolvedValue({ employees: [], total: 0 });

      await EmployeeController.getAllEmployees(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: true,
        message: 'Employees fetched successfully',
        result: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0
      });
    });

    it('should return 500 on error', async () => {
      (EmployeeService.getAllEmployees as jest.Mock).mockRejectedValue(new Error('DB error'));

      await EmployeeController.getAllEmployees(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(500);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: false,
        message: 'DB error'
      }));
    });
  });

  describe('getDepartmentSkills', () => {
    it('should return all skills if no department queried', () => {
      EmployeeController.getDepartmentSkills(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Object)
      }));
    });

    it('should return specific skills for a valid department', () => {
      mockRequest.query = { department: 'Development' };
      EmployeeController.getDepartmentSkills(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        data: expect.any(Array)
      }));
    });

    it('should return 404 for an invalid department', () => {
      mockRequest.query = { department: 'Invalid' };
      EmployeeController.getDepartmentSkills(mockRequest as Request, mockResponse as Response);
      
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({
        success: false,
        message: 'Department not found'
      });
    });
  });

  describe('getEmployeeById', () => {
    it('should return 404 if employee not found', async () => {
      mockRequest.params = { id: '1' };
      (EmployeeService.getEmployeeById as jest.Mock).mockResolvedValue(null);

      await EmployeeController.getEmployeeById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Employee not found' });
    });

    it('should return 200 with employee data', async () => {
      mockRequest.params = { id: '1' };
      (EmployeeService.getEmployeeById as jest.Mock).mockResolvedValue({ _id: '1', firstName: 'John' });

      await EmployeeController.getEmployeeById(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, data: { _id: '1', firstName: 'John' } });
    });
  });

  describe('updateEmployee', () => {
    it('should return 404 if employee not found', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { firstName: 'Updated' };
      (EmployeeService.getEmployeeById as jest.Mock).mockResolvedValue(null);

      await EmployeeController.updateEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Employee not found' });
    });

    it('should return 201 with success false if duplicate exists on update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { firstName: 'Updated' };
      (EmployeeService.getEmployeeById as jest.Mock).mockResolvedValue({ _id: '1' });
      (EmployeeService.checkDuplicate as jest.Mock).mockResolvedValue('email');

      await EmployeeController.updateEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'An employee with this email already exists.' });
    });

    it('should return 200 on successful update', async () => {
      mockRequest.params = { id: '1' };
      mockRequest.body = { firstName: 'Updated' };
      (EmployeeService.getEmployeeById as jest.Mock).mockResolvedValue({ _id: '1' });
      (EmployeeService.checkDuplicate as jest.Mock).mockResolvedValue(null);
      (EmployeeService.updateEmployee as jest.Mock).mockResolvedValue({ _id: '1', firstName: 'Updated' });

      await EmployeeController.updateEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Employee updated successfully', data: { _id: '1', firstName: 'Updated' } });
    });
  });

  describe('deleteEmployee', () => {
    it('should return 404 if employee not found', async () => {
      mockRequest.params = { id: '1' };
      (EmployeeService.deleteEmployee as jest.Mock).mockResolvedValue(null);

      await EmployeeController.deleteEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: false, message: 'Employee not found' });
    });

    it('should return 200 on successful delete', async () => {
      mockRequest.params = { id: '1' };
      (EmployeeService.deleteEmployee as jest.Mock).mockResolvedValue({ _id: '1' });

      await EmployeeController.deleteEmployee(mockRequest as Request, mockResponse as Response);

      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ success: true, message: 'Employee deleted successfully' });
    });
  });
});
