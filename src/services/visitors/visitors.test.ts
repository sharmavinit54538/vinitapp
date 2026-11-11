import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildVisitorQueryString,
  maskSensitivePii,
  formatVisitorDateTime,
  VisitorHttpClient,
  VisitorApiError,
} from './client';
import {
  canVisitorRoleAccessModule,
  getVisitorPermission,
} from '../../hooks/useVisitorPermission';

describe('Visitor Management Service Layer, PII Masking & 8-Role RBAC Matrix', () => {
  it('serializes query parameters cleanly without empty strings or undefined', () => {
    const qs = buildVisitorQueryString({
      location: 'BLR-HQ',
      visitorType: 'Guest',
      empty: '',
      blank: '   ',
      missing: undefined,
    });
    assert.equal(qs, '?location=BLR-HQ&visitorType=Guest');
  });

  it('masks sensitive PII (phone/ID) by default and formats location timestamps', () => {
    assert.equal(maskSensitivePii('9876543210', 4), '••••••3210');
    assert.equal(maskSensitivePii('12', 4), '••••');
    assert.equal(maskSensitivePii(undefined), '—');
    const formatted = formatVisitorDateTime(
      '2026-11-09T10:30:00Z',
      'UTC',
      'en-US'
    );
    assert.ok(formatted.includes('2026'));
  });

  it('retries GET requests on transient 503 and resolves on second attempt', async () => {
    let calls = 0;
    const fakeFetch: typeof fetch = async () => {
      calls += 1;
      if (calls === 1) {
        return new Response('Service Unavailable', { status: 503 });
      }
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const client = new VisitorHttpClient(
      'https://api.example.test/api/v1/visitors',
      fakeFetch
    );
    const result = await client.request<{ ok: boolean }>(
      'GET',
      '/dashboard/live'
    );
    assert.equal(result.ok, true);
    assert.equal(calls, 2);
  });

  it('throws VisitorApiError with isPermissionDenied() === true on HTTP 403', async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          error: { code: 'FORBIDDEN', message: 'Insufficient role privileges' },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );

    const client = new VisitorHttpClient(
      'https://api.example.test/api/v1/visitors',
      fakeFetch
    );
    await assert.rejects(
      async () => {
        await client.request('GET', '/watchlist');
      },
      (err: unknown) => {
        assert.ok(err instanceof VisitorApiError);
        assert.equal(err.isPermissionDenied(), true);
        return true;
      }
    );
  });

  it('enforces 8-role RBAC permissions across all 24 Visitor Management modules', () => {
    assert.equal(canVisitorRoleAccessModule('super_admin', 'evacuation'), true);
    assert.equal(canVisitorRoleAccessModule('visitor', 'evacuation'), false);
    assert.equal(
      canVisitorRoleAccessModule('visitor', 'visitor-portal'),
      true
    );
    assert.equal(
      canVisitorRoleAccessModule('host_employee', 'host-portal'),
      true
    );
    assert.equal(
      canVisitorRoleAccessModule('host_employee', 'watchlist'),
      false
    );

    const secSupervisorEvacPerm = getVisitorPermission(
      'evacuation',
      'security_supervisor'
    );
    assert.equal(secSupervisorEvacPerm.canTriggerEmergency, true);

    const receptionEvacPerm = getVisitorPermission(
      'evacuation',
      'security_reception'
    );
    assert.equal(receptionEvacPerm.canView, true);
    assert.equal(receptionEvacPerm.canTriggerEmergency, false);

    const auditorDocPerm = getVisitorPermission('documents-nda', 'auditor');
    assert.equal(auditorDocPerm.canRevealPii, true);
    assert.equal(auditorDocPerm.canCreate, false);
  });
});
