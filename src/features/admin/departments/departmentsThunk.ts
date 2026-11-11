import { createAsyncThunk } from '@reduxjs/toolkit';
import { API_BASE_URL, authClient } from '@/lib/auth-api';

export type DepartmentColorTheme =
  | 'indigo'
  | 'emerald'
  | 'amber'
  | 'rose'
  | 'violet'
  | 'sky';

export type DepartmentIconKey =
  | 'Code2'
  | 'Users'
  | 'Briefcase'
  | 'Wallet'
  | 'Cpu'
  | 'ShieldCheck';

export interface AdminDepartmentRecord {
  id: string;
  name: string;
  code: string;
  parentDepartmentId: string | null;
  parentDepartmentName: string | null;
  managerName: string;
  description: string;
  budget: number;
  headcountLimit: number;
  activeHeadcount: number;
  colorTheme: DepartmentColorTheme;
  iconKey: DepartmentIconKey;
  createdAt: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  parentDepartmentId?: string | null;
  parentDepartmentName?: string | null;
  managerName: string;
  description: string;
  budget?: number;
  headcountLimit?: number;
  colorTheme: DepartmentColorTheme;
  iconKey: DepartmentIconKey;
}

export const fetchDepartmentsThunk = createAsyncThunk<AdminDepartmentRecord[]>(
  'adminDepartments/fetchAll',
  async () => {
    const token = authClient.getAccessToken();
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(`${API_BASE_URL}/api/v1/hr/admin-departments`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      throw new Error(`Failed to fetch departments (${res.status})`);
    }
    const data = (await res.json()) as { items?: AdminDepartmentRecord[] };
    return Array.isArray(data.items) ? data.items : [];
  }
);

export const createDepartmentThunk = createAsyncThunk<
  AdminDepartmentRecord,
  CreateDepartmentPayload
>('adminDepartments/createOne', async (payload) => {
  const token = authClient.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_BASE_URL}/api/v1/hr/admin-departments`, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const errBody = (await res.json().catch(() => ({}))) as {
      message?: string;
    };
    throw new Error(
      errBody.message || `Failed to create department (${res.status})`
    );
  }
  const data = (await res.json()) as { department: AdminDepartmentRecord };
  return data.department;
});

export const bulkImportDepartmentsThunk = createAsyncThunk<
  AdminDepartmentRecord[],
  CreateDepartmentPayload[]
>('adminDepartments/bulkImport', async (rows) => {
  const token = authClient.getAccessToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(
    `${API_BASE_URL}/api/v1/hr/admin-departments/bulk-import`,
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
      errBody.message || `Bulk department import failed (${res.status})`
    );
  }
  const data = (await res.json()) as { items: AdminDepartmentRecord[] };
  return Array.isArray(data.items) ? data.items : [];
});

/**
 * Pure helper to parse CSV text into CreateDepartmentPayload rows
 */
export function parseDepartmentsCsv(csvText: string): {
  validRows: CreateDepartmentPayload[];
  errors: string[];
} {
  const lines = csvText
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);
  if (lines.length === 0) {
    return { validRows: [], errors: ['CSV file is empty.'] };
  }

  const startIdx = lines[0].toLowerCase().includes('name') ? 1 : 0;
  const validRows: CreateDepartmentPayload[] = [];
  const errors: string[] = [];
  const seenCodes = new Set<string>();

  for (let i = startIdx; i < lines.length; i++) {
    const cols = lines[i].split(',').map((c) => c.trim());
    const name = cols[0] || '';
    const code = (cols[1] || '').toUpperCase();
    const parentDepartmentName = cols[2] || null;
    const managerName = cols[3] || 'Aarav Sharma';
    const budget = Number(cols[4]) || 250000;
    const headcountLimit = Number(cols[5]) || 25;
    const description =
      cols[6] || `${name} core delivery & operations unit`;

    if (!name || !code) {
      errors.push(`Row ${i + 1}: Missing required Department Name or Code.`);
      continue;
    }
    if (seenCodes.has(code)) {
      errors.push(`Row ${i + 1}: Duplicate Department Code "${code}" in CSV.`);
      continue;
    }
    seenCodes.add(code);

    validRows.push({
      name,
      code,
      parentDepartmentId: null,
      parentDepartmentName: parentDepartmentName || null,
      managerName,
      description,
      budget,
      headcountLimit,
      colorTheme: 'indigo',
      iconKey: 'Briefcase',
    });
  }

  return { validRows, errors };
}
