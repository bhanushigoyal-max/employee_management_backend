import { employeeValidationSchema } from '../../src/validation/employee.validation';
import { Department } from '../../src/types/employee.types';

describe('Employee Validation Schema', () => {
  const validData = {
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    mobile: '1234567890',
    dateOfBirth: '1990-01-01',
    gender: 'Male',
    department: Department.HR,
    skills: ['JavaScript', 'TypeScript'],
    country: 'USA',
    state: 'California',
    city: 'Los Angeles',
    address: '123 Main St',
    preferredMode: ['Email'],
  };

  it('should validate correctly with valid data', () => {
    const result = employeeValidationSchema.safeParse(validData);
    expect(result.success).toBe(true);
  });

  it('should fail if first name contains numbers', () => {
    const data = { ...validData, firstName: 'John123' };
    const result = employeeValidationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should parse single string as array for skills and preferredMode', () => {
    const data = { ...validData, skills: 'JavaScript', preferredMode: 'Phone' };
    const result = employeeValidationSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.skills).toEqual(['JavaScript']);
      expect(result.data.preferredMode).toEqual(['Phone']);
    }
  });

  it('should fail if mobile is not exactly 10 digits', () => {
    const data = { ...validData, mobile: '12345' };
    const result = employeeValidationSchema.safeParse(data);
    expect(result.success).toBe(false);
  });

  it('should parse string dateOfBirth to Date object', () => {
    const result = employeeValidationSchema.safeParse(validData);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.dateOfBirth).toBeInstanceOf(Date);
    }
  });
});
