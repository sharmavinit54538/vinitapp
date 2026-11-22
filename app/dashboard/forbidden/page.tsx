import React from 'react';
import Link from 'next/link';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export default function ForbiddenPage() {
  return (
    <div
      data-testid="forbidden-403-page"
      className="min-h-screen bg-[#F3F2EF] flex items-center justify-center p-4"
    >
      <div className="w-full max-w-[420px] rounded-lg border border-[#E5E7EB] bg-white p-6 text-center space-y-4">
        <div className="mx-auto w-11 h-11 rounded-lg bg-[#FEE2E2] text-[#B91C1C] flex items-center justify-center">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-[#B91C1C]">
            403 · Access forbidden
          </p>
          <h1 className="text-base font-semibold text-[#171717]">
            Role authorization required
          </h1>
          <p className="text-xs text-[#666666] leading-relaxed">
            This workspace route requires HR Admin, Manager, or Executive privileges.
          </p>
        </div>
        <Link
          href="/dashboard/employee"
          className="w-full min-h-[44px] rounded-md bg-[#0A66C2] hover:bg-[#004182] text-white text-sm font-semibold flex items-center justify-center gap-2 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Go to employee portal
        </Link>
      </div>
    </div>
  );
}
