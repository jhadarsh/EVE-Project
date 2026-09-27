import { z } from "zod";

export const signupSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(8).max(128),
  full_name: z.string().min(2).max(100),
  phone: z.string().min(7).max(20),
});
export const loginSchema = z.object({
  email: z.string().email().max(320),
  password: z.string().min(1).max(128),
});
export const verifySchema = z.object({
  email: z.string().email().max(320),
  token: z.string().min(4).max(20),
  type: z.enum(["signup","email","recovery","invite","email_change"]).optional(),
});
export const bookingSchema = z.object({
  patient_name: z.string().min(2).max(150),
  patient_dob: z.string().optional(),
  patient_phone: z.string().min(7).max(20),
  patient_email: z.string().email().max(320),
});