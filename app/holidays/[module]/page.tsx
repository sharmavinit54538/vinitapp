'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Provider } from 'react-redux';
import { makeHrStore } from '@/lib/store';
import {
  HolidayWorkspaceShell,
  HOLIDAY_MODULES_REGISTRY,
} from '@/src/components/holidays/HolidayWorkspaceShell';
import { HolidayModuleId } from '@/src/types/holidays';

export default function HolidayModuleDynamicPage() {
  const [store] = useState(() => makeHrStore());
  const params = useParams<{ module?: string }>();
  const rawModule = params?.module || 'dashboard';
  const matched = HOLIDAY_MODULES_REGISTRY.find((m) => m.id === rawModule);
  const resolvedModule: HolidayModuleId = matched ? matched.id : 'dashboard';

  return (
    <Provider store={store}>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <HolidayWorkspaceShell
          initialModule={resolvedModule}
          startInDirectory={false}
        />
      </main>
    </Provider>
  );
}
