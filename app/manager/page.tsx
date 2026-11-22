import React from 'react';
import type { Metadata } from 'next';
import { RoleRouteGuard } from '@/components/auth/role-route-guard';
import { ManagerPortalRoot } from '@/src/screens/manager/ManagerPortalRoot';

export const metadata: Metadata = {
  title: 'OFC360 – Manager Workspace',
  description:
    'Manager self-service workspace for team attendance, shift rosters, approvals, performance reviews, and hiring.',
};

export default function ManagerPortalAliasPage() {
  return (
    <RoleRouteGuard routePath="/manager">
      <ManagerPortalRoot />
    </RoleRouteGuard>
  );
}
