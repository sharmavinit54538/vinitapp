'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gauge,
  CalendarDays,
  Layers,
  UserCheck,
  Clock,
  Gift,
  HandCoins,
  Landmark,
  FileText,
  ShieldCheck,
  FileSpreadsheet,
  Handshake,
  RefreshCw,
  BarChart3,
  Settings,
  User,
  CheckCircle2,
  ArrowLeft,
  Grid,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveRole } from '@/lib/store';
import { Ofc360Role } from '@/lib/auth-schemas';
import { PayrollModuleId, PayrollRole } from '../../types/payroll';
import {
  usePayrollPermission,
  canRoleAccessModule,
} from '../../hooks/usePayrollPermission';
import {
  PayrollDashboardModule,
  PayCalendarRunModule,
  SalaryStructureModule,
  EmployeeCompensationModule,
  AttendanceLopModule,
  VariableInputsModule,
} from './PayrollCoreModules';
import {
  LoansAdvancesModule,
  StatutoryComplianceModule,
  TaxDeclarationsModule,
  PayrollApprovalsModule,
  PayslipsModule,
  BankDisbursementModule,
  FnfSettlementModule,
} from './PayrollComplianceAndOpsModules';
import {
  ArrearsModule,
  PayrollReportsModule,
  PayrollSettingsModule,
  PayrollAuditLogsModule,
  PayrollNotificationsModule,
  EssMyPayModule,
} from './PayrollGovernanceAndEssModules';

export interface PayrollNavModuleItem {
  id: PayrollModuleId;
  number: number;
  label: string;
  shortLabel: string;
  subtitle: string;
  cardGroup: 1 | 2 | 3 | 4;
  group: 'Run & Compensation' | 'Compliance & Payouts' | 'Governance & Self-Service';
  Icon: React.ComponentType<{ className?: string }>;
  iconBgClass: string;
  iconColorClass: string;
}

export const PAYROLL_MODULES_REGISTRY: PayrollNavModuleItem[] = [
  {
    id: 'dashboard',
    number: 1,
    label: '1. Dashboard',
    shortLabel: 'Dashboard',
    subtitle: 'Payroll dashboard & analytics',
    cardGroup: 1,
    group: 'Run & Compensation',
    Icon: Gauge,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'pay-calendar',
    number: 2,
    label: '2. Pay Run',
    shortLabel: 'Pay Run',
    subtitle: 'Run payroll with 11-stage engine',
    cardGroup: 1,
    group: 'Run & Compensation',
    Icon: CalendarDays,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'salary-structures',
    number: 3,
    label: '3. Structures',
    shortLabel: 'Structures',
    subtitle: 'Manage salary structures',
    cardGroup: 1,
    group: 'Run & Compensation',
    Icon: Layers,
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'compensation',
    number: 4,
    label: '4. Compensation',
    shortLabel: 'Compensation',
    subtitle: 'Assign & revise salary',
    cardGroup: 1,
    group: 'Run & Compensation',
    Icon: UserCheck,
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/60',
    iconColorClass: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'attendance-lop',
    number: 5,
    label: '5. Attendance & LOP',
    shortLabel: 'Attendance & LOP',
    subtitle: 'Manage attendance & LOP',
    cardGroup: 1,
    group: 'Run & Compensation',
    Icon: Clock,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'variable-inputs',
    number: 6,
    label: '6. Variable Inputs',
    shortLabel: 'Variable Inputs',
    subtitle: 'Bonuses & incentives',
    cardGroup: 2,
    group: 'Run & Compensation',
    Icon: Gift,
    iconBgClass: 'bg-rose-50 dark:bg-rose-950/60',
    iconColorClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'loans-advances',
    number: 7,
    label: '7. Loans & Advances',
    shortLabel: 'Loans & Advances',
    subtitle: 'Manage loans',
    cardGroup: 2,
    group: 'Compliance & Payouts',
    Icon: HandCoins,
    iconBgClass: 'bg-orange-50 dark:bg-orange-950/60',
    iconColorClass: 'text-orange-500 dark:text-orange-400',
  },
  {
    id: 'statutory',
    number: 8,
    label: '8. Statutory Compliance',
    shortLabel: 'Statutory Compliance',
    subtitle: 'PF, ESI, TDS & more',
    cardGroup: 2,
    group: 'Compliance & Payouts',
    Icon: Landmark,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'tax-declarations',
    number: 9,
    label: '9. Tax & Investment Proofs',
    shortLabel: 'Tax & Investment Proofs',
    subtitle: 'Manage tax declarations',
    cardGroup: 2,
    group: 'Compliance & Payouts',
    Icon: FileText,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'approvals',
    number: 10,
    label: '10. Approvals Workflow',
    shortLabel: 'Approvals Workflow',
    subtitle: 'Approve payroll requests',
    cardGroup: 2,
    group: 'Compliance & Payouts',
    Icon: ShieldCheck,
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'payslips',
    number: 11,
    label: '11. Payslips & Dispatch',
    shortLabel: 'Payslips & Dispatch',
    subtitle: 'Generate & share payslips',
    cardGroup: 3,
    group: 'Compliance & Payouts',
    Icon: FileSpreadsheet,
    iconBgClass: 'bg-sky-50 dark:bg-sky-950/60',
    iconColorClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'bank-disbursement',
    number: 12,
    label: '12. Bank Advice & UTR',
    shortLabel: 'Bank Advice & UTR',
    subtitle: 'Generate bank files',
    cardGroup: 3,
    group: 'Compliance & Payouts',
    Icon: Landmark,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'fnf-settlement',
    number: 13,
    label: '13. Full & Final (F&F)',
    shortLabel: 'Full & Final (F&F)',
    subtitle: 'Settle exiting employees',
    cardGroup: 3,
    group: 'Compliance & Payouts',
    Icon: Handshake,
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/60',
    iconColorClass: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'arrears',
    number: 14,
    label: '14. Arrears & Corrections',
    shortLabel: 'Arrears & Corrections',
    subtitle: 'Manage arrears',
    cardGroup: 3,
    group: 'Governance & Self-Service',
    Icon: RefreshCw,
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'reports',
    number: 15,
    label: '15. Reports & Analytics',
    shortLabel: 'Reports & Analytics',
    subtitle: 'Payroll reports & insights',
    cardGroup: 3,
    group: 'Governance & Self-Service',
    Icon: BarChart3,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'settings',
    number: 16,
    label: '16. Settings & Automation',
    shortLabel: 'Settings & Automation',
    subtitle: 'Configure payroll settings',
    cardGroup: 4,
    group: 'Governance & Self-Service',
    Icon: Settings,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-700 dark:text-indigo-400',
  },
  {
    id: 'audit-logs',
    number: 17,
    label: '17. Audit Logs',
    shortLabel: 'Audit Logs',
    subtitle: 'Track all activities',
    cardGroup: 4,
    group: 'Governance & Self-Service',
    Icon: ShieldCheck,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'my-pay',
    number: 18,
    label: '18. ESS — My Pay',
    shortLabel: 'ESS — My Pay',
    subtitle: 'Employee self-service',
    cardGroup: 4,
    group: 'Governance & Self-Service',
    Icon: User,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
];

const CARD_GROUPS: { id: 1 | 2 | 3 | 4; title: string }[] = [
  { id: 1, title: 'Run & Compensation' },
  { id: 2, title: 'Inputs & Loans' },
  { id: 3, title: 'Compliance & Payouts' },
  { id: 4, title: 'Governance & Self-Service' },
];

export function PayrollWorkspaceShell({
  initialModule = 'dashboard',
  startInDirectory = false,
  embedded = false,
  onBackFromEmbedded: _onBackFromEmbedded,
}: {
  initialModule?: PayrollModuleId;
  startInDirectory?: boolean;
  embedded?: boolean;
  onBackFromEmbedded?: () => void;
}) {
  const dispatch = useDispatch();
  const [activeModule, setActiveModule] = useState<PayrollModuleId>(initialModule);
  const [viewMode, setViewMode] = useState<'directory' | 'module'>(
    startInDirectory ? 'directory' : 'module'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [roleOverride, setRoleOverride] = useState<PayrollRole | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const perms = usePayrollPermission(roleOverride);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3400);
  };

  const _handleRoleChange = (nextRole: PayrollRole) => {
    setRoleOverride(nextRole);
    const mappedStoreRole: Ofc360Role =
      nextRole === 'super_admin'
        ? 'super_admin'
        : nextRole === 'hr_admin' || nextRole === 'payroll_manager'
        ? 'hr_admin'
        : nextRole === 'finance_approver'
        ? 'executive'
        : nextRole === 'manager'
        ? 'manager'
        : 'employee';
    dispatch(setActiveRole(mappedStoreRole));
    if (!canRoleAccessModule(nextRole, activeModule)) {
      setActiveModule(nextRole === 'employee' ? 'my-pay' : 'dashboard');
    }
  };

  const handleOpenModule = (id: PayrollModuleId) => {
    setActiveModule(id);
    setViewMode('module');
  };

  const activeMeta =
    PAYROLL_MODULES_REGISTRY.find((m) => m.id === activeModule) ||
    PAYROLL_MODULES_REGISTRY[0];

  // Filter modules based on search query
  const queryTrimmed = searchQuery.toLowerCase().trim();
  const filteredModules = PAYROLL_MODULES_REGISTRY.filter((m) => {
    const matchesSearch =
      !queryTrimmed ||
      m.label.toLowerCase().includes(queryTrimmed) ||
      m.shortLabel.toLowerCase().includes(queryTrimmed) ||
      m.subtitle.toLowerCase().includes(queryTrimmed) ||
      m.group.toLowerCase().includes(queryTrimmed);
    return matchesSearch;
  });

  // Render the Payroll Module directory list in smartphone app style
  const renderDirectoryCards = () => {
    if (filteredModules.length === 0) {
      return (
        <div className="rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 text-center shadow-xs">
          <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            No modules found matching &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-indigo-600 hover:underline cursor-pointer"
          >
            Clear Search
          </button>
        </div>
      );
    }

    return (
      <div
        className="w-full bg-white dark:bg-zinc-900 divide-y divide-zinc-100 dark:divide-zinc-800/80"
        data-testid="payroll-modules-directory"
      >
        {filteredModules.map((item) => {
          const hasAccess = perms.canAccessModule(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleOpenModule(item.id)}
              className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 transition hover:bg-zinc-100/70 dark:hover:bg-zinc-800/50 cursor-pointer ${
                hasAccess ? '' : 'opacity-60'
              }`}
            >
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-semibold text-zinc-950 dark:text-white leading-snug truncate">
                  {item.label}
                </div>
                <div className="text-[12px] font-normal text-zinc-500 dark:text-zinc-400 leading-snug truncate mt-0.5">
                  {item.subtitle}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={
        embedded
          ? 'text-slate-900 dark:text-white font-sans'
          : 'min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center text-slate-900 dark:text-white font-sans antialiased'
      }
    >
      <div
        className={
          embedded
            ? 'w-full'
            : 'w-full max-w-[440px] min-h-screen bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 flex flex-col shadow-sm'
        }
      >
        {/* Toast Notification */}
        {toastMsg ? (
          <div
            role="status"
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        ) : null}

        {/* 1. STICKY MOBILE TOP APP BAR (Standalone /payroll route) */}
        {!embedded && (
          <header className="sticky top-0 z-30 h-14 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Link
                href="/?tab=more"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 transition-colors"
                aria-label="Back to All Modules"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <span className="text-[17px] font-extrabold tracking-tight text-slate-900 dark:text-white">
                OFC360
              </span>
            </div>
          </header>
        )}

        {/* 2. MAIN CONTENT AREA */}
        <main
          className={
            viewMode === 'directory'
              ? 'flex-1 p-0 m-0 bg-white dark:bg-zinc-900'
              : embedded
              ? 'p-4 space-y-3.5'
              : 'flex-1 p-4 space-y-4 overflow-x-hidden bg-neutral-50 dark:bg-zinc-950'
          }
        >
          {viewMode === 'directory' ? (
            renderDirectoryCards()
          ) : (
            <section className="w-full min-w-0 space-y-3.5">
              {/* Sub-module Back Bar to return to Payroll Modules list */}
              <div className="rounded-xl px-3.5 py-2.5 bg-white dark:bg-zinc-900 border border-zinc-200/80 dark:border-zinc-800 flex items-center justify-start gap-2.5">
                <button
                  type="button"
                  onClick={() => setViewMode('directory')}
                  className="h-9 px-3 rounded-md bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-zinc-100 text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer hover:bg-zinc-200/70 transition-colors"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Payroll Modules</span>
                </button>
              </div>

              {activeModule === 'dashboard' ? (
                <PayrollDashboardModule
                  onNavigateModule={(mod) => handleOpenModule(mod)}
                  onToast={triggerToast}
                />
              ) : null}
              {activeModule === 'pay-calendar' ? (
                <PayCalendarRunModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'salary-structures' ? (
                <SalaryStructureModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'compensation' ? (
                <EmployeeCompensationModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'attendance-lop' ? (
                <AttendanceLopModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'variable-inputs' ? (
                <VariableInputsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'loans-advances' ? (
                <LoansAdvancesModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'statutory' ? (
                <StatutoryComplianceModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'tax-declarations' ? (
                <TaxDeclarationsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'approvals' ? (
                <PayrollApprovalsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'payslips' ? (
                <PayslipsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'bank-disbursement' ? (
                <BankDisbursementModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'fnf-settlement' ? (
                <FnfSettlementModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'arrears' ? (
                <ArrearsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'reports' ? (
                <PayrollReportsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'settings' ? (
                <PayrollSettingsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'audit-logs' ? (
                <PayrollAuditLogsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'notifications' ? (
                <PayrollNotificationsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'my-pay' ? (
                <EssMyPayModule onToast={triggerToast} />
              ) : null}
            </section>
          )}
        </main>

        {/* 3. STICKY MOBILE BOTTOM NAVIGATION BAR */}
        {!embedded && (
          <nav className="sticky bottom-0 z-30 flex h-16 items-center justify-around border-t border-slate-200/80 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-2 backdrop-blur-md">
            {[
              {
                id: 'menu',
                label: 'All Menu',
                Icon: Grid,
                isActive: viewMode !== 'module',
                onTap: () => setViewMode('directory'),
              },
              {
                id: 'dashboard',
                label: 'Dashboard',
                Icon: Gauge,
                isActive: viewMode === 'module' && activeModule === 'dashboard',
                onTap: () => handleOpenModule('dashboard'),
              },
              {
                id: 'pay-run',
                label: 'Pay Run',
                Icon: CalendarDays,
                isActive: viewMode === 'module' && activeModule === 'pay-calendar',
                onTap: () => handleOpenModule('pay-calendar'),
              },
              {
                id: 'payslips',
                label: 'Payslips',
                Icon: FileSpreadsheet,
                isActive: viewMode === 'module' && activeModule === 'payslips',
                onTap: () => handleOpenModule('payslips'),
              },
              {
                id: 'my-pay',
                label: 'My Pay',
                Icon: User,
                isActive: viewMode === 'module' && activeModule === 'my-pay',
                onTap: () => handleOpenModule('my-pay'),
              },
            ].map((tab) => {
              const TabIcon = tab.Icon;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={tab.onTap}
                  className={`flex flex-1 flex-col items-center justify-center gap-1 py-1 text-[10px] font-bold transition-colors cursor-pointer ${
                    tab.isActive
                      ? 'text-indigo-600 dark:text-indigo-400'
                      : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'
                  }`}
                >
                  <TabIcon className="h-5 w-5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </nav>
        )}
      </div>
    </div>
  );
}
