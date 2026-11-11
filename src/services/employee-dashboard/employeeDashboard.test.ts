import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  computeLiveWorkingHoursDisplay,
  computeServerClockOffsetMs,
  EmployeeDashboardApiError,
  EmployeeDashboardHttpClient,
  formatEmployeeDateOnly,
  formatEmployeeShiftWindow,
} from './client';
import {
  detectForbiddenEmployeeIdInSearch,
  evaluateEmployeeDashboardPermission,
} from '../../hooks/useEmployeeDashboardPermission';

describe('Employee Dashboard Pure Logic & Network Client', () => {
  it('computes live working hours timer seeded from server punchInTimeIso and clock offset', () => {
    const clientNowMs = Date.parse('2026-11-09T10:00:00Z');
    const serverTimeIso = '2026-11-09T10:05:00Z'; // Server is +5m ahead
    const punchInTimeIso = '2026-11-09T08:05:00Z'; // 2 hours before serverTimeIso

    const offsetMs = computeServerClockOffsetMs(serverTimeIso, clientNowMs);
    assert.equal(offsetMs, 5 * 60 * 1000);

    const timer = computeLiveWorkingHoursDisplay(
      punchInTimeIso,
      offsetMs,
      0,
      clientNowMs
    );
    assert.equal(timer.totalSeconds, 7200);
    assert.equal(timer.formattedHHMMSS, '02:00:00');
  });

  it('formats date-only strings via UTC noon without off-by-one timezone shifts', () => {
    const formatted = formatEmployeeDateOnly('2026-11-09', 'en-IN');
    assert.match(formatted, /09/);
    assert.match(formatted, /2026/);
  });

  it('flags night shifts crossing midnight with (+1d Night Shift)', () => {
    const dayShift = formatEmployeeShiftWindow('09:30', '18:30');
    assert.equal(dayShift.crossesMidnight, false);
    assert.equal(dayShift.label, '09:30 – 18:30');

    const nightShift = formatEmployeeShiftWindow('21:30', '06:30');
    assert.equal(nightShift.crossesMidnight, true);
    assert.equal(nightShift.label, '21:30 – 06:30 (+1d Night Shift)');
  });

  it('detects forbidden employeeId parameters in URL query strings', () => {
    assert.equal(detectForbiddenEmployeeIdInSearch(''), false);
    assert.equal(detectForbiddenEmployeeIdInSearch('?month=2026-11'), false);
    assert.equal(
      detectForbiddenEmployeeIdInSearch('?employeeId=EMP-102'),
      true
    );
    assert.equal(detectForbiddenEmployeeIdInSearch('?user_id=99'), true);
  });

  it('gates manager-extras widget to reporting_manager role and conditional widgets to flags', () => {
    const empPerm = evaluateEmployeeDashboardPermission('employee', []);
    assert.equal(empPerm.isManager, false);
    assert.equal(empPerm.canViewWidget('manager-extras'), false);
    assert.equal(
      empPerm.canViewWidget('travel', { travel: false }),
      false
    );
    assert.equal(
      empPerm.canViewWidget('travel', { travel: true }),
      true
    );

    const mgrPerm = evaluateEmployeeDashboardPermission(
      'reporting_manager',
      []
    );
    assert.equal(mgrPerm.isManager, true);
    assert.equal(
      mgrPerm.canViewWidget('manager-extras', { managerExtras: true }),
      true
    );
  });

  it('retries idempotent GET on 503 and classifies 403/404 errors accurately', async () => {
    let attempts = 0;
    const mockFetch: typeof fetch = async () => {
      attempts += 1;
      if (attempts === 1) {
        return new Response(JSON.stringify({ message: 'Gateway busy' }), {
          status: 503,
        });
      }
      return new Response(
        JSON.stringify({ asOf: '2026-11-09T12:00:00Z', ok: true }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const client = new EmployeeDashboardHttpClient(
      'https://api.example.test/api/v1/employee-dashboard',
      mockFetch
    );
    const res = await client.request<{ asOf: string; ok: boolean }>(
      'GET',
      '/today'
    );
    assert.equal(attempts, 2);
    assert.equal(res.ok, true);

    const forbiddenFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({ code: 'FORBIDDEN', message: 'Denied' }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    const forbiddenClient = new EmployeeDashboardHttpClient(
      'https://api.example.test/api/v1/employee-dashboard',
      forbiddenFetch
    );

    await assert.rejects(
      () => forbiddenClient.request('GET', '/manager-extras'),
      (err: unknown) =>
        err instanceof EmployeeDashboardApiError && err.isPermissionDenied()
    );
  });
});
