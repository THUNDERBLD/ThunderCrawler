// lib/validations.ts
import { z } from "zod"

/**
 * Authentication Schemas
 */
export const signupSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters"),
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
})

export const signinSchema = z.object({
  email: z
    .string()
    .email("Invalid email address")
    .toLowerCase(),
  password: z
    .string()
    .min(1, "Password is required"),
})

/**
 * Job Filter Schema
 */
export const jobFilterSchema = z.object({
  search: z.string().optional(),
  source: z.enum(["yc", "wellfound", "internshala", "linkedin", "indeed"]).optional(),
  remote: z.boolean().optional(),
  jobType: z.enum(["full-time", "part-time", "contract", "internship"]).optional(),
  experience: z.enum(["junior", "mid", "senior"]).optional(),
  skills: z.array(z.string()).optional(),
})

/**
 * Application Schema
 */
export const createApplicationSchema = z.object({
  jobId: z.string().cuid(),
  status: z.enum(["saved", "applied", "interviewing", "rejected", "accepted"]),
  notes: z.string().max(1000).optional(),
  resumeId: z.string().cuid().optional(),
})

export const updateApplicationSchema = z.object({
  status: z.enum(["saved", "applied", "interviewing", "rejected", "accepted"]).optional(),
  notes: z.string().max(1000).optional(),
})

/**
 * Resume Schema
 */
export const createResumeSchema = z.object({
  name: z
    .string()
    .min(1, "Resume name is required")
    .max(100, "Name must be less than 100 characters"),
  content: z.string().min(10, "Resume content is required"),
  isBase: z.boolean().default(false),
})

export const updateResumeSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  content: z.string().min(10).optional(),
  isBase: z.boolean().optional(),
})

/**
 * User Settings Schema
 */
export const updateUserSchema = z.object({
  name: z.string().min(2).max(50).optional(),
  email: z.string().email().toLowerCase().optional(),
  image: z.string().url().optional(),
})

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z
    .string()
    .min(8, "New password must be at least 8 characters")
    .max(100, "Password must be less than 100 characters"),
  confirmPassword: z.string().min(1, "Please confirm your password"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

/**
 * Scraper Configuration Schema
 */
export const scraperConfigSchema = z.object({
  source: z.enum(["yc", "wellfound", "internshala", "linkedin", "indeed"]),
  enabled: z.boolean(),
  rateLimit: z.number().min(100).max(10000), // milliseconds between requests
  maxPages: z.number().min(1).max(100).optional(),
})

/**
 * Type Inference
 * Use these types throughout your app
 */
export type SignupInput = z.infer<typeof signupSchema>
export type SigninInput = z.infer<typeof signinSchema>
export type JobFilterInput = z.infer<typeof jobFilterSchema>
export type CreateApplicationInput = z.infer<typeof createApplicationSchema>
export type UpdateApplicationInput = z.infer<typeof updateApplicationSchema>
export type CreateResumeInput = z.infer<typeof createResumeSchema>
export type UpdateResumeInput = z.infer<typeof updateResumeSchema>
export type UpdateUserInput = z.infer<typeof updateUserSchema>
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>
export type ScraperConfigInput = z.infer<typeof scraperConfigSchema>


export function validateResumeFile(
  file: File,
  maxSizeMB: number = 5
): { valid: boolean; error?: string } {
  const allowedTypes = [
    "application/pdf",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/msword",
  ];

  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: "Please upload a PDF or DOCX file",
    };
  }

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  if (file.size > maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${maxSizeMB}MB`,
    };
  }

  if (!file.name || file.name.length < 3) {
    return {
      valid: false,
      error: "Invalid file name",
    };
  }

  return { valid: true };
}