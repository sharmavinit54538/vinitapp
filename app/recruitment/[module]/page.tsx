'use client';

import React, { useState, use } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore } from '@/lib/store';
import {
  RecruitmentWorkspaceShell,
  RECRUITMENT_MODULES_REGISTRY,
} from '@/src/components/recruitment/RecruitmentWorkspaceShell';
import { RecruitmentModuleId } from '@/src/types/recruitment';

export default function RecruitmentModuleRoutePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const resolved = use(params);
  const [store] = useState<AppStore>(() => makeHrStore());

  const matched = RECRUITMENT_MODULES_REGISTRY.find(
    (m) => m.id === resolved.module
  );
  const initialModule: RecruitmentModuleId = matched ? matched.id : 'dashboard';

  return (
    <Provider store={store}>
      <RecruitmentWorkspaceShell initialModule={initialModule} />
    </Provider>
  );
}
