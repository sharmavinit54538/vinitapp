'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { Provider } from 'react-redux';
import { makeHrStore } from '@/lib/store';
import {
  VisitorWorkspaceShell,
  VISITOR_MODULES_REGISTRY,
} from '@/src/components/visitors/VisitorWorkspaceShell';
import { VisitorModuleId } from '@/src/types/visitors';

export default function VisitorModuleDynamicPage() {
  const [store] = useState(() => makeHrStore());
  const params = useParams<{ module?: string }>();
  const rawModule = params?.module || 'dashboard';
  const matched = VISITOR_MODULES_REGISTRY.find((m) => m.id === rawModule);
  const resolvedModule: VisitorModuleId = matched ? matched.id : 'dashboard';

  return (
    <Provider store={store}>
      <main className="min-h-screen bg-slate-50 dark:bg-slate-950">
        <VisitorWorkspaceShell
          initialModule={resolvedModule}
          startInDirectory={false}
        />
      </main>
    </Provider>
  );
}
