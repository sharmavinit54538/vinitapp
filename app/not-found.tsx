import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[#F3F2EF] p-4 text-[#171717]">
      <div className="max-w-md w-full rounded-lg border border-[#E5E7EB] bg-white p-6 text-center space-y-4">
        <p className="text-xs font-semibold text-[#0A66C2]">
          404 · Page not found
        </p>
        <h1 className="text-base font-semibold text-[#171717]">
          The requested OFC360 workspace route could not be found
        </h1>
        <p className="text-xs text-[#666666]">
          Return to your dashboard or sign in to continue.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="min-h-[40px] inline-flex items-center rounded-md bg-[#0A66C2] px-4 py-2 text-xs font-semibold text-white hover:bg-[#004182] transition-colors"
          >
            Go to home
          </Link>
          <Link
            href="/my-dashboard"
            className="min-h-[40px] inline-flex items-center rounded-md border border-[#E5E7EB] px-4 py-2 text-xs font-semibold text-[#171717] hover:bg-[#F3F2EF] transition-colors"
          >
            Employee portal
          </Link>
        </div>
      </div>
    </main>
  );
}
