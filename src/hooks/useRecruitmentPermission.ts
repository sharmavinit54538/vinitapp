import { useSelector } from 'react-redux';
import { RootState } from '../../lib/store';
import { RecruitmentModuleId, RecruitmentRole } from '../types/recruitment';

const MODULE_ACCESS_BY_ROLE: Record<RecruitmentRole, RecruitmentModuleId[]> = {
  super_admin: [
    'dashboard',
    'requisitions',
    'job-postings',
    'career-portal',
    'candidates',
    'resume-screening',
    'pipeline',
    'assessments',
    'interviews',
    'video-interviews',
    'scorecards',
    'offers',
    'bgv',
    'onboarding-handoff',
    'referrals',
    'vendors',
    'communications',
    'approvals',
    'reports',
    'settings',
    'audit-logs',
    'notifications',
    'hiring-manager',
  ],
  hr_admin: [
    'dashboard',
    'requisitions',
    'job-postings',
    'career-portal',
    'candidates',
    'resume-screening',
    'pipeline',
    'assessments',
    'interviews',
    'video-interviews',
    'scorecards',
    'offers',
    'bgv',
    'onboarding-handoff',
    'referrals',
    'vendors',
    'communications',
    'approvals',
    'reports',
    'settings',
    'audit-logs',
    'notifications',
    'hiring-manager',
  ],
  recruiter: [
    'dashboard',
    'requisitions',
    'job-postings',
    'career-portal',
    'candidates',
    'resume-screening',
    'pipeline',
    'assessments',
    'interviews',
    'video-interviews',
    'scorecards',
    'offers',
    'bgv',
    'onboarding-handoff',
    'referrals',
    'vendors',
    'communications',
    'reports',
    'notifications',
  ],
  hiring_manager: [
    'dashboard',
    'requisitions',
    'candidates',
    'resume-screening',
    'pipeline',
    'assessments',
    'interviews',
    'video-interviews',
    'scorecards',
    'offers',
    'referrals',
    'approvals',
    'reports',
    'notifications',
    'hiring-manager',
  ],
  interviewer: [
    'interviews',
    'video-interviews',
    'scorecards',
    'referrals',
    'notifications',
  ],
  approver: [
    'dashboard',
    'requisitions',
    'offers',
    'approvals',
    'reports',
    'notifications',
  ],
  candidate: [
    'career-portal',
    'assessments',
    'video-interviews',
    'notifications',
  ],
};

export function normalizeToRecruitmentRole(rawRole?: string | null): RecruitmentRole {
  if (!rawRole) return 'super_admin';
  const normalized = rawRole.toLowerCase().trim();
  if (normalized === 'super_admin') return 'super_admin';
  if (normalized === 'hr_admin') return 'hr_admin';
  if (normalized === 'recruiter') return 'recruiter';
  if (normalized === 'hiring_manager' || normalized === 'manager') {
    return 'hiring_manager';
  }
  if (normalized === 'interviewer') return 'interviewer';
  if (normalized === 'approver' || normalized === 'executive') {
    return 'approver';
  }
  if (normalized === 'candidate' || normalized === 'employee') {
    return 'candidate';
  }
  return 'super_admin';
}

export function canRecruitmentRoleAccessModule(
  role: RecruitmentRole,
  moduleId: RecruitmentModuleId
): boolean {
  const allowed = MODULE_ACCESS_BY_ROLE[role] || [];
  return allowed.includes(moduleId);
}

export interface RecruitmentPermissionsMatrix {
  role: RecruitmentRole;
  canAccessModule: (moduleId: RecruitmentModuleId) => boolean;
  canRevealPii: boolean;
  canManageRequisitions: boolean;
  canPublishJobs: boolean;
  canOverrideAiScreening: boolean;
  canMovePipeline: boolean;
  canScheduleInterviews: boolean;
  canSubmitScorecards: boolean;
  canManageOffers: boolean;
  canInitiateBgv: boolean;
  canTriggerOnboarding: boolean;
  canApproveWorkflow: boolean;
  canConfigureSettings: boolean;
}

export function computeRecruitmentPermissions(
  role: RecruitmentRole
): RecruitmentPermissionsMatrix {
  return {
    role,
    canAccessModule: (moduleId: RecruitmentModuleId) =>
      canRecruitmentRoleAccessModule(role, moduleId),
    canRevealPii:
      role === 'super_admin' || role === 'hr_admin' || role === 'recruiter',
    canManageRequisitions:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'recruiter' ||
      role === 'hiring_manager',
    canPublishJobs:
      role === 'super_admin' || role === 'hr_admin' || role === 'recruiter',
    canOverrideAiScreening:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'recruiter' ||
      role === 'hiring_manager',
    canMovePipeline:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'recruiter' ||
      role === 'hiring_manager',
    canScheduleInterviews:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'recruiter' ||
      role === 'hiring_manager',
    canSubmitScorecards:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'recruiter' ||
      role === 'hiring_manager' ||
      role === 'interviewer',
    canManageOffers:
      role === 'super_admin' || role === 'hr_admin' || role === 'recruiter',
    canInitiateBgv:
      role === 'super_admin' || role === 'hr_admin' || role === 'recruiter',
    canTriggerOnboarding: role === 'super_admin' || role === 'hr_admin',
    canApproveWorkflow:
      role === 'super_admin' ||
      role === 'hr_admin' ||
      role === 'approver' ||
      role === 'hiring_manager',
    canConfigureSettings: role === 'super_admin' || role === 'hr_admin',
  };
}

export function useRecruitmentPermission(
  overrideRole?: RecruitmentRole | null
): RecruitmentPermissionsMatrix {
  const storeRole = useSelector((state: RootState) => state.hrMobileUi?.activeRole);
  const resolvedRole = overrideRole || normalizeToRecruitmentRole(storeRole);
  return computeRecruitmentPermissions(resolvedRole);
}
