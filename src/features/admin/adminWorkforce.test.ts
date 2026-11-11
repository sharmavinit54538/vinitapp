import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { parseDepartmentsCsv } from './departments/departmentsThunk';
import {
  parseEmployeesCsv,
  adminEmployeeFormSchema,
} from './employees/employeesThunk';

describe('HR Admin Departments & Employees Logic', () => {
  it('parses department CSV rows accurately including budgets, headcount limits, and duplicate code detection', () => {
    const csv = [
      'name,code,parentDepartmentName,managerName,budget,headcountLimit,description',
      'Platform Security,SEC,Engineering,Vikram Nair,4500000,20,Zero-trust cloud security',
      'Data Science,DATA,Engineering,Priya Patel,6000000,25,ML & Predictive analytics',
      'Duplicate Security,SEC,Engineering,Vikram Nair,1000000,10,Should fail duplicate check',
    ].join('\n');

    const { validRows, errors } = parseDepartmentsCsv(csv);
    assert.equal(validRows.length, 2);
    assert.equal(errors.length, 1);
    assert.equal(validRows[0].name, 'Platform Security');
    assert.equal(validRows[0].code, 'SEC');
    assert.equal(validRows[0].budget, 4500000);
    assert.equal(validRows[0].headcountLimit, 20);
    assert.equal(validRows[1].code, 'DATA');
  });

  it('validates employee onboarding schema and enforces valid system access roles', () => {
    const valid = adminEmployeeFormSchema.safeParse({
      firstName: 'Neha',
      lastName: 'Kapoor',
      officialEmail: 'neha.kapoor@ofc360.io',
      mobileNumber: '+91 98765 12345',
      gender: 'Female',
      dateOfBirth: '1996-05-15',
      employeeCode: 'EMP-3699',
      department: 'Engineering',
      designation: 'Lead Backend Architect',
      reportingManager: 'Aarav Sharma',
      dateOfJoining: '2025-04-01',
      employmentType: 'Full-time',
      workMode: 'Hybrid',
      probationPeriod: '3 months',
      ctcStructure: 'Standard Tech Band A (₹12L – ₹18L)',
      defaultShift: 'General Shift (09:30 - 18:30)',
      systemRole: 'IT-Admin',
      sendOnboardingInvite: true,
    });

    assert.equal(valid.success, true);

    const invalidEmail = adminEmployeeFormSchema.safeParse({
      firstName: 'A',
      lastName: 'B',
      officialEmail: 'not-an-email',
      mobileNumber: '123',
      gender: 'Male',
      dateOfBirth: '1995-01-01',
      employeeCode: 'EMP-1',
      department: '',
      designation: '',
      reportingManager: 'Aarav Sharma',
      dateOfJoining: '2025-04-01',
      employmentType: 'Full-time',
      workMode: 'Office',
      probationPeriod: '6 months',
      ctcStructure: 'Standard Tech Band A',
      defaultShift: 'General Shift (09:30 - 18:30)',
      systemRole: 'Employee',
      sendOnboardingInvite: false,
    });

    assert.equal(invalidEmail.success, false);
  });

  it('parses bulk employee CSV rows with role normalization and invite flags', () => {
    const csv = [
      'firstName,lastName,officialEmail,mobileNumber,employeeCode,department,designation,systemRole',
      'Siddharth,Rao,siddharth.rao@ofc360.io,+91 98201 11223,EMP-3701,Engineering,Engineering Manager,Manager',
      'Meera,Joshi,meera.joshi@ofc360.io,+91 98201 44556,EMP-3702,Operations,VP Operations,Executive',
    ].join('\n');

    const { validRows, errors } = parseEmployeesCsv(csv);
    assert.equal(errors.length, 0);
    assert.equal(validRows.length, 2);
    assert.equal(validRows[0].systemRole, 'Manager');
    assert.equal(validRows[0].sendOnboardingInvite, true);
    assert.equal(validRows[1].systemRole, 'Executive');
  });
});
