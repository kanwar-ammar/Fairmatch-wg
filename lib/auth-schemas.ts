import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Please provide a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const signupSchema = z.object({
  fullName: z.string().min(2, "Please provide your full name."),
  location: z.string().min(1, "Please select your location."),
  email: z.string().email("Please provide a valid email."),
  password: z.string().min(8, "Password must be at least 8 characters."),
});

export const updateActiveRoleSchema = z.object({
  userId: z.string().min(1),
  activeRole: z.enum(["STUDENT", "RESIDENT"]),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
