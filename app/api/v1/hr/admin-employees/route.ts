import { NextRequest, NextResponse } from 'next/server';
import {
  AdminEmployeeFormValues,
  AdminEmployeeRecord,
} from '@/src/features/admin/employees/employeesThunk';
import {
  getAdminEmployeesStore,
  setAdminEmployeesStore,
} from '@/lib/admin-workforce-store';

export async function GET() {
  const items = getAdminEmployeesStore();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const items = getAdminEmployeesStore();
  let body: Partial<AdminEmployeeFormValues> = {};
  try {
    body = (await req.json()) as Partial<AdminEmployeeFormValues>;
  } catch {
    body = {};
  }

  const firstName = String(body.firstName || '').trim();
  const lastName = String(body.lastName || '').trim();
  const officialEmail = String(body.officialEmail || '').trim();

  if (!firstName || !officialEmail) {
    return NextResponse.json(
      { message: 'First Name and Official Email are required.' },
      { status: 400 }
    );
  }

  const fullName = `${firstName} ${lastName}`.trim();
  const employeeCode =
    String(body.employeeCode || '').trim() || `EMP-${3650 + items.length + 1}`;

  const newEmp: AdminEmployeeRecord = {
    id: `EMP-REC-${Date.now()}`,
    firstName,
    lastName,
    fullName,
    officialEmail,
    personalEmail: String(body.personalEmail || '').trim(),
    mobileNumber: String(body.mobileNumber || '+91 98201 11223'),
    gender: body.gender || 'Prefer not to say',
    dateOfBirth: String(body.dateOfBirth || '1996-05-15'),
    employeeCode,
    department: String(body.department || 'Engineering'),
    designation: String(body.designation || 'Software Engineer'),
    reportingManager: String(body.reportingManager || 'Aarav Sharma'),
    dateOfJoining: String(body.dateOfJoining || '2026-11-09'),
    employmentType: body.employmentType || 'Full-time',
    workMode: body.workMode || 'Hybrid',
    probationPeriod: body.probationPeriod || '6 months',
    ctcStructure: String(
      body.ctcStructure || 'Standard Tech Band A (₹12L – ₹18L)'
    ),
    defaultShift: String(body.defaultShift || 'General Shift (09:30 - 18:30)'),
    systemRole: body.systemRole || 'Employee',
    sendOnboardingInvite: Boolean(body.sendOnboardingInvite ?? true),
    status: body.sendOnboardingInvite ? 'INVITED' : 'ACTIVE',
    createdAt: new Date().toISOString().slice(0, 10),
  };

  setAdminEmployeesStore([newEmp, ...items]);
  return NextResponse.json({
    message: `${fullName} (${employeeCode}) created.`,
    employee: newEmp,
  });
}

export async function PATCH(req: NextRequest) {
  const items = getAdminEmployeesStore();
  let body: { id?: string; changes?: Partial<AdminEmployeeRecord> } = {};
  try {
    body = (await req.json()) as {
      id?: string;
      changes?: Partial<AdminEmployeeRecord>;
    };
  } catch {
    body = {};
  }

  const targetId = String(body.id || '').trim();
  if (!targetId || !body.changes) {
    return NextResponse.json(
      { message: 'Employee id and changes are required.' },
      { status: 400 }
    );
  }

  let updatedEmp: AdminEmployeeRecord | null = null;
  const nextItems = items.map((emp) => {
    if (emp.id !== targetId) return emp;
    const firstName =
      body.changes?.firstName !== undefined
        ? body.changes.firstName
        : emp.firstName;
    const lastName =
      body.changes?.lastName !== undefined
        ? body.changes.lastName
        : emp.lastName;
    updatedEmp = {
      ...emp,
      ...body.changes,
      firstName,
      lastName,
      fullName: `${firstName} ${lastName}`.trim() || emp.fullName,
    };
    return updatedEmp;
  });

  setAdminEmployeesStore(nextItems);
  return NextResponse.json({
    message: 'Employee updated.',
    employee: updatedEmp,
  });
}

export async function DELETE(req: NextRequest) {
  const items = getAdminEmployeesStore();
  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id') || '';
  if (!id) {
    return NextResponse.json(
      { message: 'Employee id is required.' },
      { status: 400 }
    );
  }

  const nextItems = items.filter((emp) => emp.id !== id);
  setAdminEmployeesStore(nextItems);
  return NextResponse.json({
    message: 'Employee deleted.',
    id,
  });
}
