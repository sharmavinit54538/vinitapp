'use client';

import React, { useState } from 'react';
import {
  Gauge,
  Users,
  GitBranch,
  CheckSquare,
  FileCheck2,
  ClipboardList,
  ArrowRightLeft,
  FileSignature,
  Laptop,
  Wallet,
  Calendar,
  GraduationCap,
  HeartHandshake,
  Gift,
  Award,
  MessageSquareHeart,
  Send,
  ShieldCheck,
  BarChart3,
  Settings,
  History,
  Bell,
  UsersRound,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Shield,
  ArrowLeft,
} from 'lucide-react';
import Link from 'next/link';
import { OnboardingModuleId, OnboardingRole } from '../../types/onboarding';
import { ONBOARDING_ROLE_LABELS } from '../../hooks/useOnboardingPermission';
import {
  OnboardingDashboardModule,
  JoinerManagementModule,
  OnboardingWorkflowsModule,
  TaskManagementModule,
  DocumentCollectionModule,
  EmployeeDataCollectionModule,
  OfferToJoiningHandoffModule,
  PolicyAcknowledgementModule,
} from './OnboardingCoreModules';
import {
  ItAssetProvisioningModule,
  PayrollStatutoryHandoffModule,
  OrientationInductionModule,
  TrainingLearningModule,
  BuddyMentorModule,
  DayOneWelcomeKitModule,
  ProbationTrackingModule,
  FeedbackPulseSurveysModule,
} from './OnboardingExperienceAndProbationModules';
import {
  OnboardingCommunicationCenterModule,
  OnboardingApprovalsModule,
  OnboardingReportsModule,
  OnboardingSettingsAutomationModule,
  OnboardingAuditLogsModule,
  OnboardingNotificationsModule,
  OnboardingManagerPortalModule,
  NewJoinerPortalModule,
} from './OnboardingOpsAndPortalsModules';

export interface OnboardingModuleMeta {
  id: OnboardingModuleId;
  number: number;
  label: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  iconBg: string;
  iconColor: string;
}

export const ONBOARDING_MODULES_REGISTRY: OnboardingModuleMeta[] = [
  {
    id: 'dashboard',
    number: 1,
    label: '1. Onboarding Dashboard',
    subtitle: 'Pre-boarding & joining KPIs, SLA alerts & pipeline',
    icon: Gauge,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'joiners',
    number: 2,
    label: '2. Joiner Management',
    subtitle: 'Pre-boarding to confirmation pipeline & 360 profile',
    icon: Users,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'workflows',
    number: 3,
    label: '3. Workflows & Templates',
    subtitle: 'Role/grade/location templates & relative due rules',
    icon: GitBranch,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'tasks',
    number: 4,
    label: '4. Task & Checklist Engine',
    subtitle: 'Multi-stakeholder tasks, SLA tracking & escalations',
    icon: CheckSquare,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'documents',
    number: 5,
    label: '5. Document Verification',
    subtitle: 'KYC/education docs, OCR confidence & masked IDs',
    icon: FileCheck2,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'joining-forms',
    number: 6,
    label: '6. Joining Forms & Data',
    subtitle: 'Personal, nominee, emergency, bank, PF/UAN & PAN',
    icon: ClipboardList,
    iconBg: 'bg-pink-50 dark:bg-pink-950/60',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'offer-handoff',
    number: 7,
    label: '7. Offer-to-Joining Handoff',
    subtitle: 'ATS intake, BGV clearance & Employee ID generator',
    icon: ArrowRightLeft,
    iconBg: 'bg-orange-50 dark:bg-orange-950/60',
    iconColor: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'policies',
    number: 8,
    label: '8. Policy & E-Sign',
    subtitle: 'NDA, POSH, IT Security & Code of Conduct e-sign',
    icon: FileSignature,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'it-assets',
    number: 9,
    label: '9. IT, Asset & Access',
    subtitle: 'Laptop, ID/Access card, corporate email & VPN/SSO',
    icon: Laptop,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'payroll-handoff',
    number: 10,
    label: '10. Payroll & Statutory Setup',
    subtitle: 'Salary structure, PF/ESI, tax regime & 1st payroll gate',
    icon: Wallet,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'induction',
    number: 11,
    label: '11. Orientation & Induction',
    subtitle: 'Batch induction schedules, speaker slots & attendance',
    icon: Calendar,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'training',
    number: 12,
    label: '12. Training & Learning (LMS)',
    subtitle: 'Mandatory compliance courses & LMS progress sync',
    icon: GraduationCap,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'buddy',
    number: 13,
    label: '13. Buddy & Mentor Match',
    subtitle: 'Peer buddy recommendations & check-in cadence',
    icon: HeartHandshake,
    iconBg: 'bg-amber-50 dark:bg-amber-950/60',
    iconColor: 'text-amber-600 dark:text-amber-400',
  },
  {
    id: 'day-one',
    number: 14,
    label: '14. Day-1 & Welcome Kit',
    subtitle: 'Swag kit dispatch, digital ID & Day-1 attendance',
    icon: Gift,
    iconBg: 'bg-teal-50 dark:bg-teal-950/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
  {
    id: 'probation',
    number: 15,
    label: '15. Probation & Confirmation',
    subtitle: '30/60/90-day check-ins, confirmation & letters',
    icon: Award,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'surveys',
    number: 16,
    label: '16. Feedback & Pulse Surveys',
    subtitle: 'Day-1, Week-1, Day-30 & Day-90 eNPS sentiment',
    icon: MessageSquareHeart,
    iconBg: 'bg-pink-50 dark:bg-pink-950/60',
    iconColor: 'text-pink-600 dark:text-pink-400',
  },
  {
    id: 'communications',
    number: 17,
    label: '17. Communication Center',
    subtitle: 'Email, SMS & WhatsApp pre-boarding engagement logs',
    icon: Send,
    iconBg: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColor: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'approvals',
    number: 18,
    label: '18. Approvals Workflow',
    subtitle: 'DOJ change, asset exception & probation approvals',
    icon: ShieldCheck,
    iconBg: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'reports',
    number: 19,
    label: '19. Reports & Analytics',
    subtitle: '9 pre-built MIS & statutory readiness exports',
    icon: BarChart3,
    iconBg: 'bg-sky-50 dark:bg-sky-950/60',
    iconColor: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'settings',
    number: 20,
    label: '20. Settings & Automation',
    subtitle: 'ID prefix, probation rules & 12 automation triggers',
    icon: Settings,
    iconBg: 'bg-slate-100 dark:bg-slate-800',
    iconColor: 'text-slate-700 dark:text-slate-300',
  },
  {
    id: 'audit-logs',
    number: 21,
    label: '21. Audit Logs',
    subtitle: 'Immutable verification, ID reveal & status history',
    icon: History,
    iconBg: 'bg-violet-50 dark:bg-violet-950/60',
    iconColor: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'notifications',
    number: 22,
    label: '22. Notifications',
    subtitle: 'Real-time onboarding & SLA escalation alerts',
    icon: Bell,
    iconBg: 'bg-orange-50 dark:bg-orange-950/60',
    iconColor: 'text-orange-500 dark:text-orange-400',
  },
  {
    id: 'manager-portal',
    number: 23,
    label: '23. Manager Onboarding Portal',
    subtitle: 'Upcoming team joiners, 30-60-90 goals & reviews',
    icon: UsersRound,
    iconBg: 'bg-blue-50 dark:bg-blue-950/60',
    iconColor: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'joiner-portal',
    number: 24,
    label: '24. New Joiner Self-Service',
    subtitle: 'Pre-boarding checklist, docs, policy e-sign & FAQ',
    icon: UserCheck,
    iconBg: 'bg-teal-50 dark:bg-teal-950/60',
    iconColor: 'text-teal-600 dark:text-teal-400',
  },
];

const ONBOARDING_DIRECTORY_GROUPS: OnboardingModuleMeta[][] = [
  ONBOARDING_MODULES_REGISTRY.slice(0, 6),
  ONBOARDING_MODULES_REGISTRY.slice(6, 12),
  ONBOARDING_MODULES_REGISTRY.slice(12, 18),
  ONBOARDING_MODULES_REGISTRY.slice(18, 24),
];

export interface OnboardingWorkspaceShellProps {
  initialModule?: OnboardingModuleId;
  embedded?: boolean;
  startInDirectory?: boolean;
}

export function OnboardingWorkspaceShell({
  initialModule = 'dashboard',
  embedded = false,
  startInDirectory = false,
}: OnboardingWorkspaceShellProps) {
  const [activeModule, setActiveModule] =
    useState<OnboardingModuleId>(initialModule);
  const [viewMode, setViewMode] = useState<'directory' | 'module'>(
    startInDirectory ? 'directory' : 'module'
  );
  const [role, setRole] = useState<OnboardingRole>('hr_admin');
  const [toast, setToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast((prev) => (prev === msg ? null : prev));
    }, 3500);
  };

  const activeMeta =
    ONBOARDING_MODULES_REGISTRY.find((m) => m.id === activeModule) ??
    ONBOARDING_MODULES_REGISTRY[0];

  const handleSelectModule = (id: OnboardingModuleId) => {
    setActiveModule(id);
    setViewMode('module');
  };

  return (
    <div
      className={
        embedded
          ? 'space-y-3'
          : 'min-h-screen bg-slate-100/80 dark:bg-slate-950 text-slate-900 dark:text-slate-100'
      }
    >
      <div
        className={
          embedded
            ? 'space-y-3'
            : 'mx-auto max-w-[440px] min-h-screen bg-slate-50/90 dark:bg-slate-950 border-x border-slate-200/80 dark:border-slate-800/80 shadow-xl px-3.5 py-4 space-y-3.5'
        }
      >
        {/* Top Bar with Role Switcher */}
        <div className="rounded-2xl border border-slate-200/90 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 p-3.5 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {!embedded && (
                <Link
                  href="/"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  title="Back to HRMS Home"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Link>
              )}
              <div>
                <h1 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                  Onboarding Suite (24 Modules)
                </h1>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Pre-Boarding to Probation Confirmation · Typed API
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
              <select
                aria-label="Onboarding Role Switcher"
                value={role}
                onChange={(e) => setRole(e.target.value as OnboardingRole)}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1 text-[11px] font-semibold text-slate-700 dark:text-slate-200"
              >
                {(Object.keys(ONBOARDING_ROLE_LABELS) as OnboardingRole[]).map(
                  (r) => (
                    <option key={r} value={r}>
                      Role: {ONBOARDING_ROLE_LABELS[r]}
                    </option>
                  )
                )}
              </select>
            </div>
          </div>

          {viewMode === 'module' && (
            <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2 min-w-0">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-xl ${activeMeta.iconBg} ${activeMeta.iconColor}`}
                >
                  <activeMeta.icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {activeMeta.label}
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {activeMeta.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setViewMode('directory')}
                className="inline-flex shrink-0 items-center gap-1 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1.5 text-[11px] font-bold text-indigo-600 dark:text-indigo-300 hover:bg-indigo-100"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> All 24 Modules
              </button>
            </div>
          )}
        </div>

        {/* Toast notification */}
        {toast && (
          <div className="rounded-xl bg-slate-900 dark:bg-indigo-600 text-white px-3.5 py-2.5 text-xs font-semibold shadow-md flex items-center justify-between">
            <span>{toast}</span>
            <button
              type="button"
              onClick={() => setToast(null)}
              className="text-[10px] underline opacity-80"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Directory View: 4 Cards x 6 Modules = 24 Modules */}
        {viewMode === 'directory' ? (
          <div className="space-y-3">
            {ONBOARDING_DIRECTORY_GROUPS.map((group, groupIndex) => (
              <div
                key={groupIndex}
                className="rounded-3xl border border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 p-2 shadow-sm divide-y divide-slate-100 dark:divide-slate-800/70"
              >
                {group.map((mod) => {
                  const IconComponent = mod.icon;
                  const isSelected = mod.id === activeModule;
                  return (
                    <button
                      key={mod.id}
                      type="button"
                      onClick={() => handleSelectModule(mod.id)}
                      className={`w-full flex items-center justify-between gap-3 px-2.5 py-2.5 text-left transition rounded-2xl ${
                        isSelected
                          ? 'bg-indigo-50/60 dark:bg-indigo-950/30'
                          : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${mod.iconBg} ${mod.iconColor}`}
                        >
                          <IconComponent className="h-5 w-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[13px] font-bold text-slate-900 dark:text-white leading-tight truncate">
                            {mod.label}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight mt-0.5 truncate">
                            {mod.subtitle}
                          </p>
                        </div>
                      </div>
                      <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-50/80 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400">
                        <ChevronRight className="h-4 w-4" />
                      </span>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        ) : (
          /* Active Module Workspace */
          <div>
            {activeModule === 'dashboard' && (
              <OnboardingDashboardModule
                onToast={notify}
                onNavigateModule={handleSelectModule}
              />
            )}
            {activeModule === 'joiners' && (
              <JoinerManagementModule onToast={notify} />
            )}
            {activeModule === 'workflows' && (
              <OnboardingWorkflowsModule onToast={notify} />
            )}
            {activeModule === 'tasks' && (
              <TaskManagementModule onToast={notify} />
            )}
            {activeModule === 'documents' && (
              <DocumentCollectionModule onToast={notify} />
            )}
            {activeModule === 'joining-forms' && (
              <EmployeeDataCollectionModule onToast={notify} />
            )}
            {activeModule === 'offer-handoff' && (
              <OfferToJoiningHandoffModule onToast={notify} />
            )}
            {activeModule === 'policies' && (
              <PolicyAcknowledgementModule onToast={notify} />
            )}
            {activeModule === 'it-assets' && (
              <ItAssetProvisioningModule role={role} notify={notify} />
            )}
            {activeModule === 'payroll-handoff' && (
              <PayrollStatutoryHandoffModule role={role} notify={notify} />
            )}
            {activeModule === 'induction' && (
              <OrientationInductionModule role={role} notify={notify} />
            )}
            {activeModule === 'training' && (
              <TrainingLearningModule role={role} notify={notify} />
            )}
            {activeModule === 'buddy' && (
              <BuddyMentorModule role={role} notify={notify} />
            )}
            {activeModule === 'day-one' && (
              <DayOneWelcomeKitModule role={role} notify={notify} />
            )}
            {activeModule === 'probation' && (
              <ProbationTrackingModule role={role} notify={notify} />
            )}
            {activeModule === 'surveys' && (
              <FeedbackPulseSurveysModule role={role} notify={notify} />
            )}
            {activeModule === 'communications' && (
              <OnboardingCommunicationCenterModule
                role={role}
                notify={notify}
              />
            )}
            {activeModule === 'approvals' && (
              <OnboardingApprovalsModule role={role} notify={notify} />
            )}
            {activeModule === 'reports' && (
              <OnboardingReportsModule role={role} notify={notify} />
            )}
            {activeModule === 'settings' && (
              <OnboardingSettingsAutomationModule
                role={role}
                notify={notify}
              />
            )}
            {activeModule === 'audit-logs' && (
              <OnboardingAuditLogsModule role={role} notify={notify} />
            )}
            {activeModule === 'notifications' && (
              <OnboardingNotificationsModule role={role} notify={notify} />
            )}
            {activeModule === 'manager-portal' && (
              <OnboardingManagerPortalModule role={role} notify={notify} />
            )}
            {activeModule === 'joiner-portal' && (
              <NewJoinerPortalModule role={role} notify={notify} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
