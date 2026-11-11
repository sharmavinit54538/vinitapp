import React from 'react';
import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-6 text-slate-900 dark:text-slate-100">
      <div className="max-w-md w-full rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 text-center space-y-4 shadow-xs">
        <p className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400">
          404 · PAGE NOT FOUND
        </p>
        <h1 className="text-lg font-bold">
          The requested OFC360 workspace route could not be found
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Return to your dashboard or sign in to continue.
        </p>
        <div className="flex items-center justify-center gap-3 pt-2">
          <Link
            href="/"
            className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
          >
            Go to Home Dashboard
          </Link>
          <Link
            href="/my-dashboard"
            className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold hover:bg-slate-50 dark:hover:bg-slate-800"
          >
            Employee Dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
