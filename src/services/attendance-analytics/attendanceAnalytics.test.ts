import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  AttendanceAnalyticsApiError,
  AttendanceAnalyticsHttpClient,
  buildAttendanceQueryString,
  formatAttendanceDateOnly,
  formatShiftWindowWithMidnightCheck,
  maskGeoLocationCoord,
} from './client';
import { evaluateAttendanceAnalyticsPermission } from '../../hooks/useAttendanceAnalyticsPermission';

describe('Attendance Analytics Service Layer & Pure Utilities', () => {
  it('buildAttendanceQueryString serializes shared filter parameters cleanly', () => {
    const qs = buildAttendanceQueryString({
      dateRange: 'Last30Days',
      department: 'Engineering',
      location: '',
      shift: undefined,
      page: 2,
    });
    assert.equal(qs, '?dateRange=Last30Days&department=Engineering&page=2');
    assert.equal(buildAttendanceQueryString({}), '');
  });

  it('formatAttendanceDateOnly formats YYYY-MM-DD safely via UTC noon without off-by-one shifts', () => {
    const formatted = formatAttendanceDateOnly('2026-11-09', 'en-GB');
    assert.ok(formatted.includes('2026'));
    assert.ok(formatted.includes('09'));
    assert.equal(formatAttendanceDateOnly(null), '—');
  });

  it('formatShiftWindowWithMidnightCheck flags night shifts crossing midnight', () => {
    const dayShift = formatShiftWindowWithMidnightCheck('09:00', '18:00');
    assert.equal(dayShift.crossesMidnight, false);
    assert.equal(dayShift.label, '09:00 – 18:00');

    const nightShift = formatShiftWindowWithMidnightCheck('22:00', '06:00');
    assert.equal(nightShift.crossesMidnight, true);
    assert.ok(nightShift.label.includes('+1d Night Shift'));
  });

  it('maskGeoLocationCoord masks decimal coordinates for privacy', () => {
    const masked = maskGeoLocationCoord('12.9716, 77.5946');
    assert.equal(masked, '12.97••, 77.59••');
  });

  it('AttendanceAnalyticsHttpClient handles 403 FORBIDDEN and transient 503 retries', async () => {
    let callCount = 0;
    const customFetch: typeof fetch = async () => {
      callCount += 1;
      if (callCount === 1) {
        return new Response('Service Unavailable', { status: 503 });
      }
      return new Response(
        JSON.stringify({
          error: { code: 'FORBIDDEN', message: 'Role restricted' },
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );
    };

    const client = new AttendanceAnalyticsHttpClient(
      'https://api.example.test/api/v1/attendance-analytics',
      customFetch
    );

    await assert.rejects(
      async () => {
        await client.request('GET', '/overview', undefined, {
          retriesForGet: 1,
        });
      },
      (err: unknown) => {
        assert.ok(err instanceof AttendanceAnalyticsApiError);
        assert.equal(err.status, 403);
        assert.equal(err.isPermissionDenied(), true);
        return true;
      }
    );
    assert.equal(callCount, 2);
  });

  it('evaluateAttendanceAnalyticsPermission enforces 9-role RBAC matrix across all 23 modules', () => {
    const superAdminPerm = evaluateAttendanceAnalyticsPermission(
      'super_admin',
      'anomalies'
    );
    assert.equal(superAdminPerm.canView, true);
    assert.equal(superAdminPerm.canReviewAnomalies, true);
    assert.equal(superAdminPerm.canViewRawGeoCoords, true);

    const auditorPerm = evaluateAttendanceAnalyticsPermission(
      'auditor',
      'audit-logs'
    );
    assert.equal(auditorPerm.canView, true);
    assert.equal(auditorPerm.canManage, false);
    assert.equal(auditorPerm.canReviewAnomalies, false);

    const employeeOverview = evaluateAttendanceAnalyticsPermission(
      'employee',
      'overview'
    );
    assert.equal(employeeOverview.canView, false);

    const employeeSelf = evaluateAttendanceAnalyticsPermission(
      'employee',
      'employee-view'
    );
    assert.equal(employeeSelf.canView, true);
    assert.equal(employeeSelf.canExport, false);
  });
});
