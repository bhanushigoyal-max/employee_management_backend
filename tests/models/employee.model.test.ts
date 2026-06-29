import { EmployeeModel } from '../../src/models/employee.model';

describe('Employee Model Test', () => {
  it('should create an employee instance successfully', () => {
    const employeeData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      mobile: '1234567890',
      dateOfBirth: new Date(),
      gender: 'Male',
      department: 'HR',
      skills: ['JS'],
      country: 'USA',
      state: 'NY',
      city: 'New York',
      address: '123 Main St',
      resume: 'resume.pdf',
      preferredMode: ['Email'],
    };
    
    const employee = new EmployeeModel(employeeData);
    expect(employee.firstName).toBe(employeeData.firstName);
    expect(employee.email).toBe(employeeData.email);
    const err = employee.validateSync();
    expect(err).toBeUndefined();
  });

  it('should fail validation if required fields are missing', () => {
    const employee = new EmployeeModel({});
    const err = employee.validateSync();
    expect(err).toBeDefined();
    expect(err?.errors['firstName']).toBeDefined();
    expect(err?.errors['email']).toBeDefined();
  });

  it('should fail validation if skills array is empty', () => {
    const employeeData = {
      firstName: 'John',
      lastName: 'Doe',
      email: 'john@example.com',
      mobile: '1234567890',
      dateOfBirth: new Date(),
      gender: 'Male',
      department: 'HR',
      skills: [],
      country: 'USA',
      state: 'NY',
      city: 'New York',
      address: '123 Main St',
      resume: 'resume.pdf',
      preferredMode: ['Email'],
    };
    const employee = new EmployeeModel(employeeData);
    const err = employee.validateSync();
    expect(err?.errors['skills']).toBeDefined();
  });
});
