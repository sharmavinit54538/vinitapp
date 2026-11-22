'use client';

import React, { useState, use } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore } from '@/lib/store';
import {
  PayrollWorkspaceShell,
  PAYROLL_MODULES_REGISTRY,
} from '@/src/components/payroll/PayrollWorkspaceShell';
import { PayrollModuleId } from '@/src/types/payroll';
import { RoleRouteGuard } from '@/components/auth/role-route-guard';

export default function PayrollDynamicModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const resolved = use(params);
  const [store] = useState<AppStore>(() => makeHrStore());
  const validModule = PAYROLL_MODULES_REGISTRY.find(
    (m) => m.id === resolved.module
  )?.id as PayrollModuleId | undefined;

  return (
    <RoleRouteGuard routePath={`/payroll/${validModule || resolved.module || 'dashboard'}`}>
      <Provider store={store}>
        <PayrollWorkspaceShell initialModule={validModule || 'dashboard'} />
      </Provider>
    </RoleRouteGuard>
  );
}
