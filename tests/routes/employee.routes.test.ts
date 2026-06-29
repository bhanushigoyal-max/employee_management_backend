import request from 'supertest';
import express from 'express';
import employeeRoutes from '../../src/routes/employee.routes';
import { EmployeeController } from '../../src/controllers/employee.controller';

jest.mock('../../src/controllers/employee.controller');
jest.mock('../../src/middleware/upload.middleware', () => ({
  uploadMiddleware: {
    fields: () => (req: any, res: any, next: any) => next()
  }
}));
jest.mock('../../src/middleware/normalize.middleware', () => ({
  normalizeEmployeeFormData: (req: any, res: any, next: any) => next()
}));

const app = express();
app.use(express.json());
app.use('/employees', employeeRoutes);

describe('Employee Routes', () => {
  it('POST /employees should route to createEmployee', async () => {
    (EmployeeController.createEmployee as jest.Mock).mockImplementation((req, res) => res.status(201).json({}));
    const response = await request(app).post('/employees');
    expect(response.status).toBe(201);
  });

  it('GET /employees should route to getAllEmployees', async () => {
    (EmployeeController.getAllEmployees as jest.Mock).mockImplementation((req, res) => res.status(200).json({}));
    const response = await request(app).get('/employees');
    expect(response.status).toBe(200);
  });

  it('GET /employees/:id should route to getEmployeeById', async () => {
    (EmployeeController.getEmployeeById as jest.Mock).mockImplementation((req, res) => res.status(200).json({}));
    const response = await request(app).get('/employees/1');
    expect(response.status).toBe(200);
  });

  it('PUT /employees/:id should route to updateEmployee', async () => {
    (EmployeeController.updateEmployee as jest.Mock).mockImplementation((req, res) => res.status(200).json({}));
    const response = await request(app).put('/employees/1');
    expect(response.status).toBe(200);
  });

  it('DELETE /employees/:id should route to deleteEmployee', async () => {
    (EmployeeController.deleteEmployee as jest.Mock).mockImplementation((req, res) => res.status(200).json({}));
    const response = await request(app).delete('/employees/1');
    expect(response.status).toBe(200);
  });
});
