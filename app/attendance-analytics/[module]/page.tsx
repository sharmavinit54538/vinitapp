'use client';

import React, { use, useMemo } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore } from '@/lib/store';
import { AttendanceAnalyticsModuleId } from '@/src/types/attendanceAnalytics';
import {
  ATTENDANCE_ANALYTICS_MODULES_REGISTRY,
  AttendanceAnalyticsWorkspaceShell,
} from '@/src/components/attendance-analytics/AttendanceAnalyticsWorkspaceShell';

export default function AttendanceAnalyticsModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const resolved = use(params);
  const store = useMemo(() => makeHrStore(), []);

  const validModule = useMemo<AttendanceAnalyticsModuleId>(() => {
    const found = ATTENDANCE_ANALYTICS_MODULES_REGISTRY.find(
      (m) => m.id === resolved.module
    );
    return found ? found.id : 'overview';
  }, [resolved.module]);

  return (
    <Provider store={store}>
      <AttendanceAnalyticsWorkspaceShell
        initialModule={validModule}
        startInDirectory={false}
      />
    </Provider>
  );
}
