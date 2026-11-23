'use client';

import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore, setActiveRole } from '@/lib/store';
import { Ofc360Role } from '@/lib/auth-schemas';
import { RootNavigator } from './src/navigation/RootNavigator';
import { EmployeePortalRoot } from './src/screens/employee/EmployeePortalRoot';
import { ItAdminPortalRoot } from './src/screens/it-admin/ItAdminPortalRoot';
import { RoleRouteGuard } from './components/auth/role-route-guard';
import { resolveRoleDashboardPath } from './lib/auth-schemas';

export interface MobileAppProps {
  initialRole?: Ofc360Role;
}

export default function App({ initialRole = 'hr_admin' }: MobileAppProps) {
  const [store] = useState<AppStore>(() => makeHrStore());

  useEffect(() => {
    if (initialRole) {
      store.dispatch(setActiveRole(initialRole));
    }
  }, [initialRole, store]);

  if (initialRole === 'employee') {
    return (
      <Provider store={store}>
        <EmployeePortalRoot />
      </Provider>
    );
  }

  if (initialRole === 'it_admin') {
    return (
      <Provider store={store}>
        <ItAdminPortalRoot />
      </Provider>
    );
  }

  return (
    <RoleRouteGuard routePath={resolveRoleDashboardPath(initialRole)}>
      <Provider store={store}>
        <RootNavigator />
      </Provider>
    </RoleRouteGuard>
  );
}
