'use client';

import React from 'react';
import { MainCategory } from '@/lib/helpdesk-types';
import {
  FolderTree,
  DollarSign,
  CalendarCheck,
  Calendar,
  Laptop,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';

export function CategoriesDepartmentsView() {
  const categoriesData: {
    category: MainCategory;
    icon: React.ElementType;
    department: string;
    slaTier: string;
    subcategories: string[];
  }[] = [
    {
      category: 'Payroll Support',
      icon: DollarSign,
      department: 'Finance & People Operations',
      slaTier: 'High (24h)',
      subcategories: [
        'Salary Issues',
        'Payslip Requests',
        'Tax & TDS',
        'PF & ESI',
        'Reimbursements',
        'Bonus & Incentives',
      ],
    },
    {
      category: 'Attendance Support',
      icon: CalendarCheck,
      department: 'People Operations',
      slaTier: 'Medium (48h)',
      subcategories: [
        'Missing Attendance',
        'Check-in / Check-out',
        'Attendance Correction',
        'Shift Issues',
        'Overtime',
      ],
    },
    {
      category: 'Leave Support',
      icon: Calendar,
      department: 'People Operations',
      slaTier: 'Medium (48h)',
      subcategories: [
        'Leave Balance',
        'Leave Application',
        'Leave Approval',
        'Leave Encashment',
      ],
    },
    {
      category: 'IT Support',
      icon: Laptop,
      department: 'IT Infrastructure & Security',
      slaTier: 'Critical (4h) - High (24h)',
      subcategories: [
        'Login Issues',
        'Account Access',
        'Software Issues',
        'Hardware Requests',
      ],
    },
    {
      category: 'HR Support',
      icon: FolderTree,
      department: 'Human Resources & Talent',
      slaTier: 'Medium (48h)',
      subcategories: [
        'Employee Profile',
        'Joining & Onboarding',
        'Employee Documents',
        'HR Policies',
        'Employee Lifecycle',
      ],
    },
    {
      category: 'Other',
      icon: HelpCircle,
      department: 'Workplace & Legal Grievance',
      slaTier: 'Configurable',
      subcategories: [
        'Workplace Complaints',
        'General Queries',
        'Suggestions',
        'Confidential Complaints',
      ],
    },
  ];

  return (
    <div className="space-y-4" data-testid="categories-departments-view">
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs">
        <h2 className="text-base font-bold text-slate-900 dark:text-white">
          Ticket Categories &amp; Department Routing Topology
        </h2>
        <p className="text-xs text-slate-500">
          Automated ticket triage taxonomy, SLA targets &amp; escalation routing rules
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoriesData.map((cat) => {
          const IconComp = cat.icon;
          return (
            <div
              key={cat.category}
              className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-300 flex items-center justify-center">
                  <IconComp className="w-5 h-5" />
                </div>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {cat.slaTier}
                </span>
              </div>

              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {cat.category}
                </h3>
                <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold mt-0.5">
                  Route to: {cat.department}
                </p>
              </div>

              <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Subcategories ({cat.subcategories.length})
                </span>
                <div className="flex flex-wrap gap-1 mt-1">
                  {cat.subcategories.map((sub) => (
                    <span
                      key={sub}
                      className="px-2 py-1 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-[11px] text-slate-700 dark:text-slate-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
