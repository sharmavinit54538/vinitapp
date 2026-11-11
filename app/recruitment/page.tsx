'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore } from '@/lib/store';
import { RecruitmentWorkspaceShell } from '@/src/components/recruitment/RecruitmentWorkspaceShell';

export default function RecruitmentIndexPage() {
  const [store] = useState<AppStore>(() => makeHrStore());

  return (
    <Provider store={store}>
      <RecruitmentWorkspaceShell initialModule="dashboard" startInDirectory={false} />
    </Provider>
  );
}
