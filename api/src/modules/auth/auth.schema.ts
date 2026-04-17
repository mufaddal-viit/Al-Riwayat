import { z } from "zod";

// ─── Shared ───────────────────────────────────────────────────────────────────

/**
 * Reusable password schema with OWASP-aligned complexity rules.
 * Min 8 chars, at least one uppercase, one lowercase, one digit.
 */
const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .max(128, "Password is too long.")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter.")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter.")
  .regex(/[0-9]/, "Password must contain at least one number.");

const emailSchema = z
  .string()
  .email("A valid email address is required.")
  .toLowerCase()
  .trim();

const nameSchema = (field: string) =>
  z
    .string()
    .min(1, `${field} is required.`)
    .max(64, `${field} is too long.`)
    .trim();

// ─── Google sign-in ───────────────────────────────────────────────────────────

export const googleLoginSchema = z.object({
  idToken: z.string().min(10, "Firebase ID token is required."),
});

export type GoogleLoginInput = z.infer<typeof googleLoginSchema>;

// ─── Register ─────────────────────────────────────────────────────────────────

export const registerSchema = z.object({
  firstName: nameSchema("First name"),
  lastName: nameSchema("Last name"),
  email: emailSchema,
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;

// ─── Login ────────────────────────────────────────────────────────────────────

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required."),
});

export type LoginInput = z.infer<typeof loginSchema>;

// ─── Email verification ───────────────────────────────────────────────────────

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required."),
});

export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: emailSchema,
});

export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

// ─── Password reset ───────────────────────────────────────────────────────────

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});

export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, "Reset token is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

// ─── Profile ──────────────────────────────────────────────────────────────────

export const updateProfileSchema = z
  .object({
    firstName: nameSchema("First name").optional(),
    lastName: nameSchema("Last name").optional(),
    avatarUrl: z.string().url("Avatar must be a valid URL.").optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required."),
    newPassword: passwordSchema,
    confirmPassword: z.string().min(1, "Confirm password is required."),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must differ from the current password.",
    path: ["newPassword"],
  });

export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;

// ─── Admin user management ────────────────────────────────────────────────────

export const adminUpdateUserSchema = z
  .object({
    role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
    isActive: z.boolean().optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: "At least one field must be provided.",
  });

export type AdminUpdateUserInput = z.infer<typeof adminUpdateUserSchema>;

export const listUsersQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  role: z.enum(["ADMIN", "CUSTOMER"]).optional(),
  isActive: z.coerce.boolean().optional(),
  search: z.string().trim().optional(),
});

export type ListUsersQuery = z.infer<typeof listUsersQuerySchema>;
