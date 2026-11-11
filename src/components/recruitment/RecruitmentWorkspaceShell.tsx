'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Gauge,
  FileSpreadsheet,
  Megaphone,
  Globe,
  Users,
  Sparkles,
  Kanban,
  ClipboardList,
  CalendarClock,
  Video,
  Star,
  FileSignature,
  ShieldCheck,
  UserCheck,
  Share2,
  Building2,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
  History,
  Bell,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  Search,
  X,
  Grid,
} from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setActiveRole } from '@/lib/store';
import { Ofc360Role } from '@/lib/auth-schemas';
import { RecruitmentModuleId, RecruitmentRole } from '../../types/recruitment';
import {
  useRecruitmentPermission,
  canRecruitmentRoleAccessModule,
} from '../../hooks/useRecruitmentPermission';
import {
  RecruitmentDashboardModule,
  ManpowerRequisitionsModule,
  JobPostingSourcingModule,
  CareerPageCandidatePortalModule,
  CandidateDatabaseModule,
  ResumeParsingAiScreeningModule,
} from './RecruitmentCoreModules';
import {
  ApplicationPipelineModule,
  AssessmentsTestsModule,
  InterviewSchedulingModule,
  AiVideoInterviewModule,
  EvaluationScorecardsModule,
  OfferManagementModule,
  BackgroundVerificationModule,
  OnboardingHandoffModule,
} from './RecruitmentPipelineAndEvalModules';
import {
  ReferralsModule,
  VendorsAgenciesModule,
  CommunicationCenterModule,
  RecruitmentApprovalsModule,
  RecruitmentReportsModule,
  RecruitmentSettingsAutomationModule,
  RecruitmentAuditLogsModule,
  RecruitmentNotificationsModule,
  HiringManagerPortalModule,
} from './RecruitmentOpsAndGovernanceModules';

export interface RecruitmentNavModuleItem {
  id: RecruitmentModuleId;
  number: number;
  label: string;
  shortLabel: string;
  subtitle: string;
  cardGroup: 1 | 2 | 3 | 4;
  Icon: React.ComponentType<{ className?: string }>;
  iconBgClass: string;
  iconColorClass: string;
}

export const RECRUITMENT_MODULES_REGISTRY: RecruitmentNavModuleItem[] = [
  {
    id: 'dashboard',
    number: 1,
    label: '1. Recruitment Dashboard',
    shortLabel: 'Dashboard',
    subtitle: 'Funnel KPIs, source ROI & SLA alerts',
    cardGroup: 1,
    Icon: Gauge,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'requisitions',
    number: 2,
    label: '2. Manpower & Requisitions',
    shortLabel: 'Requisitions',
    subtitle: 'Headcount budget, AI JD & approvals',
    cardGroup: 1,
    Icon: FileSpreadsheet,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'job-postings',
    number: 3,
    label: '3. Job Posting & Sourcing',
    shortLabel: 'Job Postings',
    subtitle: 'Multi-channel boards & bulk resumes',
    cardGroup: 1,
    Icon: Megaphone,
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'career-portal',
    number: 4,
    label: '4. Career Page & Portal',
    shortLabel: 'Career Portal',
    subtitle: 'Public jobs, OTP tracker & e-sign',
    cardGroup: 1,
    Icon: Globe,
    iconBgClass: 'bg-sky-50 dark:bg-sky-950/60',
    iconColorClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'candidates',
    number: 5,
    label: '5. Candidate Database',
    shortLabel: 'Talent Pool',
    subtitle: '360° profiles, PII mask & merge',
    cardGroup: 1,
    Icon: Users,
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/60',
    iconColorClass: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'resume-screening',
    number: 6,
    label: '6. Resume Parsing & AI Screening',
    shortLabel: 'AI Screening',
    subtitle: 'Match scores, knockouts & blind mode',
    cardGroup: 1,
    Icon: Sparkles,
    iconBgClass: 'bg-violet-50 dark:bg-violet-950/60',
    iconColorClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'pipeline',
    number: 7,
    label: '7. Application Pipeline',
    shortLabel: 'Pipeline',
    subtitle: 'Kanban & table view with SLA timers',
    cardGroup: 2,
    Icon: Kanban,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'assessments',
    number: 8,
    label: '8. Assessments & Tests',
    shortLabel: 'Assessments',
    subtitle: 'Coding, MCQ, psychometric & proctoring',
    cardGroup: 2,
    Icon: ClipboardList,
    iconBgClass: 'bg-rose-50 dark:bg-rose-950/60',
    iconColorClass: 'text-rose-600 dark:text-rose-400',
  },
  {
    id: 'interviews',
    number: 9,
    label: '9. Interview Scheduling',
    shortLabel: 'Interviews',
    subtitle: 'Auto-slots, panel calendar & reminders',
    cardGroup: 2,
    Icon: CalendarClock,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'video-interviews',
    number: 10,
    label: '10. AI Video Interview',
    shortLabel: 'AI Video',
    subtitle: 'Async recording, transcript & AI score',
    cardGroup: 2,
    Icon: Video,
    iconBgClass: 'bg-orange-50 dark:bg-orange-950/60',
    iconColorClass: 'text-orange-500 dark:text-orange-400',
  },
  {
    id: 'scorecards',
    number: 11,
    label: '11. Evaluation & Scorecards',
    shortLabel: 'Scorecards',
    subtitle: 'Competency rubrics & panel calibration',
    cardGroup: 2,
    Icon: Star,
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/60',
    iconColorClass: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'offers',
    number: 12,
    label: '12. Offer Management',
    shortLabel: 'Offers',
    subtitle: 'CTC breakup, approvals, PDF & e-sign',
    cardGroup: 2,
    Icon: FileSignature,
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'bgv',
    number: 13,
    label: '13. Background Verification',
    shortLabel: 'BGV',
    subtitle: '6-point checks, vendor sync & clearance',
    cardGroup: 3,
    Icon: ShieldCheck,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-600 dark:text-indigo-400',
  },
  {
    id: 'onboarding-handoff',
    number: 14,
    label: '14. Onboarding Handoff',
    shortLabel: 'Onboarding',
    subtitle: 'Convert to employee, IT & payroll sync',
    cardGroup: 3,
    Icon: UserCheck,
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'referrals',
    number: 15,
    label: '15. Referrals',
    shortLabel: 'Referrals',
    subtitle: 'Employee referrals, bonus & leaderboard',
    cardGroup: 3,
    Icon: Share2,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'vendors',
    number: 16,
    label: '16. Vendors / Agencies',
    shortLabel: 'Agencies',
    subtitle: 'Staffing partners, SLA & fee invoices',
    cardGroup: 3,
    Icon: Building2,
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/60',
    iconColorClass: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'communications',
    number: 17,
    label: '17. Communication Center',
    shortLabel: 'Communications',
    subtitle: 'Email, SMS, WhatsApp & stage triggers',
    cardGroup: 3,
    Icon: MessageSquare,
    iconBgClass: 'bg-sky-50 dark:bg-sky-950/60',
    iconColorClass: 'text-sky-600 dark:text-sky-400',
  },
  {
    id: 'approvals',
    number: 18,
    label: '18. Approvals Workflow',
    shortLabel: 'Approvals',
    subtitle: 'Requisition, offer & exception inbox',
    cardGroup: 3,
    Icon: CheckSquare,
    iconBgClass: 'bg-emerald-50 dark:bg-emerald-950/60',
    iconColorClass: 'text-emerald-600 dark:text-emerald-400',
  },
  {
    id: 'reports',
    number: 19,
    label: '19. Reports & Analytics',
    shortLabel: 'Reports',
    subtitle: 'Funnel, ROI, TAT & scheduled exports',
    cardGroup: 4,
    Icon: BarChart3,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'settings',
    number: 20,
    label: '20. Settings & Automation Rules',
    shortLabel: 'Settings',
    subtitle: 'SLAs, auto-rules, GDPR/DPDP & integrations',
    cardGroup: 4,
    Icon: Settings,
    iconBgClass: 'bg-indigo-50 dark:bg-indigo-950/60',
    iconColorClass: 'text-indigo-700 dark:text-indigo-400',
  },
  {
    id: 'audit-logs',
    number: 21,
    label: '21. Audit Logs',
    shortLabel: 'Audit Logs',
    subtitle: 'Immutable actor, PII reveal & IP trail',
    cardGroup: 4,
    Icon: History,
    iconBgClass: 'bg-violet-50 dark:bg-violet-950/60',
    iconColorClass: 'text-violet-600 dark:text-violet-400',
  },
  {
    id: 'notifications',
    number: 22,
    label: '22. Notifications',
    shortLabel: 'Notifications',
    subtitle: 'Real-time recruitment & SLA alerts',
    cardGroup: 4,
    Icon: Bell,
    iconBgClass: 'bg-amber-50 dark:bg-amber-950/60',
    iconColorClass: 'text-amber-500 dark:text-amber-400',
  },
  {
    id: 'hiring-manager',
    number: 23,
    label: '23. Hiring Manager Portal',
    shortLabel: 'Hiring Manager',
    subtitle: 'Team requisitions, reviews & offer sign-off',
    cardGroup: 4,
    Icon: Briefcase,
    iconBgClass: 'bg-blue-50 dark:bg-blue-950/60',
    iconColorClass: 'text-blue-600 dark:text-blue-400',
  },
];

const CARD_GROUPS: (1 | 2 | 3 | 4)[] = [1, 2, 3, 4];

export function RecruitmentWorkspaceShell({
  initialModule = 'dashboard',
  startInDirectory = false,
  embedded = false,
  onBackFromEmbedded: _onBackFromEmbedded,
}: {
  initialModule?: RecruitmentModuleId;
  startInDirectory?: boolean;
  embedded?: boolean;
  onBackFromEmbedded?: () => void;
}) {
  const dispatch = useDispatch();
  const [activeModule, setActiveModule] = useState<RecruitmentModuleId>(initialModule);
  const [viewMode, setViewMode] = useState<'directory' | 'module'>(
    startInDirectory ? 'directory' : 'module'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [roleOverride, setRoleOverride] = useState<RecruitmentRole | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const perms = useRecruitmentPermission(roleOverride);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3400);
  };

  const _handleRoleChange = (nextRole: RecruitmentRole) => {
    setRoleOverride(nextRole);
    const mappedStoreRole: Ofc360Role =
      nextRole === 'super_admin'
        ? 'super_admin'
        : nextRole === 'hr_admin' || nextRole === 'recruiter'
        ? 'hr_admin'
        : nextRole === 'approver'
        ? 'executive'
        : nextRole === 'hiring_manager' || nextRole === 'interviewer'
        ? 'manager'
        : 'employee';
    dispatch(setActiveRole(mappedStoreRole));
    if (!canRecruitmentRoleAccessModule(nextRole, activeModule)) {
      setActiveModule(nextRole === 'candidate' ? 'career-portal' : 'dashboard');
    }
  };

  const handleOpenModule = (id: RecruitmentModuleId) => {
    setActiveModule(id);
    setViewMode('module');
  };

  const activeMeta =
    RECRUITMENT_MODULES_REGISTRY.find((m) => m.id === activeModule) ||
    RECRUITMENT_MODULES_REGISTRY[0];

  const queryTrimmed = searchQuery.toLowerCase().trim();
  const filteredModules = RECRUITMENT_MODULES_REGISTRY.filter((m) => {
    return (
      !queryTrimmed ||
      m.label.toLowerCase().includes(queryTrimmed) ||
      m.shortLabel.toLowerCase().includes(queryTrimmed) ||
      m.subtitle.toLowerCase().includes(queryTrimmed)
    );
  });

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
      <div className="space-y-3.5" data-testid="recruitment-23-modules-directory">
        {CARD_GROUPS.map((groupNum) => {
          const groupItems = filteredModules.filter(
            (m) => m.cardGroup === groupNum
          );
          if (groupItems.length === 0) return null;

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
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3.5 transition active:scale-[0.99] hover:bg-slate-50/80 dark:hover:bg-slate-800/50 cursor-pointer ${
                      hasAccess ? '' : 'opacity-60'
                    }`}
                  >
                    <div
                      className={`w-10 h-10 rounded-2xl shrink-0 flex items-center justify-center ${item.iconBgClass} ${item.iconColorClass}`}
                    >
                      <ItemIcon className="w-5 h-5 stroke-[2.2]" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-bold text-slate-900 dark:text-white leading-snug truncate">
                        {item.label}
                      </div>
                      <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-snug truncate mt-0.5">
                        {item.subtitle}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      className={
        embedded
          ? 'space-y-3 text-slate-900 dark:text-white font-sans'
          : 'min-h-screen bg-slate-100 dark:bg-slate-950 flex justify-center text-slate-900 dark:text-white font-sans antialiased'
      }
    >
      <div
        className={
          embedded
            ? 'w-full space-y-3'
            : 'w-full max-w-[440px] min-h-screen bg-slate-50 dark:bg-slate-900 border-x border-slate-200 dark:border-slate-800 flex flex-col shadow-sm'
        }
      >
        {toastMsg ? (
          <div
            role="status"
            className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 rounded-2xl bg-slate-900 text-white px-4 py-2.5 text-xs font-semibold shadow-xl flex items-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </div>
        ) : null}

        {/* 1. STICKY MOBILE TOP APP BAR (Standalone /recruitment route) */}
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
        <main className={embedded ? 'space-y-3.5' : 'flex-1 p-3.5 space-y-3.5 overflow-x-hidden'}>
          {/* App-style "← Back to All Modules" bar when standalone (!embedded) */}
          {!embedded && (
            <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2.5 shadow-2xs">
              <Link
                href="/?tab=more"
                className="min-h-[40px] px-3.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-indigo-600 dark:text-indigo-400 text-xs font-semibold inline-flex items-center justify-center hover:bg-indigo-50/60 transition-colors"
              >
                ← Back to All Modules
              </Link>
              <span className="text-[15px] font-bold text-slate-900 dark:text-white">
                Recruitment
              </span>
            </div>
          )}

          {viewMode === 'directory' ? (
            <>
              {/* Clean Search Card */}
              <div className="rounded-2xl p-2.5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-2xs">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search 23 recruitment modules..."
                    className="w-full h-9 pl-8.5 pr-8 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
              </div>

              {renderDirectoryCards()}
            </>
          ) : (
            <section className="w-full min-w-0 space-y-3.5">
              {/* Sub-module Back Bar to return to Recruitment Modules list */}
              <div className="rounded-3xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-2.5 shadow-2xs">
                <button
                  type="button"
                  onClick={() => setViewMode('directory')}
                  className="min-h-[38px] px-3.5 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold inline-flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Recruitment Modules</span>
                </button>

                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className={`w-7 h-7 rounded-xl shrink-0 flex items-center justify-center ${activeMeta.iconBgClass} ${activeMeta.iconColorClass}`}
                  >
                    <activeMeta.Icon className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right min-w-0">
                    <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {activeMeta.label}
                    </div>
                  </div>
                </div>
              </div>

              {activeModule === 'dashboard' ? (
                <RecruitmentDashboardModule
                  onNavigateModule={(mod) => handleOpenModule(mod)}
                  onToast={triggerToast}
                />
              ) : null}
              {activeModule === 'requisitions' ? (
                <ManpowerRequisitionsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'job-postings' ? (
                <JobPostingSourcingModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'career-portal' ? (
                <CareerPageCandidatePortalModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'candidates' ? (
                <CandidateDatabaseModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'resume-screening' ? (
                <ResumeParsingAiScreeningModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'pipeline' ? (
                <ApplicationPipelineModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'assessments' ? (
                <AssessmentsTestsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'interviews' ? (
                <InterviewSchedulingModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'video-interviews' ? (
                <AiVideoInterviewModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'scorecards' ? (
                <EvaluationScorecardsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'offers' ? (
                <OfferManagementModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'bgv' ? (
                <BackgroundVerificationModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'onboarding-handoff' ? (
                <OnboardingHandoffModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'referrals' ? (
                <ReferralsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'vendors' ? (
                <VendorsAgenciesModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'communications' ? (
                <CommunicationCenterModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'approvals' ? (
                <RecruitmentApprovalsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'reports' ? (
                <RecruitmentReportsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'settings' ? (
                <RecruitmentSettingsAutomationModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'audit-logs' ? (
                <RecruitmentAuditLogsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'notifications' ? (
                <RecruitmentNotificationsModule onToast={triggerToast} />
              ) : null}
              {activeModule === 'hiring-manager' ? (
                <HiringManagerPortalModule onToast={triggerToast} />
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
                isActive: viewMode === 'directory',
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
                id: 'pipeline',
                label: 'Pipeline',
                Icon: Kanban,
                isActive: viewMode === 'module' && activeModule === 'pipeline',
                onTap: () => handleOpenModule('pipeline'),
              },
              {
                id: 'candidates',
                label: 'Candidates',
                Icon: Users,
                isActive: viewMode === 'module' && activeModule === 'candidates',
                onTap: () => handleOpenModule('candidates'),
              },
              {
                id: 'interviews',
                label: 'Interviews',
                Icon: CalendarClock,
                isActive: viewMode === 'module' && activeModule === 'interviews',
                onTap: () => handleOpenModule('interviews'),
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
