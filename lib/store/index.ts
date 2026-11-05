import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { hrDashboardApi } from './hr-api';
import { helpDeskApi } from './helpdesk-api';
import { payrollAnalyticsApi } from './payroll-analytics-api';
import { BottomNavTab, HomeInternalTab } from '@/lib/hr-dashboard-logic';
import { Ofc360Role } from '@/lib/auth-schemas';

interface HrMobileUiState {
  activeBottomTab: BottomNavTab;
  activeHomeTab: HomeInternalTab;
  activeRole: Ofc360Role;
  isDarkMode: boolean;
  isAnnouncementSheetOpen: boolean;
  isAddEmployeeSheetOpen: boolean;
  isNotificationsOpen: boolean;
  isCreateShiftSheetOpen: boolean;
  isAddHolidaySheetOpen: boolean;
  toastMessage: { id: number; text: string; type: 'success' | 'info' | 'error' } | null;
}

const initialState: HrMobileUiState = {
  activeBottomTab: 'home',
  activeHomeTab: 'overview',
  activeRole: 'hr_admin',
  isDarkMode: false,
  isAnnouncementSheetOpen: false,
  isAddEmployeeSheetOpen: false,
  isNotificationsOpen: false,
  isCreateShiftSheetOpen: false,
  isAddHolidaySheetOpen: false,
  toastMessage: null,
};

export const hrMobileUiSlice = createSlice({
  name: 'hrMobileUi',
  initialState,
  reducers: {
    setBottomTab(state, action: PayloadAction<BottomNavTab>) {
      state.activeBottomTab = action.payload;
    },
    setHomeTab(state, action: PayloadAction<HomeInternalTab>) {
      state.activeHomeTab = action.payload;
    },
    setActiveRole(state, action: PayloadAction<Ofc360Role>) {
      state.activeRole = action.payload;
    },
    setDarkMode(state, action: PayloadAction<boolean>) {
      state.isDarkMode = action.payload;
    },
    setAnnouncementSheetOpen(state, action: PayloadAction<boolean>) {
      state.isAnnouncementSheetOpen = action.payload;
    },
    setAddEmployeeSheetOpen(state, action: PayloadAction<boolean>) {
      state.isAddEmployeeSheetOpen = action.payload;
    },
    setNotificationsOpen(state, action: PayloadAction<boolean>) {
      state.isNotificationsOpen = action.payload;
    },
    setCreateShiftSheetOpen(state, action: PayloadAction<boolean>) {
      state.isCreateShiftSheetOpen = action.payload;
    },
    setAddHolidaySheetOpen(state, action: PayloadAction<boolean>) {
      state.isAddHolidaySheetOpen = action.payload;
    },
    showToast(
      state,
      action: PayloadAction<{ text: string; type?: 'success' | 'info' | 'error' }>
    ) {
      state.toastMessage = {
        id: Date.now(),
        text: action.payload.text,
        type: action.payload.type || 'success',
      };
    },
    clearToast(state) {
      state.toastMessage = null;
    },
  },
});

export const {
  setBottomTab,
  setHomeTab,
  setActiveRole,
  setDarkMode,
  setAnnouncementSheetOpen,
  setAddEmployeeSheetOpen,
  setNotificationsOpen,
  setCreateShiftSheetOpen,
  setAddHolidaySheetOpen,
  showToast,
  clearToast,
} = hrMobileUiSlice.actions;

export const makeHrStore = () =>
  configureStore({
    reducer: {
      hrMobileUi: hrMobileUiSlice.reducer,
      [hrDashboardApi.reducerPath]: hrDashboardApi.reducer,
      [helpDeskApi.reducerPath]: helpDeskApi.reducer,
      [payrollAnalyticsApi.reducerPath]: payrollAnalyticsApi.reducer,
    },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware()
        .concat(hrDashboardApi.middleware)
        .concat(helpDeskApi.middleware)
        .concat(payrollAnalyticsApi.middleware),
  });

export type AppStore = ReturnType<typeof makeHrStore>;
export type RootState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];
