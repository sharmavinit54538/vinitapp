import { NextRequest, NextResponse } from 'next/server';
import {
  AdminDepartmentRecord,
  CreateDepartmentPayload,
} from '@/src/features/admin/departments/departmentsThunk';
import { getAdminDepartmentsStore } from '@/lib/admin-workforce-store';

export async function POST(req: NextRequest) {
  const existing = getAdminDepartmentsStore();
  let body: { items?: CreateDepartmentPayload[] } = {};
  try {
    body = (await req.json()) as { items?: CreateDepartmentPayload[] };
  } catch {
    body = {};
  }

  const incoming = Array.isArray(body.items) ? body.items : [];
  const created: AdminDepartmentRecord[] = [];

  for (const row of incoming) {
    const code = String(row.code || '').trim().toUpperCase();
    const name = String(row.name || '').trim();
    if (!name || !code) continue;
    if (
      existing.some((d) => d.code.toUpperCase() === code) ||
      created.some((d) => d.code.toUpperCase() === code)
    ) {
      continue;
    }

    created.push({
      id: `DEPT-${code}-${Date.now()}-${created.length}`,
      name,
      code,
      parentDepartmentId: row.parentDepartmentId || null,
      parentDepartmentName: row.parentDepartmentName || null,
      managerName: row.managerName || 'Aarav Sharma',
      description: row.description || `${name} department`,
      budget: Number(row.budget) || 250000,
      headcountLimit: Number(row.headcountLimit) || 25,
      activeHeadcount: 1,
      colorTheme: row.colorTheme || 'indigo',
      iconKey: row.iconKey || 'Briefcase',
      createdAt: new Date().toISOString().slice(0, 10),
    });
  }

  existing.unshift(...created);
  return NextResponse.json({
    message: `Imported ${created.length} departments.`,
    items: created,
  });
}
