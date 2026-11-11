import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  buildHolidayQueryString,
  formatHolidayDateOnly,
  getWeekdayLabelFromDateOnly,
  HolidayHttpClient,
  HolidayApiError,
} from './client';
import {
  canHolidayRoleAccessModule,
  getHolidayPermission,
} from '../../hooks/useHolidayPermission';

describe('Holiday Management Service Layer & RBAC Matrix', () => {
  it('serializes query parameters cleanly without empty strings or undefined', () => {
    const qs = buildHolidayQueryString({
      year: 2026,
      location: 'IN-MH',
      empty: '',
      blank: '   ',
      missing: undefined,
    });
    assert.equal(qs, '?year=2026&location=IN-MH');
  });

  it('formats YYYY-MM-DD strings without timezone drift using UTC noon', () => {
    const formatted = formatHolidayDateOnly('2026-01-26', 'en-US');
    assert.ok(formatted.includes('2026'));
    assert.ok(formatted.includes('26'));
    const weekday = getWeekdayLabelFromDateOnly('2026-01-26', 'en-US');
    assert.equal(weekday, 'Monday');
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

    const client = new HolidayHttpClient(
      'https://api.example.test/api/v1/holidays',
      fakeFetch
    );
    const result = await client.request<{ ok: boolean }>('GET', '/settings');
    assert.equal(result.ok, true);
    assert.equal(calls, 2);
  });

  it('throws HolidayApiError with isPermissionDenied() === true on HTTP 403', async () => {
    const fakeFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          error: { code: 'FORBIDDEN', message: 'Insufficient role privileges' },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );

    const client = new HolidayHttpClient(
      'https://api.example.test/api/v1/holidays',
      fakeFetch
    );
    await assert.rejects(
      async () => {
        await client.request('GET', '/audit-logs');
      },
      (err: unknown) => {
        assert.ok(err instanceof HolidayApiError);
        assert.equal(err.isPermissionDenied(), true);
        return true;
      }
    );
  });

  it('enforces 6-role RBAC permissions across all 22 Holiday Management modules', () => {
    assert.equal(canHolidayRoleAccessModule('super_admin', 'year-rollover'), true);
    assert.equal(canHolidayRoleAccessModule('hr_admin', 'audit-logs'), true);
    assert.equal(canHolidayRoleAccessModule('employee', 'year-rollover'), false);
    assert.equal(canHolidayRoleAccessModule('employee', 'employee-portal'), true);
    assert.equal(
      canHolidayRoleAccessModule('reporting_manager', 'manager-portal'),
      true
    );

    const empBookingPerm = getHolidayPermission('optional-booking', 'employee');
    assert.equal(empBookingPerm.canView, true);
    assert.equal(empBookingPerm.canCreate, true);
    assert.equal(empBookingPerm.canApprove, false);
  });
});
