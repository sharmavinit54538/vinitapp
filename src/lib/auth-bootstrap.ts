import { authClient, Ofc360User } from '../../lib/auth-api';

export const ONBOARDING_DRAFT_STORAGE_KEY =
  'ofc360_hr_admin_onboarding_draft_v1';
export const ONBOARDING_COMPLETED_STORAGE_KEY =
  'ofc360_hr_admin_onboarding_completed_v1';

export interface CompanyDetailsStepData {
  // Basic Profile
  companyName: string;
  legalEntityName: string;
  industryCategory: string;
  headcountSize: '1-10' | '11-50' | '51-200' | '201-500' | '500+';
  websiteUrl: string;
  companyLogoDataUrl: string;
  // Contact & Registered Address
  officialEmail: string;
  contactNumber: string;
  streetAddress: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
  // Regional Settings
  timezone: string;
  baseCurrency: string;
  dateFormat: 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD';
  financialYearStartMonth: string;
  // Tax & Compliance Identifiers
  cinNumber: string;
  companyPan: string;
  tanNumber: string;
  gstin: string;
  pfEstablishmentId: string;
  esicNumber: string;
}

export interface HrAdminProfileStepData {
  // Personal Info
  fullName: string;
  officialEmail: string;
  mobileNumber: string;
  profilePhotoDataUrl: string;
  // Job & Role Details
  designation: string;
  employeeCode: string;
  department: string;
  dateOfJoining: string;
  // Access & Emergency Info
  govIdReference: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  systemNotificationsEnabled: boolean;
  emailNotificationsEnabled: boolean;
}

export interface WorkspaceConfigStepData {
  // Department Setup
  departments: string[];
  // Work Schedule & Shifts
  workingDays: 'Mon-Fri' | 'Mon-Sat';
  shiftStartTime: string;
  shiftEndTime: string;
  gracePeriodMinutes: number;
  // Leave & Payroll Defaults
  payrollCycleDate: string;
  probationPeriod: '3 months' | '6 months';
  enableCasualLeave: boolean;
  enableSickLeave: boolean;
  enableEarnedLeave: boolean;
}

export interface HrAdminOnboardingDraft {
  currentStep: number;
  company: CompanyDetailsStepData;
  adminProfile: HrAdminProfileStepData;
  workspaceConfig: WorkspaceConfigStepData;
}

export function getInitialOnboardingDraft(
  authUser?: Ofc360User | null
): HrAdminOnboardingDraft {
  return {
    currentStep: 1,
    company: {
      companyName: authUser?.company_name || '',
      legalEntityName: '',
      industryCategory: 'Information Technology & SaaS',
      headcountSize: '51-200',
      websiteUrl: '',
      companyLogoDataUrl: '',
      officialEmail: authUser?.email || '',
      contactNumber: authUser?.phone || '',
      streetAddress: '',
      city: 'Bengaluru',
      state: 'Karnataka',
      pinCode: '560102',
      country: 'India',
      timezone: 'Asia/Kolkata',
      baseCurrency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      financialYearStartMonth: 'April',
      cinNumber: '',
      companyPan: '',
      tanNumber: '',
      gstin: '',
      pfEstablishmentId: '',
      esicNumber: '',
    },
    adminProfile: {
      fullName: authUser?.full_name || 'Aarav Sharma',
      officialEmail: authUser?.email || 'aarav.sharma@ofc360.com',
      mobileNumber: authUser?.phone || '+91 98201 11223',
      profilePhotoDataUrl: '',
      designation: 'Head of HR / HR Admin',
      employeeCode: 'EMP-001',
      department: 'Human Resources',
      dateOfJoining: '2026-11-01',
      govIdReference: '',
      emergencyContactName: '',
      emergencyContactPhone: '',
      systemNotificationsEnabled: true,
      emailNotificationsEnabled: true,
    },
    workspaceConfig: {
      departments: ['Engineering', 'HR', 'Sales', 'Operations', 'Finance'],
      workingDays: 'Mon-Fri',
      shiftStartTime: '09:30 AM',
      shiftEndTime: '06:30 PM',
      gracePeriodMinutes: 15,
      payrollCycleDate: 'Last Working Day of Month',
      probationPeriod: '6 months',
      enableCasualLeave: true,
      enableSickLeave: true,
      enableEarnedLeave: true,
    },
  };
}

export function loadOnboardingDraft(): HrAdminOnboardingDraft {
  const cachedUser = authClient.getCachedUser();
  const fallback = getInitialOnboardingDraft(cachedUser);
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_DRAFT_STORAGE_KEY);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<HrAdminOnboardingDraft>;
    return {
      currentStep:
        typeof parsed.currentStep === 'number' &&
        parsed.currentStep >= 1 &&
        parsed.currentStep <= 4
          ? parsed.currentStep
          : 1,
      company: { ...fallback.company, ...(parsed.company || {}) },
      adminProfile: {
        ...fallback.adminProfile,
        ...(parsed.adminProfile || {}),
      },
      workspaceConfig: {
        ...fallback.workspaceConfig,
        ...(parsed.workspaceConfig || {}),
      },
    };
  } catch {
    return fallback;
  }
}

export function saveOnboardingDraft(draft: HrAdminOnboardingDraft): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ONBOARDING_DRAFT_STORAGE_KEY,
      JSON.stringify(draft)
    );
  } catch {
    // Ignore storage quota issues
  }
}

export function markOnboardingCompleted(
  draft: HrAdminOnboardingDraft
): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(
      ONBOARDING_COMPLETED_STORAGE_KEY,
      JSON.stringify({
        completed: true,
        completedAt: new Date().toISOString(),
        companyName: draft.company.companyName,
        adminEmail: draft.adminProfile.officialEmail,
      })
    );
    window.localStorage.removeItem(ONBOARDING_DRAFT_STORAGE_KEY);
  } catch {
    // Ignore storage errors
  }
}

export function isOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const raw = window.localStorage.getItem(ONBOARDING_COMPLETED_STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { completed?: boolean };
    return Boolean(parsed.completed);
  } catch {
    return false;
  }
}

export interface StepValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCompanyStep(
  data: CompanyDetailsStepData
): StepValidationResult {
  const errors: Record<string, string> = {};
  if (!data.companyName.trim()) {
    errors.companyName = 'Company Name is required';
  }
  if (!data.officialEmail.trim() || !EMAIL_REGEX.test(data.officialEmail.trim())) {
    errors.officialEmail = 'Valid Official Company Email is required';
  }
  if (!data.contactNumber.trim() || data.contactNumber.trim().length < 7) {
    errors.contactNumber = 'Valid Contact Number is required';
  }
  if (!data.country.trim()) {
    errors.country = 'Country is required';
  }
  if (!data.timezone.trim()) {
    errors.timezone = 'Default Timezone is required';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateAdminProfileStep(
  data: HrAdminProfileStepData
): StepValidationResult {
  const errors: Record<string, string> = {};
  if (!data.fullName.trim()) {
    errors.fullName = 'HR Admin Full Name is required';
  }
  if (!data.officialEmail.trim() || !EMAIL_REGEX.test(data.officialEmail.trim())) {
    errors.officialEmail = 'Valid Official Email is required';
  }
  if (!data.mobileNumber.trim() || data.mobileNumber.trim().length < 7) {
    errors.mobileNumber = 'Valid Mobile Number is required';
  }
  if (!data.employeeCode.trim()) {
    errors.employeeCode = 'Employee ID / Code is required';
  }
  if (!data.designation.trim()) {
    errors.designation = 'Designation is required';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function validateWorkspaceConfigStep(
  data: WorkspaceConfigStepData
): StepValidationResult {
  const errors: Record<string, string> = {};
  if (!data.workingDays) {
    errors.workingDays = 'Working Days selection is required';
  }
  if (!data.departments || data.departments.length === 0) {
    errors.departments = 'At least one department must be selected';
  }
  if (!data.shiftStartTime.trim() || !data.shiftEndTime.trim()) {
    errors.shiftTimes = 'Default Shift Start & End Time are required';
  }
  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}
