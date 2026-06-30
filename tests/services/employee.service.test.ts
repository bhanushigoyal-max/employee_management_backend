import { EmployeeService } from '../../src/services/employee.service';
import { EmployeeModel } from '../../src/models/employee.model';
import { AWSService } from '../../src/services/aws.service';

jest.mock('../../src/models/employee.model');

describe('Employee Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('checkDuplicate', () => {
    it('should return null if no email and mobile provided', async () => {
      const result = await EmployeeService.checkDuplicate();
      expect(result).toBeNull();
    });

    it('should return email if duplicate email found', async () => {
      (EmployeeModel.findOne as jest.Mock).mockResolvedValue({ email: 'test@test.com' });
      const result = await EmployeeService.checkDuplicate('test@test.com');
      expect(result).toBe('email');
    });

    it('should return mobile if duplicate mobile found', async () => {
      (EmployeeModel.findOne as jest.Mock).mockResolvedValue({ mobile: '1234567890' });
      const result = await EmployeeService.checkDuplicate(undefined, '1234567890');
      expect(result).toBe('mobile');
    });

    it('should return null if no duplicate found', async () => {
      (EmployeeModel.findOne as jest.Mock).mockResolvedValue(null);
      const result = await EmployeeService.checkDuplicate('test@test.com', '1234567890');
      expect(result).toBeNull();
    });
  });

  describe('createEmployee', () => {
    it('should create and save an employee', async () => {
      const mockSave = jest.fn().mockResolvedValue({ _id: '1', firstName: 'John' });
      (EmployeeModel as unknown as jest.Mock).mockImplementation(() => ({
        save: mockSave
      }));

      const result = await EmployeeService.createEmployee({ firstName: 'John' });
      expect(mockSave).toHaveBeenCalled();
      expect(result).toEqual({ _id: '1', firstName: 'John' });
    });
  });

  describe('getAllEmployees', () => {
    it('should return paginated employees and total', async () => {
      const mockLimit = jest.fn().mockResolvedValue([{ _id: '1' }]);
      const mockSkip = jest.fn().mockReturnValue({ limit: mockLimit });
      const mockSort = jest.fn().mockReturnValue({ skip: mockSkip });
      const mockFind = jest.fn().mockReturnValue({ sort: mockSort });
      
      EmployeeModel.find = mockFind as any;
      
      (EmployeeModel.countDocuments as jest.Mock).mockResolvedValue(1);

      const result = await EmployeeService.getAllEmployees();
      
      expect(mockFind).toHaveBeenCalled();
      expect(mockSort).toHaveBeenCalledWith({ createdAt: -1 });
      expect(mockSkip).toHaveBeenCalledWith(0);
      expect(mockLimit).toHaveBeenCalledWith(10);
      expect(result).toEqual({ employees: [{ _id: '1' }], total: 1 });
    });
  });

  describe('getEmployeeById', () => {
    it('should return employee by ID', async () => {
      (EmployeeModel.findById as jest.Mock).mockResolvedValue({ _id: '1' });
      const result = await EmployeeService.getEmployeeById('1');
      expect(result).toEqual({ _id: '1' });
      expect(EmployeeModel.findById).toHaveBeenCalledWith('1');
    });
  });

  describe('updateEmployee', () => {
    it('should update and return employee', async () => {
      (EmployeeModel.findByIdAndUpdate as jest.Mock).mockResolvedValue({ _id: '1', firstName: 'Updated' });
      const result = await EmployeeService.updateEmployee('1', { firstName: 'Updated' });
      expect(result).toEqual({ _id: '1', firstName: 'Updated' });
      expect(EmployeeModel.findByIdAndUpdate).toHaveBeenCalledWith('1', { firstName: 'Updated' }, { new: true, runValidators: true });
    });
  });

  describe('deleteEmployee', () => {
    it('should delete employee and files if exists', async () => {
      (EmployeeModel.findById as jest.Mock).mockResolvedValue({ 
        _id: '1', 
        profileImage: 'uploads/img.png', 
        resume: 'uploads/resume.pdf' 
      });
      (EmployeeModel.findByIdAndDelete as jest.Mock).mockResolvedValue({ _id: '1' });
      
      const deleteFileSpy = jest.spyOn(AWSService, 'deleteFile').mockResolvedValue();

      const result = await EmployeeService.deleteEmployee('1');

      expect(EmployeeModel.findById).toHaveBeenCalledWith('1');
      expect(deleteFileSpy).toHaveBeenCalledTimes(2);
      expect(EmployeeModel.findByIdAndDelete).toHaveBeenCalledWith('1');
      expect(result).toEqual({ _id: '1' });
    });

    it('should return null if employee not found', async () => {
      (EmployeeModel.findById as jest.Mock).mockResolvedValue(null);
      const result = await EmployeeService.deleteEmployee('1');
      expect(result).toBeNull();
      expect(EmployeeModel.findByIdAndDelete).not.toHaveBeenCalled();
    });
  });
});
