import test from 'node:test';
import assert from 'node:assert/strict';
import {
  applyTicketReplyAndStatus,
  assignAssetToEmployee,
  buildDeterministicQrMatrix,
  computeItAdminDashboardKpis,
  confirmExitAssetReturn,
  createInitialItAdminPortalState,
  logAssetRepair,
  returnAssetToPool,
  signOffOffboardingClearance,
  validateAssetPayload,
  validateNewUserProvisioning,
} from './it-admin-portal-logic';

test('computeItAdminDashboardKpis computes accurate asset, ticket, clearance, and MFA adoption counts', () => {
  const state = createInitialItAdminPortalState();
  const kpis = computeItAdminDashboardKpis(state);

  assert.equal(kpis.totalActiveAssets, state.assets.length);
  assert.ok(kpis.assignedAssetsCount >= 6);
  assert.ok(kpis.availableAssetsCount >= 3);
  assert.equal(kpis.inRepairAssetsCount, 1);
  assert.equal(kpis.openTicketsCount, 4);
  assert.equal(kpis.highCriticalTicketsCount, 3);
  assert.equal(kpis.pendingClearancesCount, 3);
  assert.equal(kpis.activeUsersCount, 6);
  assert.equal(kpis.mfaAdoptionPct, 83);
});

test('validateAssetPayload rejects missing fields and accepts valid asset details', () => {
  const bad = validateAssetPayload({
    assetTag: 'OF',
    brandModel: 'Dell',
    serialNumber: '123',
    purchaseDate: 'invalid',
    warrantyExpiry: '2027-01-01',
  });
  assert.equal(bad.valid, false);

  const ok = validateAssetPayload({
    assetTag: 'OFC-MBP-990',
    brandModel: 'Apple MacBook Pro 14',
    serialNumber: 'C02TEST990',
    purchaseDate: '2026-11-01',
    warrantyExpiry: '2029-11-01',
  });
  assert.equal(ok.valid, true);
});

test('assignAssetToEmployee, returnAssetToPool, and logAssetRepair maintain asset lifecycle integrity', () => {
  const state = createInitialItAdminPortalState();
  const availAsset = state.assets.find((a) => a.status === 'Available');
  assert.ok(availAsset);

  const assignedRes = assignAssetToEmployee(state.assets, availAsset.id, {
    employeeId: 'EMP-2048',
    fullName: 'Rohan Kulkarni',
    department: 'Core Engineering',
  });
  assert.equal(assignedRes.valid, true);
  const updatedAsset = assignedRes.assets.find((a) => a.id === availAsset.id);
  assert.equal(updatedAsset?.status, 'Assigned');
  assert.equal(updatedAsset?.assignedToEmployeeId, 'EMP-2048');

  const repairBlock = assignAssetToEmployee(state.assets, 'AST-104', {
    employeeId: 'EMP-2048',
    fullName: 'Rohan Kulkarni',
    department: 'Core Engineering',
  });
  assert.equal(repairBlock.valid, false);

  const repaired = logAssetRepair(assignedRes.assets, availAsset.id, {
    vendor: 'Dell ProSupport',
    issueSummary: 'Display panel flicker on wake',
    costInr: 3200,
    markCompleted: false,
  });
  assert.equal(repaired.valid, true);
  assert.equal(repaired.assets.find((a) => a.id === availAsset.id)?.status, 'In Repair');

  const returned = returnAssetToPool(repaired.assets, availAsset.id, 'Good');
  assert.equal(returned.find((a) => a.id === availAsset.id)?.status, 'Available');
  assert.equal(returned.find((a) => a.id === availAsset.id)?.assignedToEmployeeId, undefined);
});

test('applyTicketReplyAndStatus updates replies, internal notes, assignee, and resolution status', () => {
  const state = createInitialItAdminPortalState();
  const res = applyTicketReplyAndStatus(state.tickets, 'ITK-701', {
    replyText: 'Issued fresh WireGuard peer config.',
    isInternalNote: false,
    nextStatus: 'Resolved',
    assignToAgent: { id: 'IT-302', name: 'Vikram Deshpande' },
  });
  assert.equal(res.valid, true);
  const ticket = res.tickets.find((t) => t.id === 'ITK-701');
  assert.equal(ticket?.status, 'Resolved');
  assert.equal(ticket?.assignedToName, 'Vikram Deshpande');
  assert.equal(ticket?.messages.length, 2);
});

test('confirmExitAssetReturn and signOffOffboardingClearance enforce hardware return & access revocation before sign-off', () => {
  const state = createInitialItAdminPortalState();

  const blocked = signOffOffboardingClearance(
    state.offboardingClearances,
    'OFF-901',
    'Vikram Deshpande'
  );
  assert.equal(blocked.valid, false);

  const step1 = confirmExitAssetReturn(
    state.offboardingClearances,
    state.assets,
    'OFF-901',
    'AST-110'
  );
  const step2 = confirmExitAssetReturn(
    step1.clearances,
    step1.assets,
    'OFF-901',
    'AST-111'
  );
  assert.equal(step2.assets.find((a) => a.id === 'AST-110')?.status, 'Available');
  assert.equal(step2.assets.find((a) => a.id === 'AST-111')?.status, 'Available');

  const withAccessRevoked = step2.clearances.map((c) =>
    c.id === 'OFF-901'
      ? { ...c, ssoRevoked: true, emailArchived: true, badgeDeactivated: true }
      : c
  );

  const cleared = signOffOffboardingClearance(
    withAccessRevoked,
    'OFF-901',
    'Vikram Deshpande'
  );
  assert.equal(cleared.valid, true);
  assert.equal(cleared.clearances[0]?.clearanceStatus, 'Cleared');
});

test('validateNewUserProvisioning and buildDeterministicQrMatrix behave deterministically', () => {
  assert.equal(
    validateNewUserProvisioning({
      fullName: 'A',
      email: 'bad',
      employeeId: 'E1',
      department: 'IT',
    }).valid,
    false
  );
  assert.equal(
    validateNewUserProvisioning({
      fullName: 'Kiran Patel',
      email: 'kiran.patel@ofc360.com',
      employeeId: 'EMP-2105',
      department: 'Engineering',
    }).valid,
    true
  );

  const m1 = buildDeterministicQrMatrix('OFC360:ASSET:OFC-MBP-0842');
  const m2 = buildDeterministicQrMatrix('OFC360:ASSET:OFC-MBP-0842');
  assert.equal(m1.length, 9);
  assert.deepEqual(m1, m2);
});
