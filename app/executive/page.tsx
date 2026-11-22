import React from 'react';
import type { Metadata } from 'next';
import { RoleRouteGuard } from '@/components/auth/role-route-guard';
import { ExecutivePortalRoot } from '@/src/screens/executive/ExecutivePortalRoot';

export const metadata: Metadata = {
  title: 'OFC360 – Executive Command Center',
  description:
    'C-Suite Command Center for enterprise workforce intelligence, payroll governance, AI insights, executive approvals, and board reporting.',
};

export default function ExecutivePortalAliasPage() {
  return (
    <RoleRouteGuard routePath="/executive">
      <ExecutivePortalRoot />
    </RoleRouteGuard>
  );
}
