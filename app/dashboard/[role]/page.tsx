import React from 'react';
import { HrMobileAppShell } from '@/components/hr-mobile/hr-mobile-shell';
import { Ofc360Role, OFC360_ROLES } from '@/lib/auth-schemas';

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

  return <HrMobileAppShell initialRole={validRole} />;
}
