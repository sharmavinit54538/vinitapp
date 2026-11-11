'use client';

import React, { useState } from 'react';
import { Provider } from 'react-redux';
import { makeHrStore, AppStore } from '@/lib/store';
import { AssetWorkspaceShell } from '@/src/components/assets/AssetWorkspaceShell';

export default function AssetIndexPage() {
  const [store] = useState<AppStore>(() => makeHrStore());

  return (
    <Provider store={store}>
      <AssetWorkspaceShell
        initialModule="dashboard"
        startInDirectory={false}
      />
    </Provider>
  );
}
