import { z } from 'zod';
import { Department } from '../types/employee.types';
import { MESSAGES } from '../lang/messages';

// Utility to parse JSON strings from form-data if needed
const jsonParsePreprocessor = (val: unknown) => {
  if (typeof val === 'string') {
    try {
      return JSON.parse(val);
    } catch {
      return val;
    }
  }
  return val;
};

// Normalizes single string to array to avoid complex .or() conditions in Zod
const arrayPreprocessor = (val: unknown) => {
  if (val === undefined || val === null) return undefined;
  const parsed = jsonParsePreprocessor(val);
  if (typeof parsed === 'string') return [parsed];
  return parsed;
};

// Zod Schema for Employee Creation/Update
export const employeeValidationSchema = z.object({
  firstName: z.string({ message: MESSAGES.VALIDATION.FIRST_NAME_REQUIRED })
    .min(2, MESSAGES.VALIDATION.FIRST_NAME_MIN)
    .regex(/^[^0-9]*$/, MESSAGES.VALIDATION.FIRST_NAME_NO_NUMBERS),
  lastName: z.string({ message: MESSAGES.VALIDATION.LAST_NAME_REQUIRED })
    .min(2, MESSAGES.VALIDATION.LAST_NAME_MIN)
    .regex(/^[^0-9]*$/, MESSAGES.VALIDATION.LAST_NAME_NO_NUMBERS),
  email: z.string({ message: MESSAGES.VALIDATION.EMAIL_REQUIRED })
    .email(MESSAGES.VALIDATION.EMAIL_INVALID),
  mobile: z.string({ message: MESSAGES.VALIDATION.MOBILE_REQUIRED })
    .regex(/^\d+$/, MESSAGES.VALIDATION.MOBILE_ONLY_NUMBERS)
    .length(10, MESSAGES.VALIDATION.MOBILE_LENGTH),
  dateOfBirth: z.preprocess((arg) => {
    if (typeof arg == 'string' || arg instanceof Date) return new Date(arg);
  }, z.date({ message: MESSAGES.VALIDATION.DOB_REQUIRED })),
  gender: z.string({ message: MESSAGES.VALIDATION.GENDER_REQUIRED }).min(1, MESSAGES.VALIDATION.GENDER_REQUIRED),
  department: z.nativeEnum(Department, { message: MESSAGES.VALIDATION.DEPARTMENT_REQUIRED }),
  skills: z.preprocess(
    arrayPreprocessor,
    z.array(z.string(), { message: MESSAGES.VALIDATION.SKILLS_MIN }).min(1, MESSAGES.VALIDATION.SKILLS_MIN)
  ),
  country: z.string({ message: MESSAGES.VALIDATION.COUNTRY_REQUIRED }).min(1, MESSAGES.VALIDATION.COUNTRY_REQUIRED),
  state: z.string({ message: MESSAGES.VALIDATION.STATE_REQUIRED }).min(1, MESSAGES.VALIDATION.STATE_REQUIRED),
  city: z.string({ message: MESSAGES.VALIDATION.CITY_REQUIRED }).min(1, MESSAGES.VALIDATION.CITY_REQUIRED),
  address: z.string({ message: MESSAGES.VALIDATION.ADDRESS_REQUIRED }).min(5, MESSAGES.VALIDATION.ADDRESS_MIN),
  preferredMode: z.preprocess(
    arrayPreprocessor,
    z.array(z.string(), { message: MESSAGES.VALIDATION.PREFERRED_MODE_MIN }).min(1, MESSAGES.VALIDATION.PREFERRED_MODE_MIN)
  ),
});

