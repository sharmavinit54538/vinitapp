'use client';

import React, { useState, useEffect } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore, setActiveRole } from '@/lib/store';
import { Ofc360Role } from '@/lib/auth-schemas';
import { RootNavigator } from './src/navigation/RootNavigator';
import { EmployeeDashboardHub } from './src/components/employee-dashboard/EmployeeDashboardHub';

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
    return <EmployeeDashboardHub initialRole="employee" />;
  }

  return (
    <Provider store={store}>
      <RootNavigator />
    </Provider>
  );
}
