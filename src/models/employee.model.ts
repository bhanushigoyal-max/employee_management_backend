import mongoose, { Schema } from 'mongoose';
import { IEmployee, Department } from '../types/employee.types';
import { MESSAGES } from '../lang/messages';

/**
 * Mongoose schema for the Employee collection.
 * Defines the structure, validation rules, and default values for employee documents.
 */
const employeeSchema = new Schema<IEmployee>(
  {
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    mobile: { type: String, required: true, unique: true },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, required: true },
    department: {
      type: String,
      enum: Object.values(Department),
      required: true,
    },
    skills: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => val.length > 0,
        MESSAGES.VALIDATION.SKILLS_MIN,
      ],
    },
    country: { type: String, required: true },
    state: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    profileImage: { type: String, required: false }, // Optional, could be an empty string initially
    resume: { type: String, required: true },
    preferredMode: {
      type: [String],
      required: true,
      validate: [
        (val: string[]) => val.length > 0,
        MESSAGES.VALIDATION.PREFERRED_MODE_MIN,
      ],
    },
  },
  { timestamps: true }
);

/**
 * Mongoose model for Employee.
 * Provides an interface to interact with the 'employees' collection in the database.
 */
export const EmployeeModel = mongoose.model<IEmployee>('Employee', employeeSchema);
