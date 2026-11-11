import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildRecruitmentQueryString,
  formatRecruitmentCurrency,
  maskCandidatePii,
  RecruitmentHttpClient,
  RecruitmentApiError,
} from './client';
import {
  canRecruitmentRoleAccessModule,
  computeRecruitmentPermissions,
  normalizeToRecruitmentRole,
} from '../../hooks/useRecruitmentPermission';
import { RECRUITMENT_MODULES_REGISTRY } from '../../components/recruitment/RecruitmentWorkspaceShell';

describe('Recruitment Service Client & Pure Utilities', () => {
  it('buildRecruitmentQueryString serializes defined parameters and skips blanks', () => {
    const qs = buildRecruitmentQueryString({
      departmentId: 'ENG',
      page: 1,
      search: '',
      pool: undefined,
    });
    assert.equal(qs, '?departmentId=ENG&page=1');
  });

  it('formatRecruitmentCurrency formats numeric values via Intl.NumberFormat', () => {
    const formattedInr = formatRecruitmentCurrency(2400000, 'INR', 'en-IN');
    assert.ok(formattedInr.includes('24,00,000'));
    assert.equal(formatRecruitmentCurrency(undefined), '—');
  });

  it('maskCandidatePii masks emails and phone numbers by default', () => {
    const maskedEmail = maskCandidatePii('candidate.talent@example.com');
    assert.equal(maskedEmail, 'ca••••@example.com');
    const maskedPhone = maskCandidatePii('9876543210', 4);
    assert.equal(maskedPhone, '••••••3210');
  });

  it('RecruitmentHttpClient retries transient 503 GET requests once and returns JSON', async () => {
    let callCount = 0;
    const mockFetch: typeof fetch = async () => {
      callCount += 1;
      if (callCount === 1) {
        return new Response('Service Unavailable', { status: 503 });
      }
      return new Response(JSON.stringify({ ok: true, total: 23 }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const client = new RecruitmentHttpClient('/api/v1/recruitment', mockFetch);
    const result = await client.request<{ ok: boolean; total: number }>(
      'GET',
      '/dashboard/summary'
    );
    assert.equal(callCount, 2);
    assert.equal(result.ok, true);
    assert.equal(result.total, 23);
  });

  it('RecruitmentHttpClient surfaces 403 Forbidden as RecruitmentApiError with isPermissionDenied()', async () => {
    const mockFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          error: {
            code: 'FORBIDDEN',
            message: 'Role candidate cannot access Audit Logs',
          },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );

    const client = new RecruitmentHttpClient('/api/v1/recruitment', mockFetch);
    await assert.rejects(
      async () => {
        await client.request('GET', '/audit-logs');
      },
      (err: unknown) => {
        assert.ok(err instanceof RecruitmentApiError);
        assert.equal(err.isPermissionDenied(), true);
        assert.equal(err.status, 403);
        return true;
      }
    );
  });
});

describe('Recruitment Role-Based Access Control (RBAC) & 23-Module Registry', () => {
  it('registers all 23 Recruitment / ATS modules in sequential order', () => {
    assert.equal(RECRUITMENT_MODULES_REGISTRY.length, 23);
    assert.equal(RECRUITMENT_MODULES_REGISTRY[0].id, 'dashboard');
    assert.equal(RECRUITMENT_MODULES_REGISTRY[22].id, 'hiring-manager');
  });

  it('restricts candidate role strictly to Career Portal, Assessments, Video Interviews, and Notifications', () => {
    assert.equal(canRecruitmentRoleAccessModule('candidate', 'career-portal'), true);
    assert.equal(canRecruitmentRoleAccessModule('candidate', 'assessments'), true);
    assert.equal(canRecruitmentRoleAccessModule('candidate', 'video-interviews'), true);
    assert.equal(canRecruitmentRoleAccessModule('candidate', 'notifications'), true);
    assert.equal(canRecruitmentRoleAccessModule('candidate', 'candidates'), false);
    assert.equal(canRecruitmentRoleAccessModule('candidate', 'offers'), false);
    assert.equal(canRecruitmentRoleAccessModule('candidate', 'audit-logs'), false);
  });

  it('enforces PII reveal and settings configuration permissions by role', () => {
    const recruiterPerms = computeRecruitmentPermissions('recruiter');
    assert.equal(recruiterPerms.canRevealPii, true);
    assert.equal(recruiterPerms.canConfigureSettings, false);

    const interviewerPerms = computeRecruitmentPermissions('interviewer');
    assert.equal(interviewerPerms.canRevealPii, false);
    assert.equal(interviewerPerms.canSubmitScorecards, true);

    assert.equal(normalizeToRecruitmentRole('manager'), 'hiring_manager');
    assert.equal(normalizeToRecruitmentRole('executive'), 'approver');
  });
});
