import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { normalizeEmployeeFormData } from '../middleware/normalize.middleware';

const router = Router();

/**
 * Employee Routes
 * Defines the endpoints for creating, reading, updating, and deleting employee records.
 */

/**
 * Configure multer fields expected from frontend form-data submissions.
 * We accept a 'profileImage' and a 'resume' file.
 */
const employeeUploads = uploadMiddleware.fields([
  { name: 'profileImage', maxCount: 1 },
  { name: 'resume', maxCount: 1 },
]);

// --- Route Definitions ---

/**
 * @route POST /api/employees
 * @desc Create a new employee with uploaded files
 */
router.post('/', employeeUploads, normalizeEmployeeFormData, EmployeeController.createEmployee);

/**
 * @route GET /api/employees
 * @desc Retrieve all employees
 */
router.get('/', EmployeeController.getAllEmployees);

/**
 * @route GET /api/employees/:id
 * @desc Retrieve a specific employee by ID
 */
router.get('/:id', EmployeeController.getEmployeeById);

/**
 * @route PUT /api/employees/:id
 * @desc Update an existing employee and handle optional file replacements
 */
router.put('/:id', employeeUploads, normalizeEmployeeFormData, EmployeeController.updateEmployee);

/**
 * @route DELETE /api/employees/:id
 * @desc Delete an employee and their associated files
 */
router.delete('/:id', EmployeeController.deleteEmployee);

export default router;
