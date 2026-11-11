'use client';

import React, { useState, use } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore } from '@/lib/store';
import {
  AssetWorkspaceShell,
  ASSET_MODULES_REGISTRY,
} from '@/src/components/assets/AssetWorkspaceShell';
import { AssetModuleId } from '@/src/types/assets';

export default function AssetModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const resolved = use(params);
  const [store] = useState<AppStore>(() => makeHrStore());

  const matched = ASSET_MODULES_REGISTRY.find((m) => m.id === resolved.module);
  const initialModule: AssetModuleId = matched ? matched.id : 'dashboard';

  return (
    <Provider store={store}>
      <AssetWorkspaceShell
        initialModule={initialModule}
        startInDirectory={false}
      />
    </Provider>
  );
}
