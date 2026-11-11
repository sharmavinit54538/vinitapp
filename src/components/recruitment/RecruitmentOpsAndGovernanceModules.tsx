'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Share2,
  Building2,
  MessageSquare,
  CheckSquare,
  BarChart3,
  Settings,
  History,
  Bell,
  Briefcase,
  Download,
} from 'lucide-react';
import {
  ReferralsWorkspaceResponse,
  VendorAgencyRecord,
  CommunicationTemplateRecord,
  CommunicationLogRecord,
  RecruitmentApprovalItem,
  RecruitmentReportDefinition,
  RecruitmentReportRunResponse,
  RecruitmentSettingsResponse,
  RecruitmentAuditLogRecord,
  RecruitmentNotificationRecord,
  HiringManagerWorkspaceResponse,
} from '../../types/recruitment';
import {
  recruitmentReferralsApi,
  recruitmentVendorsApi,
  recruitmentCommunicationsApi,
  recruitmentApprovalsApi,
  recruitmentReportsApi,
  recruitmentSettingsApi,
  recruitmentAuditLogsApi,
  recruitmentNotificationsApi,
  recruitmentHiringManagerApi,
} from '../../services/recruitment';
import { formatRecruitmentCurrency } from '../../services/recruitment/client';
import { useRecruitmentPermission } from '../../hooks/useRecruitmentPermission';
import {
  RecruitmentSkeletonBlock,
  RecruitmentErrorState,
  RecruitmentEmptyState,
  RecruitmentPermissionDeniedState,
  RecruitmentModal,
} from './RecruitmentPrimitives';

// ============================================================================
// MODULE 15: REFERRALS
// ============================================================================
export function ReferralsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [workspace, setWorkspace] = useState<ReferralsWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [referOpen, setReferOpen] = useState(false);

  const [jobId, setJobId] = useState('');
  const [candidateName, setCandidateName] = useState('');
  const [candidateEmail, setCandidateEmail] = useState('');
  const [candidatePhone, setCandidatePhone] = useState('');
  const [relationshipNote, setRelationshipNote] = useState('');

  const loadReferrals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentReferralsApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load referrals'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('referrals')) return;
    const timer = setTimeout(() => {
      void loadReferrals();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadReferrals]);

  const handleSubmitReferral = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentReferralsApi.submitReferral({
        jobId: jobId.trim(),
        candidateName: candidateName.trim(),
        candidateEmail: candidateEmail.trim(),
        candidatePhone: candidatePhone.trim(),
        relationshipNote: relationshipNote.trim(),
      });
      setReferOpen(false);
      onToast('Employee referral submitted');
      void loadReferrals();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Referral submission failed');
    }
  };

  if (!perms.canAccessModule('referrals')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="15. Employee Referrals"
        requiredRoles="Internal Employee / Recruiter / HR Admin / Super Admin"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Employee Referrals, Bonus Eligibility & Leaderboard
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Submit referrals, track stage progress, bonus cooling period & payout status
          </p>
        </div>
        <button
          type="button"
          onClick={() => setReferOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Submit Employee Referral</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Employee Referrals API Error"
          error={error}
          onRetry={loadReferrals}
          actionLabel="Submit Employee Referral"
          onAction={() => setReferOpen(true)}
        />
      ) : !workspace || workspace.submissions.items.length === 0 ? (
        <RecruitmentEmptyState
          title="No Employee Referrals Submitted"
          description="Refer qualified connections to open requisitions and earn referral bonuses after the cooling period."
          ctaLabel="Refer a Candidate"
          onCtaClick={() => setReferOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {workspace.submissions.items.map((ref) => (
            <div
              key={ref.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {ref.candidateName} · {ref.jobTitle}
                </div>
                <div className="text-xs text-slate-500">
                  Referred by {ref.referrerEmployeeName} · Bonus:{' '}
                  {formatRecruitmentCurrency(ref.bonusAmount, ref.currency)} (
                  {ref.bonusEligibilityStatus})
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {ref.currentStage}
              </span>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={referOpen}
        title="Submit Employee Referral"
        subtitle="Track referral bonus eligibility automatically upon joining"
        onClose={() => setReferOpen(false)}
      >
        <form onSubmit={handleSubmitReferral} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Job ID *"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="text"
            placeholder="Candidate Full Name *"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="email"
            placeholder="Candidate Email *"
            value={candidateEmail}
            onChange={(e) => setCandidateEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="tel"
            placeholder="Candidate Mobile *"
            value={candidatePhone}
            onChange={(e) => setCandidatePhone(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            type="text"
            placeholder="How do you know this candidate?"
            value={relationshipNote}
            onChange={(e) => setRelationshipNote(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setReferOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Submit Referral
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 16: VENDORS / AGENCIES
// ============================================================================
export function VendorsAgenciesModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [vendors, setVendors] = useState<VendorAgencyRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [agencyName, setAgencyName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [feePercentage, setFeePercentage] = useState('8.33');
  const [replacementDays, setReplacementDays] = useState('90');

  const loadVendors = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentVendorsApi.listVendors();
      setVendors(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load vendor agencies'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('vendors')) return;
    const timer = setTimeout(() => {
      void loadVendors();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadVendors]);

  const handleCreateVendor = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentVendorsApi.createVendor({
        agencyName: agencyName.trim(),
        contactEmail: contactEmail.trim(),
        feePercentage: Number(feePercentage) || 8.33,
        replacementGuaranteeDays: Number(replacementDays) || 90,
      });
      setCreateOpen(false);
      onToast('Recruitment Agency registered');
      void loadVendors();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to register agency');
    }
  };

  if (!perms.canAccessModule('vendors')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="16. Vendors / Agencies"
        requiredRoles="Super Admin, HR Admin, Recruiter"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            External Staffing Vendors & Recruitment Agencies
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Agency master, assigned job requisitions, SLA compliance, fee terms & invoice status
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>Onboard Staffing Agency</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Vendors & Agencies API Error"
          error={error}
          onRetry={loadVendors}
          actionLabel="Onboard Staffing Agency"
          onAction={() => setCreateOpen(true)}
        />
      ) : vendors.length === 0 ? (
        <RecruitmentEmptyState
          title="No Staffing Agencies Registered"
          description="Register external staffing partners with commercial fee terms, replacement clauses, and job access."
          ctaLabel="Add Staffing Vendor"
          onCtaClick={() => setCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {vendors.map((v) => (
            <div
              key={v.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">{v.agencyName}</div>
                <div className="text-xs text-slate-500">
                  Fee: {v.feePercentage}% · Guarantee: {v.replacementGuaranteeDays}d · Hires:{' '}
                  {v.hiresCount}/{v.submissionsCount} · Invoice: {v.invoiceStatus}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                SLA {v.slaCompliancePct}%
              </span>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={createOpen}
        title="Onboard Staffing Agency"
        subtitle="Configure commercial fee percentage and replacement guarantee"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreateVendor} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Agency Legal Name *"
            value={agencyName}
            onChange={(e) => setAgencyName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="email"
            placeholder="Primary SPOC Email *"
            value={contactEmail}
            onChange={(e) => setContactEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <input
              type="number"
              step="0.01"
              placeholder="Fee % (e.g. 8.33)"
              value={feePercentage}
              onChange={(e) => setFeePercentage(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              type="number"
              placeholder="Replacement Days (e.g. 90)"
              value={replacementDays}
              onChange={(e) => setReplacementDays(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setCreateOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Register Vendor
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 17: COMMUNICATION CENTER
// ============================================================================
export function CommunicationCenterModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [templates, setTemplates] = useState<CommunicationTemplateRecord[]>([]);
  const [logs, setLogs] = useState<CommunicationLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const [channel, setChannel] = useState<'Email' | 'SMS' | 'WhatsApp'>('Email');
  const [templateId, setTemplateId] = useState('');
  const [candidateIdsInput, setCandidateIdsInput] = useState('');

  const loadComms = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tplRes, logRes] = await Promise.all([
        recruitmentCommunicationsApi.listTemplates(),
        recruitmentCommunicationsApi.listLogs(),
      ]);
      setTemplates(tplRes.items);
      setLogs(logRes.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load communications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('communications')) return;
    const timer = setTimeout(() => {
      void loadComms();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadComms]);

  const handleBulkSend = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await recruitmentCommunicationsApi.sendBulkMessage({
        candidateIds: candidateIdsInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        templateId: templateId.trim(),
        channel,
      });
      setBulkOpen(false);
      onToast(`Queued ${res.queuedCount} ${channel} messages`);
      void loadComms();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Bulk message dispatch failed');
    }
  };

  if (!perms.canAccessModule('communications')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="17. Communication Center"
        requiredRoles="Super Admin, HR Admin, Recruiter"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Candidate Communication Center (Email, SMS & WhatsApp)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Merge-field templates, stage auto-triggers, bulk outreach & delivery/open status tracking
          </p>
        </div>
        <button
          type="button"
          onClick={() => setBulkOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <MessageSquare className="w-3.5 h-3.5" />
          <span>Send Bulk Communication</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Communication Center API Error"
          error={error}
          onRetry={loadComms}
          actionLabel="Send Bulk Communication"
          onAction={() => setBulkOpen(true)}
        />
      ) : logs.length === 0 && templates.length === 0 ? (
        <RecruitmentEmptyState
          title="No Communication Templates or Delivery Logs"
          description="Dispatch templated Email, SMS, or WhatsApp notifications with dynamic candidate merge fields."
          ctaLabel="Dispatch Candidate Message"
          onCtaClick={() => setBulkOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {logs.map((lg) => (
            <div
              key={lg.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {lg.candidateName} · {lg.templateName} ({lg.channel})
                </div>
                <div className="text-xs text-slate-500">{lg.sentAt}</div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {lg.deliveryStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={bulkOpen}
        title="Send Bulk Candidate Communication"
        subtitle="Select channel and merge-field template"
        onClose={() => setBulkOpen(false)}
      >
        <form onSubmit={handleBulkSend} className="space-y-3">
          <select
            aria-label="Communication Channel"
            value={channel}
            onChange={(e) =>
              setChannel(e.target.value as 'Email' | 'SMS' | 'WhatsApp')
            }
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="Email">Email</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="SMS">SMS</option>
          </select>
          <input
            required
            type="text"
            placeholder="Template ID *"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="text"
            placeholder="Candidate IDs (comma separated) *"
            value={candidateIdsInput}
            onChange={(e) => setCandidateIdsInput(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setBulkOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Dispatch
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 18: APPROVALS WORKFLOW
// ============================================================================
export function RecruitmentApprovalsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [approvals, setApprovals] = useState<RecruitmentApprovalItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [decideOpen, setDecideOpen] = useState(false);
  const [approvalId, setApprovalId] = useState('');
  const [decision, setDecision] = useState<'Approved' | 'Rejected' | 'Delegated'>('Approved');
  const [comments, setComments] = useState('');

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentApprovalsApi.listApprovals();
      setApprovals(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load approvals'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('approvals')) return;
    const timer = setTimeout(() => {
      void loadApprovals();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadApprovals]);

  const handleDecide = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentApprovalsApi.decideApprovals({
        approvalIds: [approvalId.trim()],
        decision,
        comments: comments.trim(),
      });
      setDecideOpen(false);
      onToast(`Approval decision (${decision}) recorded`);
      void loadApprovals();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Approval action failed');
    }
  };

  if (!perms.canAccessModule('approvals')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="18. Approvals Workflow"
        requiredRoles="Super Admin, HR Admin, Approver, Hiring Manager"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Multi-Level Recruitment Approvals Inbox
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Requisitions, offers, salary deviations, hiring exceptions & agency hires with delegation
          </p>
        </div>
        {perms.canApproveWorkflow ? (
          <button
            type="button"
            onClick={() => setDecideOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5" />
            <span>Process Approval Decision</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Recruitment Approvals API Error"
          error={error}
          onRetry={loadApprovals}
          actionLabel={perms.canApproveWorkflow ? 'Process Approval Decision' : undefined}
          onAction={perms.canApproveWorkflow ? () => setDecideOpen(true) : undefined}
        />
      ) : approvals.length === 0 ? (
        <RecruitmentEmptyState
          title="Approver Inbox is Clear"
          description="Pending requisition, offer, and salary deviation approvals assigned to your role will appear here."
          ctaLabel="Refresh Inbox"
          onCtaClick={loadApprovals}
        />
      ) : (
        <div className="space-y-3">
          {approvals.map((ap) => (
            <div
              key={ap.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  [{ap.approvalType}] {ap.referenceCode} · {ap.title}
                </div>
                <div className="text-xs text-slate-500">
                  Requested by {ap.requestedBy} ({ap.department}) · {ap.amountOrImpact}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {ap.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={decideOpen}
        title="Approve / Reject / Delegate Request"
        subtitle="Record multi-level approval decision to audit trail"
        onClose={() => setDecideOpen(false)}
      >
        <form onSubmit={handleDecide} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Approval Item ID *"
            value={approvalId}
            onChange={(e) => setApprovalId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            aria-label="Decision"
            value={decision}
            onChange={(e) =>
              setDecision(e.target.value as 'Approved' | 'Rejected' | 'Delegated')
            }
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="Approved">Approve</option>
            <option value="Rejected">Reject</option>
            <option value="Delegated">Delegate to Secondary Approver</option>
          </select>
          <textarea
            required
            rows={3}
            placeholder="Approver Comments *"
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setDecideOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Submit Decision
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 19: REPORTS & ANALYTICS
// ============================================================================
export function RecruitmentReportsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [catalog, setCatalog] = useState<RecruitmentReportDefinition[]>([]);
  const [selectedReport, setSelectedReport] = useState('hiring-funnel');
  const [reportOutput, setReportOutput] = useState<RecruitmentReportRunResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadReports = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [catRes, runRes] = await Promise.all([
        recruitmentReportsApi.getCatalog(),
        recruitmentReportsApi.runReport(selectedReport),
      ]);
      setCatalog(catRes);
      setReportOutput(runRes);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load recruitment reports'));
    } finally {
      setLoading(false);
    }
  }, [selectedReport]);

  useEffect(() => {
    if (!perms.canAccessModule('reports')) return;
    const timer = setTimeout(() => {
      void loadReports();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadReports]);

  if (!perms.canAccessModule('reports')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="19. Reports & Analytics"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager, Approver"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recruitment Reports & Executive Analytics Catalog
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Funnel velocity, source ROI, time-to-hire, cost-per-hire, diversity, BGV TAT & scheduled CSV/XLSX/PDF exports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Select Report Type"
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="hiring-funnel">Hiring Funnel & Conversion</option>
            <option value="source-roi">Source Effectiveness & ROI</option>
            <option value="time-to-hire">Time-to-Hire & Time-to-Fill</option>
            <option value="recruiter-productivity">Recruiter Productivity</option>
            <option value="offer-acceptance">Offer Acceptance & Drop-off</option>
            <option value="agency-performance">Agency SLA & Performance</option>
          </select>
          <button
            type="button"
            onClick={() => {
              void recruitmentReportsApi
                .exportReport(selectedReport, 'csv')
                .catch((e: Error) => onToast(e.message));
            }}
            className="h-9 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Recruitment Reports API Error"
          error={error}
          onRetry={loadReports}
        />
      ) : !reportOutput || reportOutput.rows.length === 0 ? (
        <RecruitmentEmptyState
          title="No Report Rows Returned"
          description={`Catalog contains ${catalog.length} standard reports. Run or export ${selectedReport} once backend records are populated.`}
          ctaLabel="Re-run Report"
          onCtaClick={loadReports}
        />
      ) : (
        <div className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 overflow-x-auto">
          <div className="text-xs font-bold mb-2 flex items-center gap-1.5">
            <BarChart3 className="w-4 h-4 text-indigo-600" />
            <span>Report: {reportOutput.reportKey}</span>
          </div>
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800">
                {reportOutput.columns.map((col) => (
                  <th key={col} className="py-2 px-2 font-bold">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reportOutput.rows.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800/60">
                  {reportOutput.columns.map((col) => (
                    <td key={col} className="py-2 px-2">
                      {String(row[col] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 20: SETTINGS & AUTOMATION RULES
// ============================================================================
export function RecruitmentSettingsAutomationModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [settings, setSettings] = useState<RecruitmentSettingsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [gdprOpen, setGdprOpen] = useState(false);
  const [retentionMonths, setRetentionMonths] = useState('24');
  const [autoAnonymize, setAutoAnonymize] = useState(true);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentSettingsApi.getSettings();
      setSettings(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load settings'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('settings')) return;
    const timer = setTimeout(() => {
      void loadSettings();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadSettings]);

  const handleSaveGdpr = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentSettingsApi.updateGdprRetention({
        retentionMonths: Number(retentionMonths) || 24,
        autoAnonymizeExpired: autoAnonymize,
        dpdpConsentRequired: true,
      });
      setGdprOpen(false);
      onToast('GDPR / DPDP data retention policy saved');
      void loadSettings();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to save GDPR settings');
    }
  };

  if (!perms.canAccessModule('settings')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="20. Settings & Automation Rules"
        requiredRoles="Super Admin, HR Admin"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recruitment Settings, GDPR/DPDP Policies & Automation Engine
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Stage SLAs, auto-publish, auto-screening thresholds, auto-schedule, auto-BGV & integration health
          </p>
        </div>
        <button
          type="button"
          onClick={() => setGdprOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Settings className="w-3.5 h-3.5" />
          <span>Configure GDPR / DPDP Retention</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Settings & Automation Rules API Error"
          error={error}
          onRetry={loadSettings}
          actionLabel="Configure GDPR / DPDP Retention"
          onAction={() => setGdprOpen(true)}
        />
      ) : !settings ? (
        <RecruitmentEmptyState
          title="No Automation Rules Loaded"
          description="Configure pipeline templates, GDPR/DPDP anonymization policies, and automated stage triggers."
          ctaLabel="Configure Retention Policy"
          onCtaClick={() => setGdprOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {settings.automationRules.map((rule) => (
            <div
              key={rule.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">{rule.name}</div>
                <div className="text-xs text-slate-500">
                  {rule.description} · Last Run: {rule.lastRunAt || 'Never'} (
                  {rule.lastRunStatus || 'Idle'})
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void recruitmentSettingsApi
                    .updateAutomationRule(rule.id, { enabled: !rule.enabled })
                    .then(() => {
                      onToast(`Rule ${rule.name} updated`);
                      void loadSettings();
                    })
                    .catch((e: Error) => onToast(e.message));
                }}
                className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                {rule.enabled ? 'Enabled' : 'Disabled'}
              </button>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={gdprOpen}
        title="GDPR / DPDP Candidate Privacy & Retention"
        subtitle="Configure automated candidate PII anonymization rules"
        onClose={() => setGdprOpen(false)}
      >
        <form onSubmit={handleSaveGdpr} className="space-y-3">
          <input
            type="number"
            min={1}
            max={120}
            placeholder="Data Retention Period (Months)"
            value={retentionMonths}
            onChange={(e) => setRetentionMonths(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              checked={autoAnonymize}
              onChange={(e) => setAutoAnonymize(e.target.checked)}
            />
            <span>Auto-anonymize expired candidate resumes and PII</span>
          </label>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setGdprOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Save Policy
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 21: AUDIT LOGS
// ============================================================================
export function RecruitmentAuditLogsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [actorFilter, setActorFilter] = useState('');
  const [logs, setLogs] = useState<RecruitmentAuditLogRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentAuditLogsApi.listAuditLogs({
        actor: actorFilter || undefined,
      });
      setLogs(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load audit logs'));
    } finally {
      setLoading(false);
    }
  }, [actorFilter]);

  useEffect(() => {
    if (!perms.canAccessModule('audit-logs')) return;
    const timer = setTimeout(() => {
      void loadLogs();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadLogs]);

  if (!perms.canAccessModule('audit-logs')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="21. Audit Logs"
        requiredRoles="Super Admin, HR Admin"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Immutable Recruitment Audit Trail
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Track actor, action, timestamp, before/after state, PII reveals & IP address
          </p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="search"
            placeholder="Filter by actor..."
            value={actorFilter}
            onChange={(e) => setActorFilter(e.target.value)}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <button
            type="button"
            onClick={() => {
              void recruitmentAuditLogsApi
                .exportAuditLogsCsv()
                .catch((e: Error) => onToast(e.message));
            }}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <History className="w-3.5 h-3.5" />
            <span>Export Audit CSV</span>
          </button>
        </div>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Recruitment Audit Logs API Error"
          error={error}
          onRetry={loadLogs}
        />
      ) : logs.length === 0 ? (
        <RecruitmentEmptyState
          title="No Recruitment Audit Events Matched"
          description="Every requisition change, PII reveal, screening override, and offer approval is immutably logged."
          ctaLabel="Refresh Logs"
          onCtaClick={loadLogs}
        />
      ) : (
        <div className="space-y-2">
          {logs.map((item) => (
            <div
              key={item.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-xs space-y-1"
            >
              <div className="flex items-center justify-between font-bold">
                <span>
                  {item.actorName} ({item.actorRole}) — {item.action}
                </span>
                <span className="font-mono text-slate-500">
                  {item.timestamp} · IP {item.ipAddress}
                </span>
              </div>
              <div className="text-slate-500">
                Before: {item.beforeSummary} → After: {item.afterSummary}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 22: NOTIFICATIONS
// ============================================================================
export function RecruitmentNotificationsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [notifications, setNotifications] = useState<RecruitmentNotificationRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadNotifications = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentNotificationsApi.listNotifications();
      setNotifications(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load notifications'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('notifications')) return;
    const timer = setTimeout(() => {
      void loadNotifications();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadNotifications]);

  if (!perms.canAccessModule('notifications')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="22. Notifications"
        requiredRoles="All Authenticated Roles"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Recruitment Event Notifications & SLA Alerts
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            New applications, scheduled interviews, pending feedback, accepted offers & SLA breaches
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            const unreadIds = notifications.filter((n) => !n.read).map((n) => n.id);
            void recruitmentNotificationsApi
              .markRead(unreadIds)
              .then(() => {
                onToast('Marked notifications as read');
                void loadNotifications();
              })
              .catch((e: Error) => onToast(e.message));
          }}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Bell className="w-3.5 h-3.5" />
          <span>Mark All Read</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Notifications API Error"
          error={error}
          onRetry={loadNotifications}
        />
      ) : notifications.length === 0 ? (
        <RecruitmentEmptyState
          title="No Unread Recruitment Notifications"
          description="Real-time alerts for interviews, scorecards, offers, and SLA timers will appear here."
          ctaLabel="Check for New Alerts"
          onCtaClick={loadNotifications}
        />
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">{n.title}</div>
                <div className="text-xs text-slate-500">{n.message}</div>
              </div>
              <span className="text-xs font-mono text-slate-400">{n.createdAt}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================================
// MODULE 23: HIRING MANAGER PORTAL
// ============================================================================
export function HiringManagerPortalModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [workspace, setWorkspace] = useState<HiringManagerWorkspaceResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [quickOpen, setQuickOpen] = useState(false);
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [decision, setDecision] = useState<'Shortlist' | 'Reject' | 'ScheduleInterview'>('Shortlist');
  const [notes, setNotes] = useState('');

  const loadWorkspace = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentHiringManagerApi.getWorkspace();
      setWorkspace(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load Hiring Manager portal'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('hiring-manager')) return;
    const timer = setTimeout(() => {
      void loadWorkspace();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadWorkspace]);

  const handleQuickDecision = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentHiringManagerApi.submitQuickDecision(candidateId.trim(), {
        jobId: jobId.trim(),
        decision,
        notes: notes.trim(),
      });
      setQuickOpen(false);
      onToast(`Hiring Manager decision (${decision}) submitted`);
      void loadWorkspace();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Decision submission failed');
    }
  };

  if (!perms.canAccessModule('hiring-manager')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="23. Hiring Manager Portal"
        requiredRoles="Super Admin, HR Admin, Hiring Manager"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Hiring Manager Self-Service Portal
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            My team requisitions, candidates awaiting review, pending scorecards & offer approvals
          </p>
        </div>
        <button
          type="button"
          onClick={() => setQuickOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Briefcase className="w-3.5 h-3.5" />
          <span>Quick Candidate Decision</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Hiring Manager Portal API Error"
          error={error}
          onRetry={loadWorkspace}
          actionLabel="Quick Candidate Decision"
          onAction={() => setQuickOpen(true)}
        />
      ) : !workspace ||
        (workspace.myOpenRequisitions.length === 0 &&
          workspace.candidatesAwaitingReview.length === 0) ? (
        <RecruitmentEmptyState
          title="No Pending Candidates in Hiring Manager Queue"
          description="Shortlist or reject screened candidates, submit interview feedback, and approve team offers here."
          ctaLabel="Submit Candidate Decision"
          onCtaClick={() => setQuickOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {workspace.candidatesAwaitingReview.map((c) => (
            <div
              key={c.applicationId}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {c.candidateName} · {c.jobTitle}
                </div>
                <div className="text-xs text-slate-500">
                  Stage: {c.stage} · AI Match: {c.aiMatchScorePct}%
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setCandidateId(c.candidateId);
                  setJobId(c.jobId);
                  setQuickOpen(true);
                }}
                className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
              >
                Review
              </button>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={quickOpen}
        title="Hiring Manager Candidate Decision"
        subtitle="Shortlist, schedule interview, or reject candidate"
        onClose={() => setQuickOpen(false)}
      >
        <form onSubmit={handleQuickDecision} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Candidate ID *"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="text"
            placeholder="Job ID *"
            value={jobId}
            onChange={(e) => setJobId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            aria-label="Hiring Manager Action"
            value={decision}
            onChange={(e) =>
              setDecision(
                e.target.value as 'Shortlist' | 'Reject' | 'ScheduleInterview'
              )
            }
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="Shortlist">Shortlist for Interview</option>
            <option value="ScheduleInterview">Request Immediate Interview Slot</option>
            <option value="Reject">Reject Candidate</option>
          </select>
          <textarea
            required
            rows={3}
            placeholder="Hiring Manager Review Notes *"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setQuickOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Submit Decision
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}
