import { MESSAGES } from '../../src/lang/messages';

describe('Messages', () => {
  it('should have validation messages', () => {
    expect(MESSAGES.VALIDATION).toBeDefined();
    expect(MESSAGES.VALIDATION.FIRST_NAME_REQUIRED).toBe('First name is required');
  });

  it('should have employee messages', () => {
    expect(MESSAGES.EMPLOYEE).toBeDefined();
    expect(MESSAGES.EMPLOYEE.CREATED_SUCCESS).toBe('Employee created successfully');
    expect(MESSAGES.EMPLOYEE.DUPLICATE_EXISTS('email')).toBe('An employee with this email already exists.');
  });

  it('should have location messages', () => {
    expect(MESSAGES.LOCATION).toBeDefined();
    expect(MESSAGES.LOCATION.NO_STATES_FOUND).toBe('No states found for this country');
  });

  it('should have auth messages', () => {
    expect(MESSAGES.AUTH).toBeDefined();
    expect(MESSAGES.AUTH.TOKEN_GENERATED).toBe('Token generated successfully');
  });

  it('should have upload messages', () => {
    expect(MESSAGES.UPLOAD).toBeDefined();
    expect(MESSAGES.UPLOAD.INVALID_IMAGE).toBe('Invalid file type! Profile image must be an image.');
  });

  it('should have system messages', () => {
    expect(MESSAGES.SYSTEM).toBeDefined();
    expect(MESSAGES.SYSTEM.SERVER_RUNNING).toBe('Server is up and running!');
    expect(MESSAGES.SYSTEM.DB_CONNECTED('localhost')).toBe('MongoDB Connected: localhost');
    expect(MESSAGES.SYSTEM.DB_CONNECTION_ERROR('timeout')).toBe('Error connecting to MongoDB: timeout');
  });
});
