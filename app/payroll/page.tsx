'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore } from '@/lib/store';
import { PayrollWorkspaceShell } from '@/src/components/payroll/PayrollWorkspaceShell';

export default function PayrollIndexPage() {
  const [store] = useState<AppStore>(() => makeHrStore());

  return (
    <Provider store={store}>
      <PayrollWorkspaceShell initialModule="dashboard" startInDirectory={true} />
    </Provider>
  );
}
