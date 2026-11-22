import test from 'node:test';
import assert from 'node:assert/strict';
import {
  formatDynamicOverviewDate,
  getCurrentYearHolidayLabel,
  resolveDataSectionState,
  formatMetricValue,
  getAuthorizedQuickActions,
  getInitials,
} from './linkedin-ui-helpers';

test('formatDynamicOverviewDate formats a Date dynamically without hardcoding', () => {
  const sample = new Date(2026, 10, 21); // Nov 21, 2026
  const formatted = formatDynamicOverviewDate(sample);
  assert.match(formatted, /2026/);
  assert.match(formatted, /Nov/);
  assert.match(formatted, /21/);
});

test('getCurrentYearHolidayLabel reflects the provided date year', () => {
  assert.equal(getCurrentYearHolidayLabel(new Date(2026, 5, 1)), '2026 holidays');
  assert.equal(getCurrentYearHolidayLabel(new Date(2027, 0, 15)), '2027 holidays');
});

test('resolveDataSectionState never returns empty when loading or errored', () => {
  assert.equal(
    resolveDataSectionState({ isLoading: true, isError: false, itemCount: 0 }),
    'loading'
  );
  assert.equal(
    resolveDataSectionState({ isLoading: false, isError: true, itemCount: 0 }),
    'error'
  );
  assert.equal(
    resolveDataSectionState({ isLoading: false, isError: false, itemCount: null }),
    'error'
  );
  assert.equal(
    resolveDataSectionState({ isLoading: false, isError: false, itemCount: 0 }),
    'empty'
  );
  assert.equal(
    resolveDataSectionState({ isLoading: false, isError: false, itemCount: 3 }),
    'populated'
  );
});

test('formatMetricValue never renders unavailable or errored data as zero', () => {
  assert.equal(
    formatMetricValue({ value: undefined, isLoading: false, isError: false }),
    '—'
  );
  assert.equal(
    formatMetricValue({ value: 0, isLoading: false, isError: true }),
    '—'
  );
  assert.equal(
    formatMetricValue({ value: 12, isLoading: true, isError: false }),
    '…'
  );
  assert.equal(
    formatMetricValue({ value: 0, isLoading: false, isError: false }),
    '0'
  );
  assert.equal(
    formatMetricValue({ value: 94, isLoading: false, isError: false, suffix: '%' }),
    '94%'
  );
});

test('getAuthorizedQuickActions enforces role-based visibility', () => {
  const adminActions = getAuthorizedQuickActions(true);
  assert.deepEqual(
    adminActions.map((a) => a.id),
    ['add_employee', 'notice', 'check_in', 'payroll']
  );

  const nonAdminActions = getAuthorizedQuickActions(false);
  assert.deepEqual(
    nonAdminActions.map((a) => a.id),
    ['check_in']
  );
});

test('getInitials computes clean initials', () => {
  assert.equal(getInitials('Aarav Sharma'), 'AS');
  assert.equal(getInitials('Priya'), 'PR');
  assert.equal(getInitials(''), 'U');
  assert.equal(getInitials(null), 'U');
});
