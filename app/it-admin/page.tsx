import React from 'react';
import type { Metadata } from 'next';
import { RoleRouteGuard } from '@/components/auth/role-route-guard';
import { ItAdminPortalRoot } from '@/src/screens/it-admin/ItAdminPortalRoot';

export const metadata: Metadata = {
  title: 'OFC360 – IT Admin Operations',
  description:
    'IT Operations, asset registry, QR inventory, helpdesk SLA queue, user provisioning, RBAC, and offboarding clearance.',
};

export default function ItAdminPortalAliasPage() {
  return (
    <RoleRouteGuard routePath="/it-admin">
      <ItAdminPortalRoot />
    </RoleRouteGuard>
  );
}
