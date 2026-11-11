'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore } from '@/lib/store';
import { HolidayWorkspaceShell } from '@/src/components/holidays/HolidayWorkspaceShell';

export default function HolidaysPage() {
  const [store] = useState(() => makeHrStore());

  return (
    <Provider store={store}>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <HolidayWorkspaceShell
          initialModule="dashboard"
          startInDirectory={false}
        />
      </main>
    </Provider>
  );
}
