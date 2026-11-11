'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore } from '@/lib/store';
import { VisitorWorkspaceShell } from '@/src/components/visitors/VisitorWorkspaceShell';

export default function VisitorsPage() {
  const [store] = useState(() => makeHrStore());

  return (
    <Provider store={store}>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <VisitorWorkspaceShell
          initialModule="dashboard"
          startInDirectory={false}
        />
      </main>
    </Provider>
  );
}
