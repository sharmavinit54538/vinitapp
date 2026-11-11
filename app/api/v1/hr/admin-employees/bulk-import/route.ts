import { NextRequest, NextResponse } from 'next/server';
import {
  AdminEmployeeFormValues,
  AdminEmployeeRecord,
} from '@/src/features/admin/employees/employeesThunk';
import { getAdminEmployeesStore } from '@/lib/admin-workforce-store';

export async function POST(req: NextRequest) {
  const existing = getAdminEmployeesStore();
  let body: { items?: AdminEmployeeFormValues[] } = {};
  try {
    body = (await req.json()) as { items?: AdminEmployeeFormValues[] };
  } catch {
    body = {};
  }

  const incoming = Array.isArray(body.items) ? body.items : [];
  const created: AdminEmployeeRecord[] = incoming.map((row, idx) => {
    const fullName = `${row.firstName} ${row.lastName}`.trim();
    return {
      ...row,
      id: `EMP-BULK-${Date.now()}-${idx}`,
      fullName,
      status: row.sendOnboardingInvite ? 'Onboarding Invite Sent' : 'Active',
      createdAt: new Date().toISOString().slice(0, 10),
    };
  });

  existing.unshift(...created);
  return NextResponse.json({
    message: `Imported ${created.length} employees.`,
    items: created,
  });
}
