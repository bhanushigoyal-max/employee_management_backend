import { Request, Response } from 'express';
import { EmployeeService } from '../services/employee.service';
import { employeeValidationSchema } from '../validation/employee.validation';
import { IEmployee } from '../types/employee.types';
import { z } from 'zod';
import { MESSAGES } from '../lang/messages';

export class EmployeeController {
  /**
   * Handles the creation of a new employee.
   * Validates the request body, processes uploaded files (profile image and resume),
   * checks for duplicates, and saves the employee to the database.
   * 
   * @param req - The Express request object containing employee data and files.
   * @param res - The Express response object.
   * @returns A promise resolving to void. Sends a 201 response on success, or 400/500 on failure.
   */
  static async createEmployee(req: Request, res: Response): Promise<void> {
    try {
      const data = employeeValidationSchema.parse(req.body);

      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const getFileUrl = (file: Express.Multer.File | undefined) => {
        if (!file) return undefined;
        let mediaUrl = process.env.AWS_MEDIA_URL || '';
        mediaUrl = mediaUrl.trim().replace(/['"]/g, '');
        if (mediaUrl && (file as any).key) {
          const baseUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl;
          return `${baseUrl}/${(file as any).key}`;
        }
        return (file as any).location || file.path.replace(/\\/g, "/");
      };

      const employeeData = {
        ...data,
        profileImage: getFileUrl(files?.profileImage?.[0]),
        resume: getFileUrl(files?.resume?.[0]),
      };

      if (!employeeData.resume) {
        res.status(400).json({
          success: false,
          message: MESSAGES.EMPLOYEE.RESUME_REQUIRED,
        });
        return;
      }

      const duplicate = await EmployeeService.checkDuplicate(
        employeeData.email,
        employeeData.mobile
      );

      if (duplicate) {
        res.status(201).json({
          success: false,
          message: MESSAGES.EMPLOYEE.DUPLICATE_EXISTS(duplicate),
        });
        return;
      }

      const employee = await EmployeeService.createEmployee(employeeData);

      res.status(201).json({
        success: true,
        message: MESSAGES.EMPLOYEE.CREATED_SUCCESS,
        data: employee,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          success: false,
          message: MESSAGES.VALIDATION.VALIDATION_FAILED,
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
        return;
      }

      if ((error as any).code === 11000) {
        const field = Object.keys((error as any).keyValue)[0];

        res.status(409).json({
          success: false,
          message: MESSAGES.EMPLOYEE.DUPLICATE_EXISTS(field),
        });
        return;
      }

      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Retrieves all employees from the database with pagination, search, and sort options.
   * 
   * @param req - The Express request object.
   * @param res - The Express response object.
   * @returns A promise resolving to void. Sends a 200 response with the list of employees and total count.
   */
  static async getAllEmployees(req: Request, res: Response): Promise<void> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string || '';
      const sortBy = req.query.sortBy as string || 'createdAt';
      const sortOrder = (req.query.sortOrder as string) === 'asc' ? 'asc' : 'desc';

      const { employees, total } = await EmployeeService.getAllEmployees({
        page,
        limit,
        search,
        sortBy,
        sortOrder
      });

      res.status(200).json({
        success: true,
        message: MESSAGES.EMPLOYEE.FETCHED_SUCCESS,
        result: employees,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message, result: [], total: 0 });
    }
  }

  /**
   * Retrieves a specific employee by their ID.
   * 
   * @param req - The Express request object containing the employee ID in params.
   * @param res - The Express response object.
   * @returns A promise resolving to void. Sends a 200 response with employee data, or 404 if not found.
   */
  static async getEmployeeById(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const employee = await EmployeeService.getEmployeeById(id);
      if (!employee) {
        res.status(404).json({ success: false, message: MESSAGES.EMPLOYEE.NOT_FOUND });
        return;
      }
      res.status(200).json({ success: true, data: employee });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }

  /**
   * Updates an existing employee's information.
   * Supports partial updates, validates data, processes new file uploads,
   * checks for duplicates against other employees, and cleans up old files.
   * 
   * @param req - The Express request object containing updated data and/or new files.
   * @param res - The Express response object.
   * @returns A promise resolving to void. Sends a 200 response on success, or 400/404/500 on failure.
   */
  static async updateEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;

      const data = employeeValidationSchema.partial().parse(req.body);

      const files = req.files as {
        [fieldname: string]: Express.Multer.File[];
      };

      const getFileUrl = (file: Express.Multer.File | undefined) => {
        if (!file) return undefined;
        let mediaUrl = process.env.AWS_MEDIA_URL || '';
        mediaUrl = mediaUrl.trim().replace(/['"]/g, '');
        if (mediaUrl && (file as any).key) {
          const baseUrl = mediaUrl.endsWith('/') ? mediaUrl.slice(0, -1) : mediaUrl;
          return `${baseUrl}/${(file as any).key}`;
        }
        return (file as any).location || file.path.replace(/\\/g, "/");
      };

      const updateData: Partial<IEmployee> = {
        ...data,
        ...(files?.profileImage?.[0] && {
          profileImage: getFileUrl(files.profileImage[0]),
        }),
        ...(files?.resume?.[0] && {
          resume: getFileUrl(files.resume[0]),
        }),
      };

      const employee = await EmployeeService.getEmployeeById(id);

      if (!employee) {
        return void res.status(404).json({
          success: false,
          message: MESSAGES.EMPLOYEE.NOT_FOUND,
        });
      }

      const duplicate = await EmployeeService.checkDuplicate(
        updateData.email,
        updateData.mobile,
        id
      );

      if (duplicate) {
        return void res.status(201).json({
          success: false,
          message: MESSAGES.EMPLOYEE.DUPLICATE_EXISTS(duplicate),
        });
      }

      const updatedEmployee = await EmployeeService.updateEmployee(id, updateData);

      if (updateData.profileImage && employee.profileImage) {
        EmployeeService.deleteFileIfExists(employee.profileImage);
      }

      if (updateData.resume && employee.resume) {
        EmployeeService.deleteFileIfExists(employee.resume);
      }

      res.status(200).json({
        success: true,
        message: MESSAGES.EMPLOYEE.UPDATED_SUCCESS,
        data: updatedEmployee,
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return void res.status(400).json({
          success: false,
          message: MESSAGES.VALIDATION.VALIDATION_FAILED,
          errors: error.issues.map((err) => ({
            field: err.path.join("."),
            message: err.message,
          })),
        });
      }

      if ((error as any).code === 11000) {
        const field = Object.keys((error as any).keyValue)[0];

        return void res.status(400).json({
          success: false,
          message: MESSAGES.EMPLOYEE.DUPLICATE_EXISTS(field),
        });
      }

      res.status(500).json({
        success: false,
        message: (error as Error).message,
      });
    }
  }

  /**
   * Deletes an employee and their associated files from the server.
   * 
   * @param req - The Express request object containing the employee ID in params.
   * @param res - The Express response object.
   * @returns A promise resolving to void. Sends a 200 response on success, or 404/500 on failure.
   */
  static async deleteEmployee(req: Request, res: Response): Promise<void> {
    try {
      const id = req.params.id as string;
      const deletedEmployee = await EmployeeService.deleteEmployee(id);
      if (!deletedEmployee) {
        res.status(404).json({ success: false, message: MESSAGES.EMPLOYEE.NOT_FOUND });
        return;
      }
      res.status(200).json({ success: true, message: MESSAGES.EMPLOYEE.DELETED_SUCCESS });
    } catch (error) {
      res.status(500).json({ success: false, message: (error as Error).message });
    }
  }
}
