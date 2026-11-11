import { createAsyncThunk } from '@reduxjs/toolkit';
import { z } from 'zod';
import { API_BASE_URL, authClient } from '@/lib/auth-api';

export type EmployeeSystemRole =
  | 'Employee'
  | 'Manager'
  | 'Executive'
  | 'IT-Admin';

export type EmploymentTypeOption =
  | 'Full-time'
  | 'Part-time'
  | 'Contract'
  | 'Intern';

export type WorkModeOption = 'Office' | 'Remote' | 'Hybrid';

export type GenderOption =
  | 'Male'
  | 'Female'
  | 'Non-Binary'
  | 'Prefer not to say';

export const adminEmployeeFormSchema = z.object({
  // 1. Personal Details
  firstName: z.string().trim().min(2, 'First Name is required'),
  lastName: z.string().trim().min(1, 'Last Name is required'),
  officialEmail: z.string().trim().email('Valid Official Email is required'),
  personalEmail: z
    .string()
    .trim()
    .email('Valid Personal Email is required')
    .optional()
    .or(z.literal('')),
  mobileNumber: z.string().trim().min(7, 'Valid Mobile Number is required'),
  gender: z.enum(['Male', 'Female', 'Non-Binary', 'Prefer not to say']),
  dateOfBirth: z.string().trim().min(4, 'Date of Birth is required'),

  // 2. Job & Organization
  employeeCode: z.string().trim().min(3, 'Employee ID / Code is required'),
  department: z.string().trim().min(2, 'Department is required'),
  designation: z.string().trim().min(2, 'Designation is required'),
  reportingManager: z.string().trim().min(2, 'Reporting Manager is required'),
  dateOfJoining: z.string().trim().min(4, 'Date of Joining is required'),

  // 3. Employment Classification
  employmentType: z.enum(['Full-time', 'Part-time', 'Contract', 'Intern']),
  workMode: z.enum(['Office', 'Remote', 'Hybrid']),
  probationPeriod: z.enum(['3 months', '6 months']),

  // 4. Compensation & Access
  ctcStructure: z
    .string()
    .trim()
    .min(2, 'Initial CTC / Salary Structure is required'),
  defaultShift: z.string().trim().min(2, 'Default Shift is required'),
  systemRole: z.enum(['Employee', 'Manager', 'Executive', 'IT-Admin']),
  sendOnboardingInvite: z.boolean(),
});

export type AdminEmployeeFormValues = z.infer<typeof adminEmployeeFormSchema>;

export type EmployeeOnboardingStatus =
  | 'ACTIVE'
  | 'PENDING'
  | 'INVITED'
  | 'EXPIRED'
  | 'DISABLED';

export function normalizeEmployeeStatus(
  raw?: string
): EmployeeOnboardingStatus {
  const upper = String(raw || '')
    .trim()
    .toUpperCase();
  if (upper === 'ACTIVE') return 'ACTIVE';
  if (upper === 'PENDING' || upper === 'PROBATION') return 'PENDING';
  if (
    upper === 'INVITED' ||
    upper === 'ONBOARDING INVITE SENT' ||
    upper === 'INVITE SENT'
  ) {
    return 'INVITED';
  }
  if (upper === 'EXPIRED') return 'EXPIRED';
  if (upper === 'DISABLED' || upper === 'INACTIVE') return 'DISABLED';
  return 'ACTIVE';
}

export interface AdminEmployeeRecord extends AdminEmployeeFormValues {
  id: string;
  fullName: string;
  status: EmployeeOnboardingStatus;
  createdAt: string;
}

export const fetchAdminEmployeesThunk = createAsyncThunk<AdminEmployeeRecord[]>(
  'adminEmployees/fetchAll',
  async () => {
    const token = authClient.getAccessToken();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/api/v1/hr/admin-employees`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch employees (${res.status})`);
    }
    const data = (await res.json()) as { items?: AdminEmployeeRecord[] };
    return Array.isArray(data.items) ? data.items : [];
  }
);

export const createAdminEmployeeThunk = createAsyncThunk<
  AdminEmployeeRecord,
  AdminEmployeeFormValues
>('adminEmployees/createOne', async (payload) => {
  const token = authClient.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/v1/hr/admin-employees`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      errBody.message || `Failed to create employee (${res.status})`
    );
  }
  const data = (await res.json()) as { employee: AdminEmployeeRecord };
  return data.employee;
});

export const bulkImportAdminEmployeesThunk = createAsyncThunk<
  AdminEmployeeRecord[],
  AdminEmployeeFormValues[]
>('adminEmployees/bulkImport', async (rows) => {
  const token = authClient.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `${API_BASE_URL}/api/v1/hr/admin-employees/bulk-import`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({ items: rows }),
    }
  );
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      errBody.message || `Bulk employee import failed (${res.status})`
    );
  }
  const data = (await res.json()) as { items: AdminEmployeeRecord[] };
  return Array.isArray(data.items) ? data.items : [];
});

export function parseEmployeesCsv(csvText: string): {
  validRows: AdminEmployeeFormValues[];
  errors: string[];
} {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return { validRows: [], errors: ['CSV file is empty.'] };
  }

  const startIdx = lines[0].toLowerCase().includes('firstname') ? 1 : 0;
  const validRows: AdminEmployeeFormValues[] = [];
  const errors: string[] = [];

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const firstName = cols[0] || '';
    const lastName = cols[1] || '';
    const officialEmail = cols[2] || '';
    const mobileNumber = cols[3] || '+91 98201 11223';
    const employeeCode = cols[4] || `EMP-${3700 + i}`;
    const department = cols[5] || 'Engineering';
    const designation = cols[6] || 'Software Engineer';
    const rawRole = (cols[7] || 'Employee') as EmployeeSystemRole;
    const systemRole: EmployeeSystemRole = [
      'Employee',
      'Manager',
      'Executive',
      'IT-Admin',
    ].includes(rawRole)
      ? rawRole
      : 'Employee';

    const candidate: AdminEmployeeFormValues = {
      firstName,
      lastName,
      officialEmail,
      mobileNumber,
      gender: 'Prefer not to say',
      dateOfBirth: '1996-05-15',
      employeeCode,
      department,
      designation,
      reportingManager: 'Aarav Sharma',
      dateOfJoining: '2026-11-09',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      probationPeriod: '6 months',
      ctcStructure: 'Standard Tech Band A (₹12L – ₹18L)',
      defaultShift: 'General Shift (09:30 - 18:30)',
      systemRole,
      sendOnboardingInvite: true,
    };

    const parsed = adminEmployeeFormSchema.safeParse(candidate);
    if (!parsed.success) {
      errors.push(
        `Row ${i + 1}: ${parsed.error.issues[0]?.message || 'Invalid employee data'}`
      );
      continue;
    }
    validRows.push(parsed.data);
  }

  return { validRows, errors };
}
