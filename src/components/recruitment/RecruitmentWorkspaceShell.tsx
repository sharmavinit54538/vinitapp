'use client';

import React, { useState } from 'react';
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
  ChevronRight,
  CheckCircle2,
  ArrowLeft,
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
  onBackFromEmbedded,
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
  const [roleOverride, setRoleOverride] = useState<RecruitmentRole | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const perms = useRecruitmentPermission(roleOverride);

  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg(null);
    }, 3400);
  };

  const handleRoleChange = (nextRole: RecruitmentRole) => {
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

  const renderDirectoryCards = () => (
    <div className="space-y-3.5" data-testid="recruitment-23-modules-directory">
      {CARD_GROUPS.map((groupNum) => {
        const groupItems = RECRUITMENT_MODULES_REGISTRY.filter(
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
                  <div
                    className={`w-11 h-11 rounded-2xl shrink-0 flex items-center justify-center ${item.iconBgClass} ${item.iconColorClass}`}
                  >
                    <ItemIcon className="w-5 h-5 stroke-[2.2]" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="text-[14px] font-bold text-slate-900 dark:text-white leading-snug truncate">
                      {item.label}
                    </div>
                    <div className="text-[12px] font-medium text-slate-500 dark:text-slate-400 leading-snug truncate mt-0.5">
                      {item.subtitle}
                    </div>
                  </div>

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
                  <span>All 23 Modules</span>
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
                    OFC360 RECRUITMENT & ATS
                  </span>
                  <span className="text-xs text-slate-400">/</span>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">
                    {viewMode === 'directory' ? '23 Recruitment Modules' : activeMeta.label}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  23-Module Enterprise Talent Acquisition & ATS Suite · Zero Client-Side AI/Math · REST API Driven
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <label
                htmlFor="recruitment-rbac-role-select"
                className="text-[11px] font-semibold text-slate-500"
              >
                Active Role:
              </label>
              <select
                id="recruitment-rbac-role-select"
                value={perms.role}
                onChange={(e) => handleRoleChange(e.target.value as RecruitmentRole)}
                className="h-9 px-3 rounded-xl text-xs font-semibold bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
              >
                <option value="super_admin">Super Admin</option>
                <option value="hr_admin">HR Admin</option>
                <option value="recruiter">Recruiter</option>
                <option value="hiring_manager">Hiring Manager</option>
                <option value="interviewer">Interviewer</option>
                <option value="approver">Approver</option>
                <option value="candidate">Candidate</option>
              </select>
            </div>
          </div>
        </header>
      ) : null}

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
          <div className="rounded-3xl px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between gap-3">
            <button
              type="button"
              onClick={() => setViewMode('directory')}
              className="h-9 px-3.5 rounded-xl bg-indigo-50 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 text-xs font-bold inline-flex items-center gap-1.5"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>23 Recruitment Modules</span>
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

          <section className="w-full min-w-0">
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
        </div>
      )}
    </div>
  );
}
