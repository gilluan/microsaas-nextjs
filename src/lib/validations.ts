import { z } from 'zod'

/**
 * User Profile Validation Schema
 * Validates user profile information for updates
 */
export const UserProfileSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim(),
  email: z.string()
    .email('Invalid email address')
    .transform(val => val.toLowerCase()),
  avatar: z.string().url().optional()
})

/**
 * Password Validation Schema
 * Enforces strong password requirements
 */
export const PasswordSchema = z.string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number')

/**
 * User Registration Schema
 * Validates new user registration with password confirmation
 */
export const UserRegistrationSchema = UserProfileSchema.extend({
  password: PasswordSchema,
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

/**
 * Activity Type Schema
 * Validates activity type enum values
 */
export const ActivityTypeSchema = z.enum([
  'LOGIN',
  'PROFILE_UPDATE',
  'AVATAR_UPLOAD',
  'PASSWORD_CHANGE',
  'EMAIL_VERIFICATION'
])

/**
 * User Activity Schema
 * Validates user activity creation data
 */
export const UserActivitySchema = z.object({
  activityType: ActivityTypeSchema,
  description: z.string().min(1).max(200),
  metadata: z.record(z.string(), z.unknown()).optional()
})

/**
 * Update User Profile Input Schema
 * Partial schema for profile updates (all fields optional)
 */
export const UpdateUserProfileInputSchema = z.object({
  name: z.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name must be less than 50 characters')
    .trim()
    .optional(),
  email: z.string()
    .email('Invalid email address')
    .transform(val => val.toLowerCase())
    .optional()
})

/**
 * Email Verification Schema
 */
export const VerifyEmailInputSchema = z.object({
  email: z.string().email('Invalid email address'),
  verificationCode: z.string().min(6, 'Verification code must be at least 6 characters')
})

/**
 * Password Reset Schemas
 */
export const RequestPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address')
})

export const ConfirmPasswordResetSchema = z.object({
  email: z.string().email('Invalid email address'),
  confirmationCode: z.string().min(6, 'Confirmation code must be at least 6 characters'),
  newPassword: PasswordSchema
})

/**
 * Change Password Schema
 */
export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: PasswordSchema
})

/**
 * Avatar Upload Schema
 */
export const AvatarUploadSchema = z.object({
  contentType: z.string().regex(/^image\/(jpeg|png|gif|webp)$/, 'Invalid content type. Must be JPEG, PNG, GIF, or WebP'),
  fileName: z.string().min(1, 'File name is required').max(100, 'File name too long')
})

/**
 * Confirm Avatar Upload Schema
 */
export const ConfirmAvatarUploadSchema = z.object({
  s3Key: z.string().min(1, 'S3 key is required')
})

/**
 * Create User Activity Input Schema
 */
export const CreateUserActivityInputSchema = z.object({
  activityType: ActivityTypeSchema,
  description: z.string().min(1, 'Description is required').max(200, 'Description too long'),
  metadata: z.record(z.string(), z.unknown()).optional()
})

/**
 * List User Activities Input Schema
 */
export const ListUserActivitiesInputSchema = z.object({
  limit: z.number().int().min(1).max(100).optional().default(10),
  nextToken: z.string().optional()
})

// Export type definitions for TypeScript usage
export type UserProfile = z.infer<typeof UserProfileSchema>
export type Password = z.infer<typeof PasswordSchema>
export type UserRegistration = z.infer<typeof UserRegistrationSchema>
export type ActivityType = z.infer<typeof ActivityTypeSchema>
export type UserActivity = z.infer<typeof UserActivitySchema>
export type UpdateUserProfileInput = z.infer<typeof UpdateUserProfileInputSchema>
export type VerifyEmailInput = z.infer<typeof VerifyEmailInputSchema>
export type RequestPasswordReset = z.infer<typeof RequestPasswordResetSchema>
export type ConfirmPasswordReset = z.infer<typeof ConfirmPasswordResetSchema>
export type ChangePassword = z.infer<typeof ChangePasswordSchema>
export type AvatarUpload = z.infer<typeof AvatarUploadSchema>
export type ConfirmAvatarUpload = z.infer<typeof ConfirmAvatarUploadSchema>
export type CreateUserActivityInput = z.infer<typeof CreateUserActivityInputSchema>
export type ListUserActivitiesInput = z.infer<typeof ListUserActivitiesInputSchema>