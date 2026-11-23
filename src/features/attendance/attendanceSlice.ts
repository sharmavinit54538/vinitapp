/**
 * UI-Only Redux Slice for Attendance Screens
 *
 * Strictly holds UI selections (active tabs, filters, pagination, work mode,
 * selected calendar month/year, active user/tenant scope key).
 * Server records live in RTK Query (`attendanceApi`). Raw biometrics and GPS
 * live ONLY in the transient in-memory `captureVault`.
 */

import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { RosterType, WorkMode } from './types';

export type AttendanceSubTab = 'today' | 'history' | 'regularization';
export type AttendanceHistoryScope = 'personal' | 'team' | 'company';
export type PunchContractMode = 'v1_face' | 'v2_pwa';

export interface AttendanceUiState {
  activeSubTab: AttendanceSubTab;
  historyScope: AttendanceHistoryScope;
  startDate: string;
  endDate: string;
  branchFilter: string;
  departmentFilter: string;
  page: number;
  limit: number;
  selectedWorkMode: WorkMode;
  punchContract: PunchContractMode;
  selectedCalendarMonth: number;
  selectedCalendarYear: number;
  rosterShiftTypeFilter: RosterType | '';
  rosterDepartmentFilter: string;
  rosterSearch: string;
  shiftsSearch: string;
  /** Active tenant + user scope identifier used to detect switches and reset cache */
  activeScopeKey: string | null;
}

function createInitialState(): AttendanceUiState {
  const now = new Date();
  return {
    activeSubTab: 'today',
    historyScope: 'personal',
    startDate: '',
    endDate: '',
    branchFilter: '',
    departmentFilter: '',
    page: 1,
    limit: 20,
    selectedWorkMode: 'office',
    punchContract: 'v1_face',
    selectedCalendarMonth: now.getMonth() + 1,
    selectedCalendarYear: now.getFullYear(),
    rosterShiftTypeFilter: '',
    rosterDepartmentFilter: '',
    rosterSearch: '',
    shiftsSearch: '',
    activeScopeKey: null,
  };
}

const initialState: AttendanceUiState = createInitialState();

export const attendanceUiSlice = createSlice({
  name: 'attendanceUi',
  initialState,
  reducers: {
    setAttendanceSubTab(state, action: PayloadAction<AttendanceSubTab>) {
      state.activeSubTab = action.payload;
    },
    setHistoryScope(state, action: PayloadAction<AttendanceHistoryScope>) {
      if (state.historyScope !== action.payload) {
        state.historyScope = action.payload;
        state.page = 1;
      }
    },
    setHistoryDateRange(
      state,
      action: PayloadAction<{ startDate: string; endDate: string }>
    ) {
      state.startDate = action.payload.startDate;
      state.endDate = action.payload.endDate;
      state.page = 1;
    },
    setCompanyHistoryFilters(
      state,
      action: PayloadAction<{ branch?: string; department?: string }>
    ) {
      if (action.payload.branch !== undefined) {
        state.branchFilter = action.payload.branch;
      }
      if (action.payload.department !== undefined) {
        state.departmentFilter = action.payload.department;
      }
      state.page = 1;
    },
    setHistoryPage(state, action: PayloadAction<number>) {
      state.page = Math.max(1, action.payload);
    },
    setHistoryLimit(state, action: PayloadAction<number>) {
      state.limit = Math.min(100, Math.max(1, action.payload));
      state.page = 1;
    },
    setSelectedWorkMode(state, action: PayloadAction<WorkMode>) {
      state.selectedWorkMode = action.payload;
    },
    setPunchContract(state, action: PayloadAction<PunchContractMode>) {
      state.punchContract = action.payload;
    },
    setSelectedCalendarPeriod(
      state,
      action: PayloadAction<{ month: number; year: number }>
    ) {
      state.selectedCalendarMonth = Math.min(12, Math.max(1, action.payload.month));
      state.selectedCalendarYear = Math.min(2100, Math.max(2000, action.payload.year));
    },
    setRosterFilters(
      state,
      action: PayloadAction<{
        shiftType?: RosterType | '';
        department?: string;
        search?: string;
      }>
    ) {
      if (action.payload.shiftType !== undefined) {
        state.rosterShiftTypeFilter = action.payload.shiftType;
      }
      if (action.payload.department !== undefined) {
        state.rosterDepartmentFilter = action.payload.department;
      }
      if (action.payload.search !== undefined) {
        state.rosterSearch = action.payload.search;
      }
    },
    setShiftsSearch(state, action: PayloadAction<string>) {
      state.shiftsSearch = action.payload;
    },
    setAttendanceScopeKey(state, action: PayloadAction<string | null>) {
      state.activeScopeKey = action.payload;
    },
    resetAttendanceUi() {
      return createInitialState();
    },
  },
});

export const {
  setAttendanceSubTab,
  setHistoryScope,
  setHistoryDateRange,
  setCompanyHistoryFilters,
  setHistoryPage,
  setHistoryLimit,
  setSelectedWorkMode,
  setPunchContract,
  setSelectedCalendarPeriod,
  setRosterFilters,
  setShiftsSearch,
  setAttendanceScopeKey,
  resetAttendanceUi,
} = attendanceUiSlice.actions;

export default attendanceUiSlice.reducer;
