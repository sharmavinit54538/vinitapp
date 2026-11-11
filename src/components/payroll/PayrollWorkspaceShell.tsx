'use client';

import React, { useState } from 'react';
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
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
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

const CARD_GROUPS: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

export function PayrollWorkspaceShell({
  initialModule = 'dashboard',
  startInDirectory = false,
  embedded = false,
  onBackFromEmbedded,
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
  const [roleOverride, setRoleOverride] = useState<PayrollRole | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const perms = usePayrollPermission(roleOverride);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3400);
  };

  const handleRoleChange = (nextRole: PayrollRole) => {
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

  // Render the 4-card Payroll Module vertical directory list matching the design reference
  const renderDirectoryCards = () => (
    <div className="space-y-3.5" data-testid="payroll-modules-directory">
      {CARD_GROUPS.map((groupNum) => {
        const groupItems = PAYROLL_MODULES_REGISTRY.filter(
          (m) => m.cardGroup === groupNum
        );
        return (
          <div
            key={groupNum}
            className="rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-[0_2px_12px_-4px_rgba(15,23,42,0.06)] overflow-hidden divide-y divide-slate-100 dark:divide-slate-800/80"
          >
            {groupItems.map((item) => {
              const ItemIcon = item.Icon;
              const hasAccess = perms.canAccessModule(item.id);
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleOpenModule(item.id)}
                  className={`w-full text-left px-4 py-3.5 flex items-center justify-between gap-3.5 transition active:scale-[0.99] hover:bg-slate-50/80 dark:hover:bg-slate-800/50 ${
                    hasAccess ? '' : 'opacity-60'
                  }`}
                >
                  {/* Left Colored Rounded-2xl Icon Box */}
                  <div
                    className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ${item.iconBgClass} ${item.iconColorClass}`}
                  >
                    <ItemIcon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  {/* Middle Title & Subtitle */}
                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug truncate">
                      {item.label}
                    </div>
                    <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-snug truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>

                  {/* Right Soft Lavender Circular Chevron Badge */}
                  <div className="w-7 h-7 rounded-full bg-indigo-50/90 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shrink-0 flex items-center justify-center">
                    <ChevronRight className="w-4 h-4 stroke-[2.4]" />
                  </div>
                </button>
              );
            })}
          </div>
        );
      })}
    </div>
  );

  return (
    <div
      className={
        embedded
          ? 'space-y-3.5 text-slate-900 dark:text-white'
          : 'min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white'
      }
    >
      {/* Top Header when not in embedded directory mode */}
      {!embedded ? (
        <header className="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800 px-4 py-3">
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {viewMode === 'module' ? (
                <button
                  type="button"
                  onClick={() => setViewMode('directory')}
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 bg-indigo-50/60 dark:bg-slate-800"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>All Payroll Modules</span>
                </button>
              ) : onBackFromEmbedded ? (
                <button
                  type="button"
                  onClick={onBackFromEmbedded}
                  className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back</span>
                </button>
              ) : null}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold tracking-tight text-indigo-600 dark:text-indigo-400">
                    OFC360 PAYROLL
                  </span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {viewMode === 'directory' ? 'Payroll Modules' : activeMeta.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Enterprise Payroll & Statutory Suite · Zero Client-Side Math · REST API Driven
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="payroll-rbac-role-select"
                className="text-[11px] font-semibold text-slate-500"
              >
                Active Role:
              </label>
              <select
                id="payroll-rbac-role-select"
                value={perms.role}
                onChange={(e) => handleRoleChange(e.target.value as PayrollRole)}
                className="h-9 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="super_admin">Super Admin</option>
                <option value="hr_admin">HR Admin</option>
                <option value="payroll_manager">Payroll Manager</option>
                <option value="finance_approver">Finance Approver</option>
                <option value="manager">Manager</option>
                <option value="employee">Employee (ESS)</option>
              </select>
            </div>
          </div>
        </header>
      ) : null}

      {/* Toast Notification */}
      {toastMsg ? (
        <div
          role="status"
          className="fixed bottom-5 right-5 z-50 rounded-2xl bg-slate-900 text-white px-4 py-3 text-xs font-semibold shadow-xl flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>{toastMsg}</span>
        </div>
      ) : null}

      {viewMode === 'directory' ? (
        <div className={embedded ? '' : 'max-w-xl mx-auto p-4 lg:p-6'}>
          {renderDirectoryCards()}
        </div>
      ) : (
        <div className={embedded ? 'space-y-3.5' : 'max-w-7xl mx-auto p-4 lg:p-6 space-y-4'}>
          {/* Compact Top Bar inside Module View to jump back to the Payroll Directory */}
          <div className="rounded-3xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewMode('directory')}
              className="h-9 px-3.5 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Payroll Modules</span>
            </button>

            <div className="flex items-center gap-2 min-w-0">
              <div
                className={`w-8 h-8 rounded-xl shrink-0 flex items-center justify-center ${activeMeta.iconBgClass} ${activeMeta.iconColorClass}`}
              >
                <activeMeta.Icon className="w-4 h-4" />
              </div>
              <div className="text-right min-w-0">
                <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {activeMeta.label}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                  {activeMeta.subtitle}
                </div>
              </div>
            </div>
          </div>

          {/* Active Module Content Area */}
          <section className="w-full min-w-0">
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
        </div>
      )}
    </div>
  );
}
