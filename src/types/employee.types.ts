import { Document } from 'mongoose';

/**
 * Available departments for an employee.
 */
export enum Department {
  DEVELOPMENT = 'Development',
  QA = 'QA',
  HR = 'HR',
  MARKETING = 'Marketing',
  SALES = 'Sales',
}

/**
 * Interface representing an Employee document in MongoDB.
 */
export interface IEmployee extends Document {
  firstName: string;
  lastName: string;
  /** Unique email address */
  email: string;
  /** Unique mobile number */
  mobile: string;
  dateOfBirth: Date;
  gender: string;
  department: Department;
  skills: string[];
  country: string;
  state: string;
  city: string;
  address: string;
  /** URL or relative File Path to the profile image */
  profileImage: string; 
  /** URL or relative File Path to the resume document */
  resume: string; 
  preferredMode: string[];
  createdAt: Date;
  updatedAt: Date;
}
