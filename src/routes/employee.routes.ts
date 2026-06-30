import { Router } from 'express';
import { EmployeeController } from '../controllers/employee.controller';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { validateRequest } from '../middleware/validate.middleware';
import { employeeValidationSchema } from '../validation/employee.validation';

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
router.post('/', employeeUploads, validateRequest(employeeValidationSchema), EmployeeController.createEmployee);

/**
 * @route GET /api/employees
 * @desc Retrieve all employees
 */
router.get('/', EmployeeController.getAllEmployees);

/**
 * @route GET /api/employees/skills
 * @desc Retrieve predefined skills based on department
 */
router.get('/skills/department', EmployeeController.getDepartmentSkills);

/**
 * @route GET /api/employees/:id
 * @desc Retrieve a specific employee by ID
 */
router.get('/:id', EmployeeController.getEmployeeById);

/**
 * @route PUT /api/employees/:id
 * @desc Update an existing employee and handle optional file replacements
 */
router.put('/:id', employeeUploads, validateRequest(employeeValidationSchema.partial()), EmployeeController.updateEmployee);

/**
 * @route DELETE /api/employees/:id
 * @desc Delete an employee and their associated files
 */
router.delete('/:id', EmployeeController.deleteEmployee);

export default router;
