'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Kanban,
  ClipboardList,
  CalendarClock,
  Video,
  Star,
  FileSignature,
  ShieldCheck,
  UserCheck,
  Download,
  Plus,
} from 'lucide-react';
import {
  PipelineBoardResponse,
  PipelineStageId,
  AssessmentTemplateRecord,
  CandidateAssessmentAttemptRecord,
  InterviewScheduleRecord,
  AiVideoTemplateRecord,
  AiVideoSubmissionRecord,
  InterviewScorecardRecord,
  OfferRecord,
  OfferCompensationBreakup,
  BgvCaseRecord,
  OnboardingHandoffRecord,
} from '../../types/recruitment';
import {
  recruitmentPipelineApi,
  recruitmentAssessmentsApi,
  recruitmentInterviewsApi,
  recruitmentVideoInterviewsApi,
  recruitmentScorecardsApi,
  recruitmentOffersApi,
  recruitmentBgvApi,
  recruitmentOnboardingHandoffApi,
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

const PIPELINE_STAGES: PipelineStageId[] = [
  'Applied',
  'Screening',
  'Assessment',
  'Interview',
  'Offer',
  'BGV',
  'Joined',
  'Rejected',
  'OnHold',
];

// ============================================================================
// MODULE 7: APPLICATION PIPELINE (KANBAN + LIST)
// ============================================================================
export function ApplicationPipelineModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [viewType, setViewType] = useState<'kanban' | 'list'>('kanban');
  const [board, setBoard] = useState<PipelineBoardResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [moveOpen, setMoveOpen] = useState(false);
  const [targetAppId, setTargetAppId] = useState('');
  const [targetStage, setTargetStage] = useState<PipelineStageId>('Screening');
  const [moveReason, setMoveReason] = useState('');

  const loadBoard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentPipelineApi.getBoard();
      setBoard(res);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load pipeline board'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('pipeline')) return;
    const timer = setTimeout(() => {
      void loadBoard();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadBoard]);

  const handleMoveSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetAppId.trim()) return;
    try {
      await recruitmentPipelineApi.moveApplications({
        applicationIds: [targetAppId.trim()],
        targetStage,
        reason: moveReason.trim(),
        sendNotification: true,
      });
      setMoveOpen(false);
      onToast(`Moved application to ${targetStage}`);
      void loadBoard();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Move stage failed');
    }
  };

  if (!perms.canAccessModule('pipeline')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="7. Application Pipeline (Kanban + List)"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Application Pipeline (Kanban & Table View)
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Configurable stages (Applied → Screening → Assessment → Interview → Offer → BGV → Joined), SLA timers & bulk move
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setViewType((prev) => (prev === 'kanban' ? 'list' : 'kanban'))
            }
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>{viewType === 'kanban' ? 'Switch to List View' : 'Switch to Kanban'}</span>
          </button>
          <button
            type="button"
            onClick={() => {
              void recruitmentPipelineApi
                .exportPipeline(undefined, 'csv')
                .catch((e: Error) => onToast(e.message));
            }}
            className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          {perms.canMovePipeline ? (
            <button
              type="button"
              onClick={() => setMoveOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Move / Stage Action
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={4} />
      ) : error ? (
        <RecruitmentErrorState
          title="Application Pipeline API Error"
          error={error}
          onRetry={loadBoard}
          actionLabel={perms.canMovePipeline ? 'Stage Transition Action' : undefined}
          onAction={perms.canMovePipeline ? () => setMoveOpen(true) : undefined}
        />
      ) : !board || board.stages.length === 0 ? (
        <RecruitmentEmptyState
          title="No Active Applications in Pipeline"
          description="Applications move through Applied, Screening, Assessment, Interview, Offer, BGV, and Joined stages."
          ctaLabel="Trigger Stage Transition"
          onCtaClick={() => setMoveOpen(true)}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {board.stages.map((col) => (
            <div
              key={col.stage}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold">{col.label}</span>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  {col.count}
                </span>
              </div>
              {col.items.map((card) => (
                <div
                  key={card.applicationId}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 space-y-1 text-xs"
                >
                  <div className="font-bold">{card.candidateName}</div>
                  <div className="text-slate-500">{card.jobTitle}</div>
                  <div className="flex items-center justify-between text-[11px] font-mono">
                    <span>Match {card.aiMatchScorePct}%</span>
                    <span>{card.stageAgeHours}h in stage</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={moveOpen}
        title="Move Application Stage"
        subtitle="Server-validated stage transition with templated notification"
        onClose={() => setMoveOpen(false)}
      >
        <form onSubmit={handleMoveSubmit} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Application ID *"
            value={targetAppId}
            onChange={(e) => setTargetAppId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <select
            aria-label="Target Stage"
            value={targetStage}
            onChange={(e) => setTargetStage(e.target.value as PipelineStageId)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            {PIPELINE_STAGES.map((st) => (
              <option key={st} value={st}>
                Stage: {st}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="Transition / Rejection Reason"
            value={moveReason}
            onChange={(e) => setMoveReason(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setMoveOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Confirm Stage Move
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 8: ASSESSMENTS & TESTS
// ============================================================================
export function AssessmentsTestsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [templates, setTemplates] = useState<AssessmentTemplateRecord[]>([]);
  const [attempts, setAttempts] = useState<CandidateAssessmentAttemptRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [templateId, setTemplateId] = useState('');

  const loadAssessments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tplRes, attRes] = await Promise.all([
        recruitmentAssessmentsApi.listTemplates(),
        recruitmentAssessmentsApi.listAttempts(),
      ]);
      setTemplates(tplRes.items);
      setAttempts(attRes.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load assessments'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('assessments')) return;
    const timer = setTimeout(() => {
      void loadAssessments();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadAssessments]);

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentAssessmentsApi.assignAssessment({
        candidateId: candidateId.trim(),
        jobId: jobId.trim(),
        templateId: templateId.trim(),
        dueInHours: 48,
      });
      setAssignOpen(false);
      onToast('Assessment invitation dispatched');
      void loadAssessments();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to assign assessment');
    }
  };

  if (!perms.canAccessModule('assessments')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="8. Assessments & Tests"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager, Candidate"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Assessments & Technical / Psychometric Tests
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            MCQ, coding, aptitude, psychometric & typing tests with proctoring flags and retest triggers
          </p>
        </div>
        <button
          type="button"
          onClick={() => setAssignOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <ClipboardList className="w-3.5 h-3.5" />
          <span>Assign Assessment</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Assessments & Proctoring API Error"
          error={error}
          onRetry={loadAssessments}
          actionLabel="Assign Assessment"
          onAction={() => setAssignOpen(true)}
        />
      ) : attempts.length === 0 && templates.length === 0 ? (
        <RecruitmentEmptyState
          title="No Assessment Templates or Candidate Attempts"
          description="Assign coding, MCQ, or psychometric tests to candidates and monitor proctoring flags."
          ctaLabel="Assign Candidate Test"
          onCtaClick={() => setAssignOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {attempts.map((at) => (
            <div
              key={at.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {at.candidateName} · {at.templateTitle}
                </div>
                <div className="text-xs text-slate-500">
                  Status: {at.status} · Score: {at.scorePct ?? '—'}% · Proctoring Flags:{' '}
                  {at.proctoringFlagsCount}
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  void recruitmentAssessmentsApi
                    .requestRetest(at.id, 'Recruiter authorized retest')
                    .then(() => {
                      onToast('Retest granted');
                      void loadAssessments();
                    })
                    .catch((e: Error) => onToast(e.message));
                }}
                className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
              >
                Grant Retest
              </button>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={assignOpen}
        title="Assign Candidate Assessment"
        subtitle="Dispatch proctored test invite via backend provider"
        onClose={() => setAssignOpen(false)}
      >
        <form onSubmit={handleAssign} className="space-y-3">
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
          <input
            required
            type="text"
            placeholder="Assessment Template ID *"
            value={templateId}
            onChange={(e) => setTemplateId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setAssignOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Send Test Link
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 9: INTERVIEW SCHEDULING & MANAGEMENT
// ============================================================================
export function InterviewSchedulingModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [calendarView, setCalendarView] = useState<'day' | 'week' | 'month'>('week');
  const [interviews, setInterviews] = useState<InterviewScheduleRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [scheduleOpen, setScheduleOpen] = useState(false);

  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [roundType, setRoundType] = useState<'HR' | 'Technical' | 'Managerial' | 'CultureFit'>('Technical');
  const [mode, setMode] = useState<'Video' | 'Phone' | 'InPerson'>('Video');
  const [panelInput, setPanelInput] = useState('');
  const [startAt, setStartAt] = useState('');
  const [endAt, setEndAt] = useState('');
  const [meetingLink, setMeetingLink] = useState('');

  const loadInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentInterviewsApi.listInterviews({
        view: calendarView,
      });
      setInterviews(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load interviews'));
    } finally {
      setLoading(false);
    }
  }, [calendarView]);

  useEffect(() => {
    if (!perms.canAccessModule('interviews')) return;
    const timer = setTimeout(() => {
      void loadInterviews();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadInterviews]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentInterviewsApi.scheduleInterview({
        candidateId: candidateId.trim(),
        jobId: jobId.trim(),
        roundType,
        mode,
        panelInterviewerNames: panelInput
          .split(',')
          .map((s) => s.trim())
          .filter(Boolean),
        startAt,
        endAt,
        meetingLinkOrRoom: meetingLink.trim(),
      });
      setScheduleOpen(false);
      onToast('Interview scheduled and calendar invites queued');
      void loadInterviews();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to schedule interview');
    }
  };

  if (!perms.canAccessModule('interviews')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="9. Interview Scheduling & Management"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager, Interviewer"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Interview Scheduling & Panel Calendar Management
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Auto-slot availability, HR/Technical/Managerial/Culture rounds, conflict checks & no-show tracking
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            aria-label="Calendar View Mode"
            value={calendarView}
            onChange={(e) => setCalendarView(e.target.value as 'day' | 'week' | 'month')}
            className="h-9 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          >
            <option value="day">Day View</option>
            <option value="week">Week View</option>
            <option value="month">Month View</option>
          </select>
          {perms.canScheduleInterviews ? (
            <button
              type="button"
              onClick={() => setScheduleOpen(true)}
              className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
            >
              <CalendarClock className="w-3.5 h-3.5" />
              <span>Schedule Interview</span>
            </button>
          ) : null}
        </div>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Interview Scheduling API Error"
          error={error}
          onRetry={loadInterviews}
          actionLabel={perms.canScheduleInterviews ? 'Schedule Interview' : undefined}
          onAction={perms.canScheduleInterviews ? () => setScheduleOpen(true) : undefined}
        />
      ) : interviews.length === 0 ? (
        <RecruitmentEmptyState
          title="No Interviews Scheduled in Selected Window"
          description="Schedule panel interviews with calendar sync and automated email/WhatsApp/SMS reminders."
          ctaLabel={perms.canScheduleInterviews ? 'Schedule New Interview' : undefined}
          onCtaClick={perms.canScheduleInterviews ? () => setScheduleOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {interviews.map((iv) => (
            <div
              key={iv.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-bold">
                  {iv.candidateName} · {iv.roundType} ({iv.mode})
                </div>
                <div className="text-xs text-slate-500">
                  {iv.startAt} → {iv.endAt} · Panel: {iv.panelInterviewerNames.join(', ')}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {iv.status}
              </span>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={scheduleOpen}
        title="Schedule Panel Interview"
        subtitle="Sync interviewer calendar slots & send candidate invite"
        onClose={() => setScheduleOpen(false)}
      >
        <form onSubmit={handleSchedule} className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <input
              required
              type="text"
              placeholder="Candidate ID *"
              value={candidateId}
              onChange={(e) => setCandidateId(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="text"
              placeholder="Job ID *"
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <select
              aria-label="Round Type"
              value={roundType}
              onChange={(e) =>
                setRoundType(
                  e.target.value as 'HR' | 'Technical' | 'Managerial' | 'CultureFit'
                )
              }
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="HR">HR Round</option>
              <option value="Technical">Technical Round</option>
              <option value="Managerial">Managerial Round</option>
              <option value="CultureFit">Culture Fit Round</option>
            </select>
            <select
              aria-label="Interview Mode"
              value={mode}
              onChange={(e) =>
                setMode(e.target.value as 'Video' | 'Phone' | 'InPerson')
              }
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="Video">Video Meeting</option>
              <option value="Phone">Phone Screen</option>
              <option value="InPerson">In-Person Room</option>
            </select>
            <input
              required
              type="datetime-local"
              aria-label="Start Time"
              value={startAt}
              onChange={(e) => setStartAt(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <input
              required
              type="datetime-local"
              aria-label="End Time"
              value={endAt}
              onChange={(e) => setEndAt(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <input
            required
            type="text"
            placeholder="Panel Interviewers (comma separated) *"
            value={panelInput}
            onChange={(e) => setPanelInput(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="text"
            placeholder="Meeting URL or Conference Room *"
            value={meetingLink}
            onChange={(e) => setMeetingLink(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setScheduleOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Confirm Schedule
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 10: AI VIDEO INTERVIEW
// ============================================================================
export function AiVideoInterviewModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [templates, setTemplates] = useState<AiVideoTemplateRecord[]>([]);
  const [submissions, setSubmissions] = useState<AiVideoSubmissionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [jobRole, setJobRole] = useState('');
  const [questionPrompt, setQuestionPrompt] = useState('');
  const [retakes, setRetakes] = useState('1');

  const loadVideoInterviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [tplRes, subRes] = await Promise.all([
        recruitmentVideoInterviewsApi.listTemplates(),
        recruitmentVideoInterviewsApi.listSubmissions(),
      ]);
      setTemplates(tplRes.items);
      setSubmissions(subRes.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load AI video interviews'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('video-interviews')) return;
    const timer = setTimeout(() => {
      void loadVideoInterviews();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadVideoInterviews]);

  const handleCreateTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentVideoInterviewsApi.createTemplate({
        title: title.trim(),
        jobRole: jobRole.trim(),
        questions: [
          {
            prompt: questionPrompt.trim(),
            thinkTimeSec: 30,
            answerLimitSec: 120,
          },
        ],
        allowedRetakes: Number(retakes) || 1,
      });
      setCreateOpen(false);
      onToast('AI Video Interview template created');
      void loadVideoInterviews();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Could not create template');
    }
  };

  if (!perms.canAccessModule('video-interviews')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="10. AI Video Interview"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager, Interviewer, Candidate"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Asynchronous AI Video Interview Studio & Reviewer
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Timed question templates, camera/mic check, AI transcript & per-question sentiment scoring
          </p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
        >
          <Video className="w-3.5 h-3.5" />
          <span>New Video Template</span>
        </button>
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="AI Video Interview API Error"
          error={error}
          onRetry={loadVideoInterviews}
          actionLabel="Create Video Template"
          onAction={() => setCreateOpen(true)}
        />
      ) : submissions.length === 0 && templates.length === 0 ? (
        <RecruitmentEmptyState
          title="No AI Video Interviews Recorded Yet"
          description="Create asynchronous video templates with think-time limits and review backend AI transcripts & summaries."
          ctaLabel="Create Video Interview Template"
          onCtaClick={() => setCreateOpen(true)}
        />
      ) : (
        <div className="space-y-3">
          {submissions.map((sub) => (
            <div
              key={sub.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="text-sm font-bold">
                  {sub.candidateName} · {sub.jobTitle}
                </div>
                <span className="text-xs font-mono font-bold text-indigo-600">
                  AI Score: {sub.aiOverallScorePct}%
                </span>
              </div>
              <p className="text-xs text-slate-500">{sub.aiSummary}</p>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={createOpen}
        title="Create AI Video Interview Template"
        subtitle="Configure timed video prompts and retake limits"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreateTemplate} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Template Title *"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="text"
            placeholder="Target Job Role *"
            value={jobRole}
            onChange={(e) => setJobRole(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <textarea
            required
            rows={3}
            placeholder="Primary Video Question Prompt *"
            value={questionPrompt}
            onChange={(e) => setQuestionPrompt(e.target.value)}
            className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            type="number"
            min={0}
            max={5}
            placeholder="Allowed Retakes"
            value={retakes}
            onChange={(e) => setRetakes(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
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
              Save Template
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 11: EVALUATION & SCORECARDS
// ============================================================================
export function EvaluationScorecardsModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [scorecards, setScorecards] = useState<InterviewScorecardRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [submitOpen, setSubmitOpen] = useState(false);

  const [interviewId, setInterviewId] = useState('');
  const [candidateId, setCandidateId] = useState('');
  const [recommendation, setRecommendation] = useState<'StrongHire' | 'Hire' | 'Hold' | 'NoHire'>('Hire');
  const [rating, setRating] = useState('4');
  const [debriefNotes, setDebriefNotes] = useState('');

  const loadScorecards = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentScorecardsApi.listScorecards();
      setScorecards(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load scorecards'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('scorecards')) return;
    const timer = setTimeout(() => {
      void loadScorecards();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadScorecards]);

  const handleSubmitScorecard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentScorecardsApi.submitScorecard({
        interviewId: interviewId.trim(),
        candidateId: candidateId.trim(),
        recommendation,
        competencies: [
          {
            competency: 'Core Domain & Problem Solving',
            weightPct: 100,
            ratingOutOf5: Number(rating) || 4,
            comment: debriefNotes.trim(),
          },
        ],
        debriefNotes: debriefNotes.trim(),
      });
      setSubmitOpen(false);
      onToast('Interview scorecard submitted');
      void loadScorecards();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to submit scorecard');
    }
  };

  if (!perms.canAccessModule('scorecards')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="11. Evaluation & Scorecards"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager, Interviewer"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Interview Evaluation & Competency Scorecards
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Weighted competency rubrics, panel calibration, hire/no-hire recommendations & chase reminders
          </p>
        </div>
        {perms.canSubmitScorecards ? (
          <button
            type="button"
            onClick={() => setSubmitOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <Star className="w-3.5 h-3.5" />
            <span>Submit Scorecard</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Evaluation & Scorecards API Error"
          error={error}
          onRetry={loadScorecards}
          actionLabel={perms.canSubmitScorecards ? 'Submit Scorecard' : undefined}
          onAction={perms.canSubmitScorecards ? () => setSubmitOpen(true) : undefined}
        />
      ) : scorecards.length === 0 ? (
        <RecruitmentEmptyState
          title="No Interview Scorecards Submitted"
          description="Submit structured interviewer feedback and calibrate panel recommendations."
          ctaLabel={perms.canSubmitScorecards ? 'Submit Interview Scorecard' : undefined}
          onCtaClick={perms.canSubmitScorecards ? () => setSubmitOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {scorecards.map((sc) => (
            <div
              key={sc.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {sc.candidateName} · {sc.roundType} ({sc.interviewerName})
                </div>
                <div className="text-xs text-slate-500">{sc.debriefNotes}</div>
              </div>
              <div className="text-xs font-mono font-bold text-indigo-600">
                {sc.recommendation} ({sc.panelAverageRating}/5)
              </div>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={submitOpen}
        title="Submit Structured Interview Scorecard"
        subtitle="Mandatory competency rating and hire recommendation"
        onClose={() => setSubmitOpen(false)}
      >
        <form onSubmit={handleSubmitScorecard} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Interview ID *"
            value={interviewId}
            onChange={(e) => setInterviewId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="text"
            placeholder="Candidate ID *"
            value={candidateId}
            onChange={(e) => setCandidateId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="grid grid-cols-2 gap-2.5">
            <select
              aria-label="Recommendation"
              value={recommendation}
              onChange={(e) =>
                setRecommendation(
                  e.target.value as 'StrongHire' | 'Hire' | 'Hold' | 'NoHire'
                )
              }
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            >
              <option value="StrongHire">Strong Hire</option>
              <option value="Hire">Hire</option>
              <option value="Hold">Hold</option>
              <option value="NoHire">No Hire</option>
            </select>
            <input
              type="number"
              min={1}
              max={5}
              placeholder="Rating (1-5)"
              value={rating}
              onChange={(e) => setRating(e.target.value)}
              className="h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
          </div>
          <textarea
            required
            rows={3}
            placeholder="Mandatory Interviewer Debrief Notes *"
            value={debriefNotes}
            onChange={(e) => setDebriefNotes(e.target.value)}
            className="w-full p-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setSubmitOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Submit Evaluation
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 12: OFFER MANAGEMENT
// ============================================================================
export function OfferManagementModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [offers, setOffers] = useState<OfferRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [candidateId, setCandidateId] = useState('');
  const [jobId, setJobId] = useState('');
  const [annualCtc, setAnnualCtc] = useState('');
  const [designation, setDesignation] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [previewBreakup, setPreviewBreakup] = useState<OfferCompensationBreakup | null>(null);

  const loadOffers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentOffersApi.listOffers();
      setOffers(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load offers'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('offers')) return;
    const timer = setTimeout(() => {
      void loadOffers();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadOffers]);

  const handlePreviewBreakup = async () => {
    if (!annualCtc) return;
    try {
      const res = await recruitmentOffersApi.previewBreakup({
        templateId: 'TPL-STD',
        offeredAnnualCtc: Number(annualCtc) || 0,
        location: 'Bengaluru',
        grade: 'L4',
      });
      setPreviewBreakup(res);
      onToast('Compensation breakup computed by backend');
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Backend breakup preview failed');
    }
  };

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentOffersApi.createOffer({
        candidateId: candidateId.trim(),
        jobId: jobId.trim(),
        templateId: 'TPL-STD',
        offeredAnnualCtc: Number(annualCtc) || 0,
        designation: designation.trim(),
        location: 'Bengaluru',
        reportingManager: 'Engineering Lead',
        joiningDate,
        expiresAt: joiningDate,
      });
      setCreateOpen(false);
      onToast('Offer generated and routed for approval');
      void loadOffers();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to create offer');
    }
  };

  if (!perms.canAccessModule('offers')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="12. Offer Management"
        requiredRoles="Super Admin, HR Admin, Recruiter, Hiring Manager, Approver"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Offer Management, Compensation Breakup & Digital e-Sign
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Backend CTC calculation, multi-level approval, negotiation versions, PDF preview & e-Sign dispatch
          </p>
        </div>
        {perms.canManageOffers ? (
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <FileSignature className="w-3.5 h-3.5" />
            <span>Generate Offer Letter</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Offer Management API Error"
          error={error}
          onRetry={loadOffers}
          actionLabel={perms.canManageOffers ? 'Generate Offer Letter' : undefined}
          onAction={perms.canManageOffers ? () => setCreateOpen(true) : undefined}
        />
      ) : offers.length === 0 ? (
        <RecruitmentEmptyState
          title="No Offer Letters Issued Yet"
          description="Generate an offer letter using backend-computed compensation breakup and dispatch for candidate e-signature."
          ctaLabel={perms.canManageOffers ? 'Create Offer' : undefined}
          onCtaClick={perms.canManageOffers ? () => setCreateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {offers.map((of) => (
            <div
              key={of.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3"
            >
              <div>
                <div className="text-sm font-bold">
                  {of.offerCode} · {of.candidateName} ({of.designation})
                </div>
                <div className="text-xs text-slate-500">
                  CTC:{' '}
                  {formatRecruitmentCurrency(
                    of.breakup.annualCtc,
                    of.breakup.currency
                  )}{' '}
                  · Status: {of.offerStatus} · e-Sign: {of.eSignStatus}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    void recruitmentOffersApi
                      .downloadOfferPdf(of.id)
                      .catch((e: Error) => onToast(e.message));
                  }}
                  className="h-8 px-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
                >
                  PDF
                </button>
                <button
                  type="button"
                  onClick={() => {
                    void recruitmentOffersApi
                      .sendForESign(of.id)
                      .then(() => {
                        onToast('Offer sent for e-Signature');
                        void loadOffers();
                      })
                      .catch((e: Error) => onToast(e.message));
                  }}
                  className="h-8 px-3 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
                >
                  Send e-Sign
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={createOpen}
        title="Generate Candidate Offer"
        subtitle="All CTC components are calculated strictly by the backend API"
        onClose={() => setCreateOpen(false)}
      >
        <form onSubmit={handleCreateOffer} className="space-y-3">
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
          <input
            required
            type="text"
            placeholder="Offered Designation *"
            value={designation}
            onChange={(e) => setDesignation(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex gap-2">
            <input
              required
              type="number"
              placeholder="Offered Annual CTC *"
              value={annualCtc}
              onChange={(e) => setAnnualCtc(e.target.value)}
              className="flex-1 h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
            />
            <button
              type="button"
              onClick={handlePreviewBreakup}
              className="h-10 px-3 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-semibold"
            >
              Compute Breakup
            </button>
          </div>
          {previewBreakup ? (
            <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800 text-xs font-mono">
              Basic: {formatRecruitmentCurrency(previewBreakup.basicAnnual)} · HRA:{' '}
              {formatRecruitmentCurrency(previewBreakup.hraAnnual)} · Monthly Gross:{' '}
              {formatRecruitmentCurrency(previewBreakup.monthlyGross)}
            </div>
          ) : null}
          <input
            required
            type="date"
            aria-label="Target Joining Date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
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
              Create Offer
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 13: BACKGROUND VERIFICATION (BGV)
// ============================================================================
export function BackgroundVerificationModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [cases, setCases] = useState<BgvCaseRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [initiateOpen, setInitiateOpen] = useState(false);
  const [candidateId, setCandidateId] = useState('');
  const [vendorName, setVendorName] = useState('AuthBridge Enterprise BGV');

  const loadBgv = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentBgvApi.listCases();
      setCases(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load BGV cases'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('bgv')) return;
    const timer = setTimeout(() => {
      void loadBgv();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadBgv]);

  const handleInitiateBgv = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentBgvApi.initiateBgv({
        candidateId: candidateId.trim(),
        vendorName: vendorName.trim(),
        checkTypes: ['Identity', 'Education', 'Employment', 'Address', 'Criminal', 'Reference'],
      });
      setInitiateOpen(false);
      onToast('Background Verification initiated with external vendor');
      void loadBgv();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Failed to initiate BGV');
    }
  };

  if (!perms.canAccessModule('bgv')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="13. Background Verification (BGV)"
        requiredRoles="Super Admin, HR Admin, Recruiter"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Background Verification (BGV) & Discrepancy Clearance
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Identity, education, employment, criminal & reference checks with vendor status tracking
          </p>
        </div>
        {perms.canInitiateBgv ? (
          <button
            type="button"
            onClick={() => setInitiateOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Initiate BGV Case</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Background Verification API Error"
          error={error}
          onRetry={loadBgv}
          actionLabel={perms.canInitiateBgv ? 'Initiate BGV Case' : undefined}
          onAction={perms.canInitiateBgv ? () => setInitiateOpen(true) : undefined}
        />
      ) : cases.length === 0 ? (
        <RecruitmentEmptyState
          title="No Active BGV Cases"
          description="Initiate 6-point background checks (Identity, Education, Employment, Address, Criminal, Reference) once an offer is accepted."
          ctaLabel={perms.canInitiateBgv ? 'Initiate BGV' : undefined}
          onCtaClick={perms.canInitiateBgv ? () => setInitiateOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {cases.map((bgv) => (
            <div
              key={bgv.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {bgv.candidateName} · Vendor: {bgv.vendorName}
                </div>
                <div className="text-xs text-slate-500">
                  Checks: {bgv.checks.map((c) => `${c.checkType}: ${c.status}`).join(' · ')}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {bgv.overallStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={initiateOpen}
        title="Initiate Candidate BGV"
        subtitle="Trigger 6-point verification package via integrated vendor"
        onClose={() => setInitiateOpen(false)}
      >
        <form onSubmit={handleInitiateBgv} className="space-y-3">
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
            placeholder="BGV Vendor Name *"
            value={vendorName}
            onChange={(e) => setVendorName(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setInitiateOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold"
            >
              Start Verification
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}

// ============================================================================
// MODULE 14: ONBOARDING HANDOFF
// ============================================================================
export function OnboardingHandoffModule({
  onToast,
}: {
  onToast: (msg: string) => void;
}) {
  const perms = useRecruitmentPermission();
  const [handoffs, setHandoffs] = useState<OnboardingHandoffRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [convertOpen, setConvertOpen] = useState(false);
  const [handoffId, setHandoffId] = useState('');
  const [joiningDate, setJoiningDate] = useState('');

  const loadHandoffs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await recruitmentOnboardingHandoffApi.listHandoffs();
      setHandoffs(res.items);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to load onboarding handoffs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!perms.canAccessModule('onboarding-handoff')) return;
    const timer = setTimeout(() => {
      void loadHandoffs();
    }, 0);
    return () => clearTimeout(timer);
  }, [perms, loadHandoffs]);

  const handleConvert = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await recruitmentOnboardingHandoffApi.convertToEmployee(handoffId.trim(), {
        confirmedJoiningDate: joiningDate,
        triggerItAssets: true,
        triggerPayrollSetup: true,
      });
      setConvertOpen(false);
      onToast('Candidate converted to Employee; IT & Payroll setup triggered');
      void loadHandoffs();
    } catch (err) {
      onToast(err instanceof Error ? err.message : 'Conversion failed');
    }
  };

  if (!perms.canAccessModule('onboarding-handoff')) {
    return (
      <RecruitmentPermissionDeniedState
        moduleTitle="14. Onboarding Handoff"
        requiredRoles="Super Admin, HR Admin, Recruiter"
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="rounded-3xl p-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-bold text-slate-900 dark:text-white">
            Onboarding Handoff & Candidate-to-Employee Conversion
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Pre-joining checklist, Day-1 confirmation, no-show handling & automated IT/Payroll provisioning
          </p>
        </div>
        {perms.canTriggerOnboarding ? (
          <button
            type="button"
            onClick={() => setConvertOpen(true)}
            className="h-9 px-3.5 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1.5"
          >
            <UserCheck className="w-3.5 h-3.5" />
            <span>Convert to Employee</span>
          </button>
        ) : null}
      </div>

      {loading ? (
        <RecruitmentSkeletonBlock rows={3} />
      ) : error ? (
        <RecruitmentErrorState
          title="Onboarding Handoff API Error"
          error={error}
          onRetry={loadHandoffs}
          actionLabel={perms.canTriggerOnboarding ? 'Convert to Employee' : undefined}
          onAction={perms.canTriggerOnboarding ? () => setConvertOpen(true) : undefined}
        />
      ) : handoffs.length === 0 ? (
        <RecruitmentEmptyState
          title="No Pending Onboarding Handoffs"
          description="Accepted offers awaiting Day-1 joining confirmation appear here to trigger IT asset and Payroll setup."
          ctaLabel={perms.canTriggerOnboarding ? 'Trigger Employee Conversion' : undefined}
          onCtaClick={perms.canTriggerOnboarding ? () => setConvertOpen(true) : undefined}
        />
      ) : (
        <div className="space-y-3">
          {handoffs.map((h) => (
            <div
              key={h.id}
              className="rounded-3xl p-4 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-bold">
                  {h.candidateName} · {h.jobTitle} ({h.department})
                </div>
                <div className="text-xs text-slate-500">
                  Joining: {h.scheduledJoiningDate} · Docs: {h.preJoiningDocsVerifiedPct}% · IT:{' '}
                  {h.itAssetWorkflowStatus} · Payroll: {h.payrollSetupWorkflowStatus}
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-indigo-600">
                {h.joiningStatus}
              </span>
            </div>
          ))}
        </div>
      )}

      <RecruitmentModal
        open={convertOpen}
        title="Convert Candidate to Employee"
        subtitle="Auto-triggers HRMS Employee Directory, IT Asset & Payroll onboarding"
        onClose={() => setConvertOpen(false)}
      >
        <form onSubmit={handleConvert} className="space-y-3">
          <input
            required
            type="text"
            placeholder="Onboarding Handoff ID *"
            value={handoffId}
            onChange={(e) => setHandoffId(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <input
            required
            type="date"
            aria-label="Confirmed Joining Date"
            value={joiningDate}
            onChange={(e) => setJoiningDate(e.target.value)}
            className="w-full h-10 px-3 rounded-xl text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setConvertOpen(false)}
              className="h-9 px-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="h-9 px-4 rounded-xl bg-indigo-600 text-white text-xs font-semibold inline-flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Confirm Joining & Convert</span>
            </button>
          </div>
        </form>
      </RecruitmentModal>
    </div>
  );
}
