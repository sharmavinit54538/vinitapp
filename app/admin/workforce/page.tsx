'use client';

import React, { useMemo, useState } from 'react';
import { Provider } from 'react-redux';
import { Toaster } from 'sonner';
import Link from 'next/link';
import { Building2, Users, ArrowLeft, ShieldCheck } from 'lucide-react';
import { makeHrStore } from '@/lib/store';
import { EmployeesTable } from '@/src/features/admin/employees/components/EmployeesTable';
import { DepartmentsDirectoryTab } from '@/src/features/admin/departments/components/DepartmentsDirectoryTab';

export default function AdminWorkforcePage() {
  const store = useMemo(() => makeHrStore(), []);
  const [activeTab, setActiveTab] = useState<'employees' | 'departments'>('employees');

  return (
    <Provider store={store}>
      <Toaster position="top-right" richColors />
      <div className="min-h-screen bg-slate-50 text-slate-900">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3.5 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold tracking-wider text-blue-600 uppercase">
                    OFC360 · HR Admin Console
                  </span>
                </div>
                <h1 className="text-base font-bold text-slate-900 sm:text-lg">
                  Workforce &amp; Department Administration
                </h1>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <Link
                href="/onboarding"
                className="rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                Workspace Wizard
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-slate-800"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Back to Command Center
              </Link>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6">
          <div className="mb-6 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('employees')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'employees'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Users className="h-4 w-4" />
              Employees Directory &amp; Onboarding
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('departments')}
              className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-bold transition ${
                activeTab === 'departments'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Building2 className="h-4 w-4" />
              Departments &amp; Hierarchy
            </button>
          </div>

          <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-xs sm:p-6">
            {activeTab === 'employees' ? (
              <EmployeesTable />
            ) : (
              <DepartmentsDirectoryTab />
            )}
          </div>
        </main>
      </div>
    </Provider>
  );
}
