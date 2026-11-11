import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AdminEmployeeRecord,
  bulkImportAdminEmployeesThunk,
  createAdminEmployeeThunk,
  fetchAdminEmployeesThunk,
} from './employeesThunk';

export interface AdminEmployeesState {
  items: AdminEmployeeRecord[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

export const DEFAULT_ADMIN_EMPLOYEES: AdminEmployeeRecord[] = [
  {
    id: 'EMP-REC-1',
    firstName: 'Aarav',
    lastName: 'Sharma',
    fullName: 'Aarav Sharma',
    officialEmail: 'aarav.sharma@ofc360.com',
    mobileNumber: '+91 98201 11223',
    gender: 'Male',
    dateOfBirth: '1990-04-12',
    employeeCode: 'EMP-001',
    department: 'People Operations',
    designation: 'VP People Operations',
    reportingManager: 'Board of Directors',
    dateOfJoining: '2024-01-10',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    probationPeriod: '3 months',
    ctcStructure: 'Leadership Band C (₹30L+)',
    defaultShift: 'General Shift (09:30 - 18:30)',
    systemRole: 'Executive',
    sendOnboardingInvite: true,
    status: 'Active',
    createdAt: '2024-01-10',
  },
  {
    id: 'EMP-REC-2',
    firstName: 'Rohan',
    lastName: 'Verma',
    fullName: 'Rohan Verma',
    officialEmail: 'rohan.verma@ofc360.com',
    mobileNumber: '+91 98201 44556',
    gender: 'Male',
    dateOfBirth: '1994-08-22',
    employeeCode: 'EMP-102',
    department: 'Engineering',
    designation: 'Engineering Manager',
    reportingManager: 'Aarav Sharma',
    dateOfJoining: '2025-03-01',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    probationPeriod: '6 months',
    ctcStructure: 'Senior Band B (₹18L – ₹30L)',
    defaultShift: 'General Shift (09:30 - 18:30)',
    systemRole: 'Manager',
    sendOnboardingInvite: true,
    status: 'Active',
    createdAt: '2025-03-01',
  },
];

const initialState: AdminEmployeesState = {
  items: DEFAULT_ADMIN_EMPLOYEES,
  loading: false,
  submitting: false,
  error: null,
};

export const employeesSlice = createSlice({
  name: 'adminEmployees',
  initialState,
  reducers: {
    addEmployeeLocal(state, action: PayloadAction<AdminEmployeeRecord>) {
      state.items = [action.payload, ...state.items];
    },
    clearEmployeeError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAdminEmployeesThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminEmployeesThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length > 0) {
          state.items = action.payload;
        }
      })
      .addCase(fetchAdminEmployeesThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load employees';
      })
      .addCase(createAdminEmployeeThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createAdminEmployeeThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.items = [action.payload, ...state.items];
      })
      .addCase(createAdminEmployeeThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || 'Failed to create employee';
      })
      .addCase(bulkImportAdminEmployeesThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(bulkImportAdminEmployeesThunk.fulfilled, (state, action) => {
        state.submitting = false;
        state.items = [...action.payload, ...state.items];
      })
      .addCase(bulkImportAdminEmployeesThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || 'Bulk employee import failed';
      });
  },
});

export const { addEmployeeLocal, clearEmployeeError } = employeesSlice.actions;
export default employeesSlice.reducer;
