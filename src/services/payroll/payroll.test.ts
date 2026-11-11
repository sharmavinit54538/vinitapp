import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  PayrollHttpClient,
  PayrollApiError,
  buildQueryString,
  formatPayrollCurrency,
  maskSensitiveField,
} from './client';
import {
  checkPayrollPermission,
  canRoleAccessModule,
  normalizePayrollRole,
} from '../../hooks/usePayrollPermission';

describe('Payroll Service Client & Pure Helpers', () => {
  it('buildQueryString serializes defined parameters and omits empty values', () => {
    const qs = buildQueryString({
      page: 2,
      pageSize: 25,
      search: '',
      department: 'Engineering',
      cycleId: undefined,
    });
    assert.equal(qs, '?page=2&pageSize=25&department=Engineering');
  });

  it('formatPayrollCurrency formats INR and USD numeric values via Intl.NumberFormat', () => {
    const formattedInr = formatPayrollCurrency(125000, 'INR', 0);
    assert.ok(formattedInr.includes('1,25,000') || formattedInr.includes('125,000'));
    assert.equal(formatPayrollCurrency(null, 'INR'), '—');
  });

  it('maskSensitiveField masks leading characters and preserves trailing digits', () => {
    assert.equal(maskSensitiveField('ABCDE1234F', 4), '••••••234F');
    assert.equal(maskSensitiveField('1234', 4), '••••');
    assert.equal(maskSensitiveField(null), '—');
  });

  it('PayrollHttpClient executes GET and retries transient 503 status once', async () => {
    let callCount = 0;
    const stubFetch: typeof fetch = async () => {
      callCount += 1;
      if (callCount === 1) {
        return new Response(JSON.stringify({ message: 'Service Temporarily Unavailable' }), {
          status: 503,
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ ok: true, cycleId: 'NOV-2026' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    };

    const client = new PayrollHttpClient('https://api.example.com', stubFetch);
    const result = await client.get<{ ok: boolean; cycleId: string }>(
      '/api/v1/payroll/runs/current',
      { retries: 1 }
    );
    assert.equal(callCount, 2);
    assert.equal(result.ok, true);
    assert.equal(result.cycleId, 'NOV-2026');
  });

  it('PayrollHttpClient surfaces 403 Forbidden as PayrollApiError with isPermissionDenied()', async () => {
    const stubFetch: typeof fetch = async () =>
      new Response(
        JSON.stringify({
          message: 'Insufficient role privilege for payroll rollback',
          code: 'RBAC_DENIED',
        }),
        { status: 403, headers: { 'Content-Type': 'application/json' } }
      );

    const client = new PayrollHttpClient('https://api.example.com', stubFetch);
    await assert.rejects(
      async () => {
        await client.post('/api/v1/payroll/runs/1/rollback', { reason: 'audit' });
      },
      (err: unknown) => {
        assert.ok(err instanceof PayrollApiError);
        assert.equal(err.statusCode, 403);
        assert.equal(err.isPermissionDenied(), true);
        assert.equal(err.code, 'RBAC_DENIED');
        return true;
      }
    );
  });
});

describe('Payroll Role-Based Access Control (RBAC) Matrix', () => {
  it('enforces rollback permission strictly for super_admin only', () => {
    assert.equal(checkPayrollPermission('super_admin', 'payroll.run.rollback'), true);
    assert.equal(checkPayrollPermission('hr_admin', 'payroll.run.rollback'), false);
    assert.equal(checkPayrollPermission('payroll_manager', 'payroll.run.rollback'), false);
    assert.equal(checkPayrollPermission('employee', 'payroll.run.rollback'), false);
  });

  it('restricts employee role to ESS My Pay and Notifications modules only', () => {
    assert.equal(canRoleAccessModule('employee', 'my-pay'), true);
    assert.equal(canRoleAccessModule('employee', 'notifications'), true);
    assert.equal(canRoleAccessModule('employee', 'pay-calendar'), false);
    assert.equal(canRoleAccessModule('employee', 'compensation'), false);
    assert.equal(canRoleAccessModule('employee', 'settings'), false);
  });

  it('normalizes external auth roles into strict PayrollRole values', () => {
    assert.equal(normalizePayrollRole('super_admin'), 'super_admin');
    assert.equal(normalizePayrollRole('executive'), 'finance_approver');
    assert.equal(normalizePayrollRole('employee'), 'employee');
  });
});
