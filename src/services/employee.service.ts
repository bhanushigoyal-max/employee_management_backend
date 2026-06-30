import { EmployeeModel } from '../models/employee.model';
import { IEmployee } from '../types/employee.types';
import { AWSService } from './aws.service';

export class EmployeeService {
  /**
   * Checks for duplicate employee records based on email or mobile number.
   * Useful for validating uniqueness before creating or updating an employee.
   * 
   * @param email - The email address to check for duplicates.
   * @param mobile - The mobile number to check for duplicates.
   * @param excludeId - Optional employee ID to exclude from the check (used during updates).
   * @returns A promise that resolves to the name of the duplicated field ('email' or 'mobile'), or null if no duplicate is found.
   */
  static async checkDuplicate(email?: string, mobile?: string, excludeId?: string): Promise<string | null> {
    if (!email && !mobile) return null;
    const orConditions: any[] = [];
    if (email) orConditions.push({ email });
    if (mobile) orConditions.push({ mobile });

    const query: any = { $or: orConditions };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }

    const existing = await EmployeeModel.findOne(query);
    if (!existing) return null;
    if (email && existing.email === email) return 'email';
    if (mobile && existing.mobile === mobile) return 'mobile';
    return null;
  }

  /**
   * Creates a new employee record in the database.
   * 
   * @param employeeData - The data of the employee to create.
   * @returns A promise that resolves to the created employee document.
   */
  static async createEmployee(employeeData: Partial<IEmployee>): Promise<IEmployee> {
    const employee = new EmployeeModel(employeeData);
    return await employee.save();
  }

  /**
   * Retrieves employees from the database with pagination, searching, and sorting.
   * 
   * @param options - Configuration for pagination, search, and sort.
   * @returns A promise that resolves to an object containing the list of employees and total count.
   */
  static async getAllEmployees(options: { page?: number; limit?: number; search?: string; sortBy?: string; sortOrder?: 'asc' | 'desc' } = {}): Promise<{ employees: IEmployee[], total: number }> {
    const { page = 1, limit = 10, search = '', sortBy = 'createdAt', sortOrder = 'desc' } = options;

    const query: any = {};
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobile: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } },
      ];
    }

    const sortOption: any = {};
    sortOption[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const skip = (page - 1) * limit;

    const employees = await EmployeeModel.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit);

    const total = await EmployeeModel.countDocuments(query);

    return { employees, total };
  }

  /**
   * Retrieves a single employee by their unique ID.
   * 
   * @param id - The unique identifier of the employee.
   * @returns A promise that resolves to the employee document if found, or null if not found.
   */
  static async getEmployeeById(id: string): Promise<IEmployee | null> {
    return await EmployeeModel.findById(id);
  }

  /**
   * Updates an existing employee's information by their ID.
   * 
   * @param id - The unique identifier of the employee to update.
   * @param updateData - The data fields to update.
   * @returns A promise that resolves to the updated employee document, or null if not found.
   */
  static async updateEmployee(id: string, updateData: Partial<IEmployee>): Promise<IEmployee | null> {
    return await EmployeeModel.findByIdAndUpdate(id, updateData, {
      new: true, // return updated document
      runValidators: true,
    });
  }

  /**
   * Deletes an employee from the database by their ID, and also removes their associated files.
   * 
   * @param id - The unique identifier of the employee to delete.
   * @returns A promise that resolves to the deleted employee document, or null if not found.
   */
  static async deleteEmployee(id: string): Promise<IEmployee | null> {
    const employee = await EmployeeModel.findById(id);
    if (!employee) return null;

    // Delete associated files if they exist locally
    this.deleteFileIfExists(employee.profileImage);
    this.deleteFileIfExists(employee.resume);

    return await EmployeeModel.findByIdAndDelete(id);
  }

  /**
   * Helper function to delete a file from AWS S3.
   * Prevents accumulating orphaned files when employees are deleted or updated.
   * 
   * @param filePath - The URL or relative path of the file to delete.
   */
  static deleteFileIfExists(filePath?: string) {
    if (filePath) {
      // Delete from AWS S3
      AWSService.deleteFile(filePath);
    }
  }
}
