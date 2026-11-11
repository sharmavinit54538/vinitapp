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
    personalEmail: 'aarav.personal@gmail.com',
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
    ctcStructure: '₹32,00,000 / year',
    defaultShift: 'General Shift (09:30 - 18:30)',
    systemRole: 'Executive',
    sendOnboardingInvite: true,
    status: 'ACTIVE',
    createdAt: '2024-01-10',
  },
  {
    id: 'EMP-REC-2',
    firstName: 'Rohan',
    lastName: 'Verma',
    fullName: 'Rohan Verma',
    officialEmail: 'rohan.verma@ofc360.com',
    personalEmail: 'rohan.verma94@gmail.com',
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
    ctcStructure: '₹24,00,000 / year',
    defaultShift: 'General Shift (09:30 - 18:30)',
    systemRole: 'Manager',
    sendOnboardingInvite: true,
    status: 'PENDING',
    createdAt: '2025-03-01',
  },
  {
    id: 'EMP-REC-3',
    firstName: 'Ananya',
    lastName: 'Iyer',
    fullName: 'Ananya Iyer',
    officialEmail: 'ananya.iyer@ofc360.com',
    personalEmail: 'ananya.iyer@gmail.com',
    mobileNumber: '+91 98201 77889',
    gender: 'Female',
    dateOfBirth: '1997-11-05',
    employeeCode: 'EMP-103',
    department: 'Engineering',
    designation: 'Senior Frontend Engineer',
    reportingManager: 'Rohan Verma',
    dateOfJoining: '2026-10-15',
    employmentType: 'Full-time',
    workMode: 'Remote',
    probationPeriod: '6 months',
    ctcStructure: '₹16,50,000 / year',
    defaultShift: 'Morning Shift (06:00 - 15:00)',
    systemRole: 'Employee',
    sendOnboardingInvite: true,
    status: 'INVITED',
    createdAt: '2026-10-15',
  },
  {
    id: 'EMP-REC-4',
    firstName: 'Kabir',
    lastName: 'Mehta',
    fullName: 'Kabir Mehta',
    officialEmail: 'kabir.mehta@ofc360.com',
    personalEmail: 'kabir.mehta@gmail.com',
    mobileNumber: '+91 98201 99001',
    gender: 'Male',
    dateOfBirth: '1995-02-19',
    employeeCode: 'EMP-104',
    department: 'Finance & Legal',
    designation: 'Financial Controller',
    reportingManager: 'Aarav Sharma',
    dateOfJoining: '2026-09-20',
    employmentType: 'Full-time',
    workMode: 'Office',
    probationPeriod: '3 months',
    ctcStructure: '₹18,00,000 / year',
    defaultShift: 'General Shift (09:30 - 18:30)',
    systemRole: 'Employee',
    sendOnboardingInvite: true,
    status: 'EXPIRED',
    createdAt: '2026-09-20',
  },
  {
    id: 'EMP-REC-5',
    firstName: 'Vikram',
    lastName: 'Nair',
    fullName: 'Vikram Nair',
    officialEmail: 'vikram.nair@ofc360.com',
    personalEmail: 'vikram.nair@gmail.com',
    mobileNumber: '+91 98201 33445',
    gender: 'Male',
    dateOfBirth: '1992-07-30',
    employeeCode: 'EMP-105',
    department: 'IT & Security',
    designation: 'Cloud Security Architect',
    reportingManager: 'Rohan Verma',
    dateOfJoining: '2024-06-12',
    employmentType: 'Full-time',
    workMode: 'Hybrid',
    probationPeriod: '6 months',
    ctcStructure: '₹21,00,000 / year',
    defaultShift: 'Night Shift (21:00 - 06:00)',
    systemRole: 'IT-Admin',
    sendOnboardingInvite: false,
    status: 'DISABLED',
    createdAt: '2024-06-12',
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
    updateEmployeeLocal(
      state,
      action: PayloadAction<{
        id: string;
        changes: Partial<AdminEmployeeRecord>;
      }>
    ) {
      const { id, changes } = action.payload;
      state.items = state.items.map((emp) => {
        if (emp.id !== id) return emp;
        const firstName =
          changes.firstName !== undefined ? changes.firstName : emp.firstName;
        const lastName =
          changes.lastName !== undefined ? changes.lastName : emp.lastName;
        return {
          ...emp,
          ...changes,
          firstName,
          lastName,
          fullName: `${firstName} ${lastName}`.trim() || emp.fullName,
        };
      });
    },
    deleteEmployeeLocal(state, action: PayloadAction<string>) {
      state.items = state.items.filter((emp) => emp.id !== action.payload);
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

export const {
  addEmployeeLocal,
  updateEmployeeLocal,
  deleteEmployeeLocal,
  clearEmployeeError,
} = employeesSlice.actions;
export default employeesSlice.reducer;
