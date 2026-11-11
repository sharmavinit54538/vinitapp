'use client';

import React, { useState, use } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore } from '@/lib/store';
import {
  OnboardingWorkspaceShell,
  ONBOARDING_MODULES_REGISTRY,
} from '@/src/components/onboarding/OnboardingWorkspaceShell';
import { OnboardingModuleId } from '@/src/types/onboarding';

export default function OnboardingModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const resolved = use(params);
  const [store] = useState<AppStore>(() => makeHrStore());

  const matched = ONBOARDING_MODULES_REGISTRY.find(
    (m) => m.id === resolved.module
  );
  const initialModule: OnboardingModuleId = matched ? matched.id : 'dashboard';

  return (
    <Provider store={store}>
      <OnboardingWorkspaceShell
        initialModule={initialModule}
        startInDirectory={false}
      />
    </Provider>
  );
}
