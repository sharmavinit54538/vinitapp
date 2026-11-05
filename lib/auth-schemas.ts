import { z } from 'zod';

/**
 * Supported Enterprise Roles
 */
export type Ofc360Role =
  | 'super_admin'
  | 'hr_admin'
  | 'it_admin'
  | 'employee'
  | 'manager'
  | 'executive';

export const OFC360_ROLES: Ofc360Role[] = [
  'hr_admin',
  'it_admin',
  'employee',
  'manager',
  'executive',
  'super_admin',
];

export interface RoleRouteMetadata {
  role: Ofc360Role;
  label: string;
  path: string;
  description: string;
}

export const ROLE_ROUTES: Record<Ofc360Role, RoleRouteMetadata> = {
  hr_admin: {
    role: 'hr_admin',
    label: 'HR Admin Mobile Dashboard',
    path: '/dashboard/hr-admin',
    description: 'Workforce directory, attendance, shifts, rosters, approvals, payroll, and announcements.',
  },
  it_admin: {
    role: 'it_admin',
    label: 'IT Security & Identity Console',
    path: '/dashboard/it-admin',
    description: 'SAML 2.0 SSO, SCIM provisioning, device posture, and audit logs.',
  },
  employee: {
    role: 'employee',
    label: 'Employee Self-Service Portal',
    path: '/dashboard/employee',
    description: 'Personal feedback, time-off requests, payslips, and benefits.',
  },
  manager: {
    role: 'manager',
    label: 'Team & Performance Manager',
    path: '/dashboard/manager',
    description: 'Direct report reviews, leave approvals, and headcount planning.',
  },
  executive: {
    role: 'executive',
    label: 'Executive Analytics',
    path: '/dashboard/executive',
    description: 'Org-wide retention velocity, compensation benchmarks, and board reporting.',
  },
  super_admin: {
    role: 'super_admin',
    label: 'Super Admin Console',
    path: '/dashboard/super-admin',
    description: 'Global tenant governance, enterprise billing, and multi-region policy control.',
  },
};

export function resolveRoleDashboardPath(rawRole?: string | null): string {
  if (!rawRole) return ROLE_ROUTES.employee.path;
  const normalized = rawRole.trim().toLowerCase().replace(/[\s-]+/g, '_') as Ofc360Role;
  if (normalized in ROLE_ROUTES) {
    return ROLE_ROUTES[normalized].path;
  }
  return ROLE_ROUTES.employee.path;
}

/**
 * Supported Country Codes for Mobile OTP & Registration (+1 US Default)
 */
export interface CountryCodeOption {
  code: string;
  country: string;
  label: string;
}

export const COUNTRY_CODES: CountryCodeOption[] = [
  { code: '+1', country: 'US', label: '+1 (US)' },
  { code: '+44', country: 'GB', label: '+44 (UK)' },
  { code: '+91', country: 'IN', label: '+91 (IN)' },
  { code: '+49', country: 'DE', label: '+49 (DE)' },
  { code: '+65', country: 'SG', label: '+65 (SG)' },
  { code: '+61', country: 'AU', label: '+61 (AU)' },
  { code: '+81', country: 'JP', label: '+81 (JP)' },
  { code: '+971', country: 'AE', label: '+971 (AE)' },
  { code: '+33', country: 'FR', label: '+33 (FR)' },
];

export function formatE164Phone(countryCode: string, mobileNumber: string): string {
  const cleanCode = countryCode.trim().startsWith('+')
    ? countryCode.trim()
    : `+${countryCode.trim()}`;
  const digits = mobileNumber.replace(/[^0-9]/g, '');
  return `${cleanCode}${digits}`;
}

/**
 * Password strength evaluation (0 to 4 score)
 */
export interface PasswordStrengthResult {
  score: 0 | 1 | 2 | 3 | 4;
  label: 'Enter password' | 'Weak' | 'Fair' | 'Good' | 'Strong';
  checks: {
    minLength: boolean;
    hasUppercase: boolean;
    hasLowercase: boolean;
    hasNumber: boolean;
    hasSpecial: boolean;
  };
}

export function calculatePasswordStrength(password: string): PasswordStrengthResult {
  const checks = {
    minLength: password.length >= 8,
    hasUppercase: /[A-Z]/.test(password),
    hasLowercase: /[a-z]/.test(password),
    hasNumber: /[0-9]/.test(password),
    hasSpecial: /[^A-Za-z0-9]/.test(password),
  };

  if (!password) {
    return { score: 0, label: 'Enter password', checks };
  }

  const passedCount = Object.values(checks).filter(Boolean).length;
  if (passedCount <= 2) {
    return { score: 1, label: 'Weak', checks };
  }
  if (passedCount === 3) {
    return { score: 2, label: 'Fair', checks };
  }
  if (passedCount === 4) {
    return { score: 3, label: 'Good', checks };
  }
  return { score: 4, label: 'Strong', checks };
}

/**
 * Zod Validation Schemas for AegisAuth Flows
 */
export const emailLoginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Work email address is required')
    .email('Enter a valid work email address'),
  password: z.string().min(1, 'Password is required'),
  remember_me: z.boolean().default(false),
});

export const mobileLoginSchema = z.object({
  country_code: z.string().min(1, 'Country code is required'),
  mobile: z
    .string()
    .trim()
    .regex(/^[0-9\s\-()]{7,15}$/, 'Enter a valid mobile number (7–15 digits)'),
  password: z.string().optional(),
  remember_me: z.boolean().default(false),
});

export const loginSchema = emailLoginSchema;
export type LoginFormValues = z.input<typeof emailLoginSchema>;
export type MobileLoginFormValues = z.input<typeof mobileLoginSchema>;

const mobileDigitsRegex = /^[0-9\s\-()]{7,15}$/;

export const registerSchema = z
  .object({
    full_name: z
      .string()
      .trim()
      .min(2, 'Full name must be at least 2 characters')
      .max(100, 'Full name must be under 100 characters'),
    email: z
      .string()
      .trim()
      .min(1, 'Work email is required')
      .email('Enter a valid work email address'),
    country_code: z.string().default('+1'),
    phone: z
      .string()
      .trim()
      .min(7, 'Mobile number is required')
      .regex(mobileDigitsRegex, 'Enter a valid mobile number'),
    company_name: z.string().trim().optional(),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    accept_terms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must accept the Terms and Conditions',
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type RegisterFormValues = z.input<typeof registerSchema>;

export const workspaceRegisterSchema = z
  .object({
    company_name: z
      .string()
      .trim()
      .min(2, 'Company or organization name is required')
      .max(120, 'Company name must be under 120 characters'),
    first_name: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .max(60, 'First name is too long'),
    last_name: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .max(60, 'Last name is too long'),
    email: z
      .string()
      .trim()
      .min(1, 'Work email is required')
      .email('Enter a valid work email address'),
    phone: z
      .string()
      .trim()
      .min(7, 'Mobile number is required')
      .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid mobile number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your password'),
    accept_terms: z
      .boolean()
      .refine((val) => val === true, {
        message: 'You must agree to the OFC360 Terms of Service and Privacy Policy',
      }),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type WorkspaceRegisterFormValues = z.input<typeof workspaceRegisterSchema>;

/**
 * Pure real-time field validator for Login form inputs
 */
export function validateLoginField(
  field: keyof LoginFormValues,
  value: unknown
): { valid: boolean; error?: string } {
  const fieldSchema = emailLoginSchema.shape[field];
  const result = fieldSchema.safeParse(value);
  if (result.success) {
    return { valid: true };
  }
  return {
    valid: false,
    error: result.error.issues[0]?.message || 'Invalid value',
  };
}

/**
 * Pure real-time field validator for Workspace Registration form inputs
 */
export function validateWorkspaceRegisterField(
  field: keyof WorkspaceRegisterFormValues,
  value: unknown,
  allValues?: Partial<WorkspaceRegisterFormValues>
): { valid: boolean; error?: string } {
  if (field === 'confirm_password') {
    const confirmStr = typeof value === 'string' ? value : '';
    if (!confirmStr) {
      return { valid: false, error: 'Please confirm your password' };
    }
    if (allValues && typeof allValues.password === 'string' && confirmStr !== allValues.password) {
      return { valid: false, error: 'Passwords do not match' };
    }
    return { valid: true };
  }

  const baseShape = {
    company_name: z
      .string()
      .trim()
      .min(2, 'Company or organization name is required')
      .max(120, 'Company name must be under 120 characters'),
    first_name: z
      .string()
      .trim()
      .min(1, 'First name is required')
      .max(60, 'First name is too long'),
    last_name: z
      .string()
      .trim()
      .min(1, 'Last name is required')
      .max(60, 'Last name is too long'),
    email: z
      .string()
      .trim()
      .min(1, 'Work email is required')
      .email('Enter a valid work email address'),
    phone: z
      .string()
      .trim()
      .min(7, 'Mobile number is required')
      .regex(/^\+?[0-9\s\-()]{7,20}$/, 'Enter a valid mobile number'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
      .regex(/[a-z]/, 'Password must include at least one lowercase letter')
      .regex(/[0-9]/, 'Password must include at least one number'),
    accept_terms: z.boolean().refine((val) => val === true, {
      message: 'You must agree to the OFC360 Terms of Service and Privacy Policy',
    }),
  } as const;

  const schemaForField = baseShape[field as keyof typeof baseShape];
  if (!schemaForField) return { valid: true };

  const res = schemaForField.safeParse(value);
  if (res.success) {
    return { valid: true };
  }
  return {
    valid: false,
    error: res.error.issues[0]?.message || 'Invalid input',
  };
}

export const otpSchema = z.object({
  identifier: z.string().trim().min(3, 'Valid email or mobile number is required'),
  otp: z
    .string()
    .trim()
    .regex(/^[0-9]{6}$/, 'Enter all 6 numeric digits of your verification code'),
});

export type OtpFormValues = z.infer<typeof otpSchema>;

export const mfaVerifySchema = z.object({
  mode: z.enum(['totp', 'recovery']),
  code: z.string().trim().min(6, 'Enter a valid 6-digit TOTP or recovery code'),
  trust_device: z.boolean().default(false),
});

export type MfaVerifyFormValues = z.input<typeof mfaVerifySchema>;

export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'Email address is required')
    .email('Enter a valid work email address'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    token: z.string().trim().min(1, 'Reset token is required'),
    new_password: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'Passwords do not match',
    path: ['confirm_password'],
  });

export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;

export const changePasswordSchema = z
  .object({
    current_password: z.string().min(1, 'Current password is required'),
    new_password: z
      .string()
      .min(8, 'New password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must include at least one uppercase letter')
      .regex(/[a-z]/, 'Must include at least one lowercase letter')
      .regex(/[0-9]/, 'Must include at least one number'),
    confirm_password: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: 'New passwords do not match',
    path: ['confirm_password'],
  });

export type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Extracts a clean, user-friendly error message from FastAPI error payloads
 */
export function extractBackendErrorMessage(
  payload: unknown,
  fallbackStatus?: number
): string {
  if (!payload) {
    if (fallbackStatus === 401) return 'Invalid credentials or session expired.';
    if (fallbackStatus === 403) return 'Access denied. Please verify your email or account activation status.';
    if (fallbackStatus === 404) return 'Requested authentication resource was not found.';
    if (fallbackStatus === 422) return 'Validation failed. Please check the highlighted fields.';
    if (fallbackStatus === 429) return 'Too many attempts. Please wait a moment before trying again.';
    return 'Unable to reach the authentication server. Please check your connection and try again.';
  }

  if (typeof payload === 'string') {
    return payload;
  }

  if (typeof payload === 'object') {
    const obj = payload as Record<string, unknown>;

    if (typeof obj.detail === 'string' && obj.detail.trim()) {
      return obj.detail;
    }

    if (Array.isArray(obj.detail) && obj.detail.length > 0) {
      const messages = obj.detail
        .map((item) => {
          if (typeof item === 'string') return item;
          if (item && typeof item === 'object') {
            const errItem = item as { loc?: unknown[]; msg?: string };
            const field = Array.isArray(errItem.loc)
              ? String(errItem.loc[errItem.loc.length - 1] || '')
              : '';
            const cleanField = field && field !== 'body' ? `${field.replace(/_/g, ' ')}: ` : '';
            return errItem.msg ? `${cleanField}${errItem.msg}` : null;
          }
          return null;
        })
        .filter(Boolean);
      if (messages.length > 0) {
        return messages.join(' · ');
      }
    }

    if (typeof obj.message === 'string' && obj.message.trim()) {
      return obj.message;
    }

    if (typeof obj.error === 'string' && obj.error.trim()) {
      return obj.error;
    }
  }

  return 'An unexpected authentication error occurred. Please try again.';
}
