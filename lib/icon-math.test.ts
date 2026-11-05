import test from 'node:test';
import assert from 'node:assert/strict';
import {
  DEFAULT_ICON_CONFIG,
  generateSquirclePath,
  computeLogoGeometry,
  getContrastRatio,
  serializeIconToSvgString,
} from './icon-math';
import {
  INITIAL_EMPLOYEES,
  INITIAL_LEAVE_REQUESTS,
  filterEmployees,
  updateLeaveRequestStatus,
} from './hrms-data';

test('OFC360 default brand colors match #081B3A and #0052FF official logo specification', () => {
  assert.equal(DEFAULT_ICON_CONFIG.deepNavy, '#081B3A');
  assert.equal(DEFAULT_ICON_CONFIG.electricBlue, '#0052FF');
  assert.equal(DEFAULT_ICON_CONFIG.surfaceStyle, 'electric-gradient');
  assert.equal(DEFAULT_ICON_CONFIG.showSpeedStreaks, true);
});

test('Squircle path generates valid closed SVG path string', () => {
  const path = generateSquirclePath(1024, 64, 228);
  assert.equal(path.startsWith('M '), true);
  assert.equal(path.endsWith('Z'), true);
});

test('Logo geometry computes circular O, S-curve aerodynamic F wings, 3D bevels, and 4 speed streaks', () => {
  const geo = computeLogoGeometry(DEFAULT_ICON_CONFIG);
  assert.equal(geo.outerRadius > geo.innerRadius, true);
  assert.equal(geo.ringCenter.x, 374);
  assert.equal(geo.ringCenter.y, 524);
  assert.equal(geo.upperWingPath.includes('M '), true);
  assert.equal(geo.upperWingBevelPath.includes('M '), true);
  assert.equal(geo.middleWingPath.includes('M '), true);
  assert.equal(geo.topStreak1Path.includes('M '), true);
  assert.equal(geo.bottomStreak2Path.includes('M '), true);
});

test('WCAG contrast calculation confirms high legibility for #081B3A on #FFFFFF', () => {
  const ratio = getContrastRatio('#081B3A', '#FFFFFF');
  assert.equal(ratio > 14, true);
});

test('SVG serializer includes embedded 360 core, gradient stops, squircle frame, rotationAngle transform, and iconOpacity', () => {
  assert.equal(DEFAULT_ICON_CONFIG.iconOpacity, 100);
  const svg = serializeIconToSvgString(
    { ...DEFAULT_ICON_CONFIG, rotationAngle: 45, iconOpacity: 65 },
    true
  );
  assert.equal(svg.includes('<svg'), true);
  assert.equal(svg.includes('>360</text>'), true);
  assert.equal(svg.includes('#081B3A'), true);
  assert.equal(svg.includes('#0052FF'), true);
  assert.equal(svg.includes('transform="rotate(45 512 512)"'), true);
  assert.equal(svg.includes('<g opacity="0.65">'), true);
});

test('HRMS simulator filters employees and updates leave request status accurately', () => {
  const filtered = filterEmployees(INITIAL_EMPLOYEES, 'Elena', 'All');
  assert.equal(filtered.length, 1);
  assert.equal(filtered[0].id, 'EMP-3601');

  const updated = updateLeaveRequestStatus(INITIAL_LEAVE_REQUESTS, 'LR-801', 'Approved');
  const target = updated.find((r) => r.id === 'LR-801');
  assert.equal(target?.status, 'Approved');
});
