'use client';

import React from 'react';
import { TravelDeskWorkspaceShell } from '@/src/components/travel-desk/TravelDeskWorkspaceShell';

export default function TravelPage() {
  return (
    <div className="min-h-screen bg-slate-100 flex justify-center py-4 sm:py-8 px-2 sm:px-4">
      <TravelDeskWorkspaceShell startInDirectory={true} />
    </div>
  );
}
