'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PerformanceGoalsWorkspaceShell } from '@/src/components/performance/PerformanceGoalsWorkspaceShell';

export default function PerformancePage() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-[#F3F2EF]">
      <div className="w-full max-w-[1128px] mx-auto min-h-screen bg-white lg:border-x lg:border-[#E5E7EB] relative">
        <PerformanceGoalsWorkspaceShell
          embedded={false}
          onBackFromEmbedded={() => router.push('/')}
        />
      </div>
    </div>
  );
}
