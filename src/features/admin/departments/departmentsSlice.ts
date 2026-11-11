import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import {
  AdminDepartmentRecord,
  bulkImportDepartmentsThunk,
  createDepartmentThunk,
  fetchDepartmentsThunk,
} from './departmentsThunk';

export interface DepartmentsState {
  items: AdminDepartmentRecord[];
  loading: boolean;
  submitting: boolean;
  error: string | null;
}

export const DEFAULT_ADMIN_DEPARTMENTS: AdminDepartmentRecord[] = [
  {
    id: 'DEPT-ENG',
    name: 'Engineering',
    code: 'ENG',
    parentDepartmentId: null,
    parentDepartmentName: null,
    managerName: 'Aarav Sharma',
    description: 'Core platform architecture, product engineering & DevOps',
    budget: 850000,
    headcountLimit: 120,
    activeHeadcount: 42,
    colorTheme: 'indigo',
    iconKey: 'Code2',
    createdAt: '2026-01-10',
  },
  {
    id: 'DEPT-HR',
    name: 'People Operations',
    code: 'HR',
    parentDepartmentId: null,
    parentDepartmentName: null,
    managerName: 'Meera Nair',
    description: 'Talent acquisition, HRBP, culture & compliance',
    budget: 240000,
    headcountLimit: 25,
    activeHeadcount: 11,
    colorTheme: 'emerald',
    iconKey: 'Users',
    createdAt: '2026-01-10',
  },
  {
    id: 'DEPT-FIN',
    name: 'Finance & Legal',
    code: 'FIN',
    parentDepartmentId: null,
    parentDepartmentName: null,
    managerName: 'Vikramaditya Rao',
    description: 'Corporate finance, payroll governance & statutory audit',
    budget: 310000,
    headcountLimit: 30,
    activeHeadcount: 14,
    colorTheme: 'amber',
    iconKey: 'Wallet',
    createdAt: '2026-01-15',
  },
];

const initialState: DepartmentsState = {
  items: DEFAULT_ADMIN_DEPARTMENTS,
  loading: false,
  submitting: false,
  error: null,
};

export const departmentsSlice = createSlice({
  name: 'adminDepartments',
  initialState,
  reducers: {
    addDepartmentLocal(state, action: PayloadAction<AdminDepartmentRecord>) {
      state.items = [action.payload, ...state.items];
    },
    clearDepartmentError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchDepartmentsThunk.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDepartmentsThunk.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.length > 0) {
          state.items = action.payload;
        }
      })
      .addCase(fetchDepartmentsThunk.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to load departments';
      })
      .addCase(createDepartmentThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(createDepartmentThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const exists = state.items.some(
          (d) => d.code.toUpperCase() === action.payload.code.toUpperCase()
        );
        if (!exists) {
          state.items = [action.payload, ...state.items];
        }
      })
      .addCase(createDepartmentThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || 'Failed to create department';
      })
      .addCase(bulkImportDepartmentsThunk.pending, (state) => {
        state.submitting = true;
        state.error = null;
      })
      .addCase(bulkImportDepartmentsThunk.fulfilled, (state, action) => {
        state.submitting = false;
        const existingCodes = new Set(
          state.items.map((d) => d.code.toUpperCase())
        );
        const fresh = action.payload.filter(
          (d) => !existingCodes.has(d.code.toUpperCase())
        );
        state.items = [...fresh, ...state.items];
      })
      .addCase(bulkImportDepartmentsThunk.rejected, (state, action) => {
        state.submitting = false;
        state.error = action.error.message || 'Bulk import failed';
      });
  },
});

export const { addDepartmentLocal, clearDepartmentError } =
  departmentsSlice.actions;
export default departmentsSlice.reducer;
