import { z } from "zod";

// Mirrors section 6.1 of the API docs (patient_* fields on POST /api/bookings).
export const patientInfoSchema = z.object({
  patient_name: z
    .string()
    .min(2, "Enter at least 2 characters")
    .max(150, "Maximum 150 characters"),
  patient_dob: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Use format YYYY-MM-DD")
    .optional()
    .or(z.literal("")),
  patient_phone: z
    .string()
    .min(7, "Enter at least 7 digits")
    .max(20, "Maximum 20 characters"),
  patient_email: z.string().email("Enter a valid email address").max(320),
});

export const cancelBookingSchema = z.object({
  reason: z
    .string()
    .max(500, "Maximum 500 characters")
    .optional()
    .or(z.literal("")),
});
