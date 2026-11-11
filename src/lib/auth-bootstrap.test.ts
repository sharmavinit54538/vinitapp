import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getInitialOnboardingDraft,
  validateAdminProfileStep,
  validateCompanyStep,
  validateWorkspaceConfigStep,
} from './auth-bootstrap';

test('validateCompanyStep enforces required Company Name, Official Email, Contact Number, Country, and Timezone', () => {
  const draft = getInitialOnboardingDraft();
  const initialRes = validateCompanyStep(draft.company);
  assert.equal(initialRes.valid, false);
  assert.ok(initialRes.errors.companyName);
  assert.ok(initialRes.errors.officialEmail);
  assert.ok(initialRes.errors.contactNumber);

  const validRes = validateCompanyStep({
    ...draft.company,
    companyName: 'OFC360 Technologies Pvt. Ltd.',
    officialEmail: 'hr@ofc360.com',
    contactNumber: '+91 80 4092 1100',
    country: 'India',
    timezone: 'Asia/Kolkata',
  });
  assert.equal(validRes.valid, true);
  assert.deepEqual(validRes.errors, {});
});

test('validateAdminProfileStep enforces Admin Full Name, Official Email, Mobile Number, Designation, and Employee ID', () => {
  const draft = getInitialOnboardingDraft();
  const validRes = validateAdminProfileStep(draft.adminProfile);
  assert.equal(validRes.valid, true);

  const invalidRes = validateAdminProfileStep({
    ...draft.adminProfile,
    fullName: '',
    employeeCode: '',
  });
  assert.equal(invalidRes.valid, false);
  assert.ok(invalidRes.errors.fullName);
  assert.ok(invalidRes.errors.employeeCode);
});

test('validateWorkspaceConfigStep enforces Working Days and at least one Department', () => {
  const draft = getInitialOnboardingDraft();
  const validRes = validateWorkspaceConfigStep(draft.workspaceConfig);
  assert.equal(validRes.valid, true);

  const emptyDeptRes = validateWorkspaceConfigStep({
    ...draft.workspaceConfig,
    departments: [],
  });
  assert.equal(emptyDeptRes.valid, false);
  assert.ok(emptyDeptRes.errors.departments);
});
