import React from 'react';
import type { Metadata } from 'next';
import App from '@/App';
import { Ofc360Role, OFC360_ROLES } from '@/lib/auth-schemas';
import { ManagerPortalRoot } from '@/src/screens/manager/ManagerPortalRoot';
import { EmployeePortalRoot } from '@/src/screens/employee/EmployeePortalRoot';
import { ItAdminPortalRoot } from '@/src/screens/it-admin/ItAdminPortalRoot';
import { ExecutivePortalRoot } from '@/src/screens/executive/ExecutivePortalRoot';
import { RoleRouteGuard } from '@/components/auth/role-route-guard';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ role: string }>;
}): Promise<Metadata> {
  const resolved = await params;
  const normalized = (resolved?.role || '').toLowerCase().replace(/-/g, '_');
  if (normalized === 'employee') {
    return {
      title: 'OFC360 – Employee Self-Service Portal',
      description:
        'Employee self-service attendance, shifts, leave balances, payslips, documents, and helpdesk.',
    };
  }
  if (normalized === 'manager') {
    return {
      title: 'OFC360 – Manager Workspace',
      description:
        'Manager workspace for team attendance, shift rosters, approvals, performance reviews, and hiring.',
    };
  }
  if (normalized === 'it_admin') {
    return {
      title: 'OFC360 – IT Admin Operations',
      description:
        'IT Operations, asset management, helpdesk SLA queue, user provisioning, RBAC, and offboarding IT clearance.',
    };
  }
  if (
    normalized === 'executive' ||
    normalized === 'ceo' ||
    normalized === 'cfo' ||
    normalized === 'coo' ||
    normalized === 'cto'
  ) {
    return {
      title: 'OFC360 – Executive Command Center',
      description:
        'C-Suite Command Center for workforce intelligence, payroll governance, AI insights, executive approvals, and board reports.',
    };
  }
  return {
    title: 'OFC360 – Workforce Workspace',
  };
}

export default async function RoleDashboardPage({
  params,
}: {
  params: Promise<{ role: string }>;
}) {
  const resolved = await params;
  const rawNormalized = (resolved?.role || '').toLowerCase().replace(/-/g, '_');
  const aliasedRole =
    rawNormalized === 'ceo' ||
    rawNormalized === 'cfo' ||
    rawNormalized === 'coo' ||
    rawNormalized === 'cto'
      ? 'executive'
      : rawNormalized;
  const normalizedRole = aliasedRole as Ofc360Role;
  const validRole = OFC360_ROLES.includes(normalizedRole)
    ? normalizedRole
    : 'hr_admin';

  if (validRole === 'employee') {
    return (
      <RoleRouteGuard routePath="/dashboard/employee">
        <EmployeePortalRoot />
      </RoleRouteGuard>
    );
  }

  if (validRole === 'manager') {
    return (
      <RoleRouteGuard routePath="/dashboard/manager">
        <ManagerPortalRoot />
      </RoleRouteGuard>
    );
  }

  if (validRole === 'it_admin') {
    return (
      <RoleRouteGuard routePath="/dashboard/it-admin">
        <ItAdminPortalRoot />
      </RoleRouteGuard>
    );
  }

  if (validRole === 'executive') {
    return (
      <RoleRouteGuard routePath="/dashboard/executive">
        <ExecutivePortalRoot />
      </RoleRouteGuard>
    );
  }

  return (
    <RoleRouteGuard routePath={`/dashboard/${resolved?.role || validRole}`}>
      <App initialRole={validRole} />
    </RoleRouteGuard>
  );
}
