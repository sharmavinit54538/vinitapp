import assert from 'node:assert/strict';
import test from 'node:test';
import {
  buildEmployeeDigitalProfiles,
  classifyExpiryBucket,
  computeDocumentKpis,
  filterAndSortDocuments,
  getExpiryDaysRemaining,
  INITIAL_DOCUMENTS,
  INITIAL_HR_TEMPLATES,
  INITIAL_SECURITY_SETTINGS,
  interpolateTemplateContent,
  REFERENCE_TODAY_ISO,
  SEED_EMPLOYEES,
  validateUploadFile,
  validateVerificationDecision,
} from './documentsEngine';

test('getExpiryDaysRemaining and classifyExpiryBucket categorize expiry windows accurately', () => {
  assert.equal(getExpiryDaysRemaining(null, '2026-11-11'), null);
  assert.equal(classifyExpiryBucket(null, '2026-11-11'), 'No Expiry');

  assert.equal(getExpiryDaysRemaining('2026-10-15', '2026-11-11'), -27);
  assert.equal(classifyExpiryBucket('2026-10-15', '2026-11-11'), 'Expired');

  assert.equal(getExpiryDaysRemaining('2026-11-16', '2026-11-11'), 5);
  assert.equal(classifyExpiryBucket('2026-11-16', '2026-11-11'), 'Expiring in 7 Days');

  assert.equal(getExpiryDaysRemaining('2026-11-23', '2026-11-11'), 12);
  assert.equal(classifyExpiryBucket('2026-11-23', '2026-11-11'), 'Expiring in 15 Days');

  assert.equal(getExpiryDaysRemaining('2026-12-05', '2026-11-11'), 24);
  assert.equal(classifyExpiryBucket('2026-12-05', '2026-11-11'), 'Expiring in 30 Days');

  assert.equal(getExpiryDaysRemaining('2026-12-28', '2026-11-11'), 47);
  assert.equal(classifyExpiryBucket('2026-12-28', '2026-11-11'), 'Expiring in 60 Days');

  assert.equal(classifyExpiryBucket('2027-06-01', '2026-11-11'), 'Valid');
});

test('buildEmployeeDigitalProfiles and computeDocumentKpis calculate accurate metrics', () => {
  const profiles = buildEmployeeDigitalProfiles(INITIAL_DOCUMENTS);
  assert.equal(profiles.length, SEED_EMPLOYEES.length);

  const kpis = computeDocumentKpis(INITIAL_DOCUMENTS, profiles, REFERENCE_TODAY_ISO);
  assert.equal(kpis.totalDocuments, 12);
  assert.equal(kpis.verifiedDocuments, 7);
  assert.equal(kpis.pendingVerification, 3); // 2 Pending + 1 Under Review
  assert.equal(kpis.rejectedDocuments, 1);
  assert.equal(kpis.expiredDocumentsCount, 1);
  assert.equal(kpis.expiringSoonCount, 4); // 5d, 12d, 24d, 47d
  assert.ok(kpis.missingDocumentsCount > 0);
  assert.ok(kpis.completionRatePct >= 0 && kpis.completionRatePct <= 100);
});

test('filterAndSortDocuments filters by status, department, category, and expiry bucket', () => {
  const pendingQueue = filterAndSortDocuments(INITIAL_DOCUMENTS, {
    verificationStatus: 'PendingQueue',
  });
  assert.equal(pendingQueue.length, 3);

  const engDocs = filterAndSortDocuments(INITIAL_DOCUMENTS, {
    department: 'Engineering',
  });
  assert.ok(engDocs.every((d) => d.department === 'Engineering'));

  const expiringSoon = filterAndSortDocuments(INITIAL_DOCUMENTS, {
    expiryFilter: 'EXPIRING_SOON',
  });
  assert.equal(expiringSoon.length, 4);

  const expiredOnly = filterAndSortDocuments(INITIAL_DOCUMENTS, {
    expiryFilter: 'EXPIRED',
  });
  assert.equal(expiredOnly.length, 1);
  assert.equal(expiredOnly[0].id, 'DOC-2026-007');
});

test('validateUploadFile enforces extensions and max size limit', () => {
  const validPdf = validateUploadFile(
    'Aarav_PAN_Card.pdf',
    550 * 1024,
    INITIAL_SECURITY_SETTINGS
  );
  assert.equal(validPdf.valid, true);
  assert.equal(validPdf.ext, 'PDF');

  const invalidExt = validateUploadFile(
    'script_payload.exe',
    1024,
    INITIAL_SECURITY_SETTINGS
  );
  assert.equal(invalidExt.valid, false);
  assert.ok(invalidExt.error?.includes('Unsupported file format'));

  const oversized = validateUploadFile(
    'HighRes_Scan.png',
    15 * 1024 * 1024,
    INITIAL_SECURITY_SETTINGS
  );
  assert.equal(oversized.valid, false);
  assert.ok(oversized.error?.includes('exceeds maximum allowed size'));
});

test('validateVerificationDecision requires remarks on Rejection or Resubmission', () => {
  const validApprove = validateVerificationDecision('Verified', '');
  assert.equal(validApprove.valid, true);

  const invalidReject = validateVerificationDecision('Rejected', '   ');
  assert.equal(invalidReject.valid, false);

  const validReject = validateVerificationDecision(
    'Rejected',
    'Signature block is cropped out at bottom margin.'
  );
  assert.equal(validReject.valid, true);
});

test('interpolateTemplateContent replaces dynamic employee placeholders', () => {
  const offerTemplate = INITIAL_HR_TEMPLATES[0];
  const emp = SEED_EMPLOYEES[0];
  const rendered = interpolateTemplateContent(
    offerTemplate.bodyContent,
    emp,
    'OFC/HR/2026/OFF-101',
    '2026-11-11'
  );
  assert.ok(rendered.includes('Aarav Sharma'));
  assert.ok(rendered.includes('EMP-1001'));
  assert.ok(rendered.includes('Principal Product Engineer'));
  assert.ok(rendered.includes('OFC/HR/2026/OFF-101'));
  assert.ok(!rendered.includes('{{EMPLOYEE_NAME}}'));
});
