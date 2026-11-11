'use client';

import React, { useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore } from '@/lib/store';
import { AttendanceAnalyticsWorkspaceShell } from '@/src/components/attendance-analytics/AttendanceAnalyticsWorkspaceShell';

export default function AttendanceAnalyticsRootPage() {
  const store = useMemo(() => makeHrStore(), []);

  return (
    <Provider store={store}>
      <AttendanceAnalyticsWorkspaceShell
        initialModule="overview"
        startInDirectory={false}
      />
    </Provider>
  );
}
