import { z } from 'zod';

// Section 4.5 — POST /api/centres
export const centreSchema = z.object({
  name: z.string().min(2, 'Enter at least 2 characters').max(150, 'Maximum 150 characters'),
  location: z.string().min(2, 'Enter at least 2 characters').max(150, 'Maximum 150 characters'),
  address: z.string().min(5, 'Enter at least 5 characters').max(500, 'Maximum 500 characters'),
  description: z.string().max(2000, 'Maximum 2000 characters').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});

// Section 5.3 — POST /api/tests
export const testSchema = z.object({
  name: z.string().min(2, 'Enter at least 2 characters').max(150, 'Maximum 150 characters'),
  description: z.string().max(2000, 'Maximum 2000 characters').optional().or(z.literal('')),
  information: z.string().max(5000, 'Maximum 5000 characters').optional().or(z.literal('')),
  is_active: z.boolean().optional(),
});
