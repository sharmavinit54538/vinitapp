import { NextRequest, NextResponse } from 'next/server';
import {
  AdminDepartmentRecord,
  CreateDepartmentPayload,
} from '@/src/features/admin/departments/departmentsThunk';
import {
  getAdminDepartmentsStore,
  setAdminDepartmentsStore,
} from '@/lib/admin-workforce-store';

export async function GET() {
  const items = getAdminDepartmentsStore();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const items = getAdminDepartmentsStore();
  let body: Partial<CreateDepartmentPayload> = {};
  try {
    body = (await req.json()) as Partial<CreateDepartmentPayload>;
  } catch {
    body = {};
  }

  const name = String(body.name || '').trim();
  const code = String(body.code || '').trim().toUpperCase();
  if (!name || !code) {
    return NextResponse.json(
      { message: 'Department Name and Code are required.' },
      { status: 400 }
    );
  }

  if (items.some((d) => d.code.toUpperCase() === code)) {
    return NextResponse.json(
      { message: `Department code "${code}" already exists.` },
      { status: 409 }
    );
  }

  const parentDept = body.parentDepartmentId
    ? items.find((d) => d.id === body.parentDepartmentId)
    : null;

  const newDept: AdminDepartmentRecord = {
    id: `DEPT-${code}-${Date.now()}`,
    name,
    code,
    parentDepartmentId: parentDept ? parentDept.id : null,
    parentDepartmentName:
      parentDept?.name || body.parentDepartmentName || null,
    managerName: String(body.managerName || 'Aarav Sharma').trim(),
    description: String(
      body.description || `${name} core delivery & operations unit.`
    ).trim(),
    budget: Math.max(0, Number(body.budget) || 250000),
    headcountLimit: Math.max(1, Number(body.headcountLimit) || 25),
    activeHeadcount: 1,
    colorTheme: body.colorTheme || 'indigo',
    iconKey: body.iconKey || 'Briefcase',
    createdAt: new Date().toISOString().slice(0, 10),
  };

  setAdminDepartmentsStore([newDept, ...items]);
  return NextResponse.json({
    message: `Department "${newDept.name}" (${newDept.code}) created.`,
    department: newDept,
  });
}
