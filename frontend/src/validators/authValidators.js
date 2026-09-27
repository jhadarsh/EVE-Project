import { z } from 'zod';

// Mirrors section 3.1 of the API docs.
export const signupSchema = z.object({
  full_name: z.string().min(2, 'Enter at least 2 characters').max(100, 'Maximum 100 characters'),
  email: z.string().email('Enter a valid email address').max(320),
  phone: z.string().min(7, 'Enter at least 7 digits').max(20, 'Maximum 20 characters'),
  password: z.string().min(8, 'At least 8 characters').max(128, 'Maximum 128 characters'),
});

export const loginSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

// Section 3.3 — token length 4-20, type is one of a fixed set.
export const verifySchema = z.object({
  email: z.string().email('Enter a valid email address'),
  token: z.string().min(4, 'Enter the code you received').max(20, 'Code is too long'),
  type: z.enum(['signup', 'email', 'recovery', 'invite', 'email_change']).default('signup'),
});
