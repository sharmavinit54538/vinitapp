import React from 'react';
import App from '@/App';
import { Ofc360Role, OFC360_ROLES } from '@/lib/auth-schemas';
import { EmployeeDashboardHub } from '@/src/components/employee-dashboard/EmployeeDashboardHub';

export default async function RoleDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const resolved = await params;
  const normalizedRole = resolved.role
    .toLowerCase()
    .replace(/-/g, '_') as Ofc360Role;
  const validRole = OFC360_ROLES.includes(normalizedRole)
    ? normalizedRole
    : 'hr_admin';

  if (validRole === 'employee') {
    return <EmployeeDashboardHub initialRole="employee" />;
  }

  if (validRole === 'manager') {
    return <EmployeeDashboardHub initialRole="reporting_manager" />;
  }

  return <App initialRole={validRole} />;
}

