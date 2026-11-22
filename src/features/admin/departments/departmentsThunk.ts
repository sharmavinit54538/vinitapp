import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  getAdminDepartmentsStore,
  setAdminDepartmentsStore,
} from '@/lib/admin-workforce-store';

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
    return [...getAdminDepartmentsStore()];
  }
);

export const createDepartmentThunk = createAsyncThunk<
  AdminDepartmentRecord,
  CreateDepartmentPayload
>('adminDepartments/createOne', async (payload) => {
  const current = getAdminDepartmentsStore();
  const created: AdminDepartmentRecord = {
    id: `dept-${Date.now()}`,
    name: payload.name.trim(),
    code: payload.code.trim().toUpperCase(),
    parentDepartmentId: payload.parentDepartmentId || null,
    parentDepartmentName: payload.parentDepartmentName || null,
    managerName: payload.managerName.trim() || 'Aarav Sharma',
    description:
      payload.description.trim() ||
      `${payload.name} core delivery & operations unit`,
    budget: Number(payload.budget) || 250000,
    headcountLimit: Number(payload.headcountLimit) || 25,
    activeHeadcount: 1,
    colorTheme: payload.colorTheme || 'indigo',
    iconKey: payload.iconKey || 'Briefcase',
    createdAt: new Date().toISOString().slice(0, 10),
  };
  setAdminDepartmentsStore([created, ...current]);
  return created;
});

export const bulkImportDepartmentsThunk = createAsyncThunk<
  AdminDepartmentRecord[],
  CreateDepartmentPayload[]
>('adminDepartments/bulkImport', async (rows) => {
  const current = getAdminDepartmentsStore();
  const added: AdminDepartmentRecord[] = rows.map((row, idx) => ({
    id: `dept-${Date.now()}-${idx}`,
    name: row.name.trim(),
    code: row.code.trim().toUpperCase(),
    parentDepartmentId: row.parentDepartmentId || null,
    parentDepartmentName: row.parentDepartmentName || null,
    managerName: row.managerName.trim() || 'Aarav Sharma',
    description:
      row.description.trim() || `${row.name} core delivery & operations unit`,
    budget: Number(row.budget) || 250000,
    headcountLimit: Number(row.headcountLimit) || 25,
    activeHeadcount: 1,
    colorTheme: row.colorTheme || 'indigo',
    iconKey: row.iconKey || 'Briefcase',
    createdAt: new Date().toISOString().slice(0, 10),
  }));
  setAdminDepartmentsStore([...added, ...current]);
  return added;
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
