import { Department } from '../../src/types/employee.types';

describe('Employee Types', () => {
  it('should have the correct Department values', () => {
    expect(Department.DEVELOPMENT).toBe('Development');
    expect(Department.QA).toBe('QA');
    expect(Department.HR).toBe('HR');
    expect(Department.MARKETING).toBe('Marketing');
    expect(Department.SALES).toBe('Sales');
  });
});
