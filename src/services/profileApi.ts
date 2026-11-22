import { HrAdminProfileStepData } from '../lib/auth-bootstrap';

export interface SaveHrAdminProfileResponse {
  status: 'saved';
  employeeCode: string;
  fullName: string;
  message: string;
}

const HR_ADMIN_PROFILE_STORAGE_KEY = 'ofc360_local_hr_admin_profile_v1';

export const profileApi = {
  async saveHrAdminProfile(
    payload: HrAdminProfileStepData
  ): Promise<SaveHrAdminProfileResponse> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          HR_ADMIN_PROFILE_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } catch {
        // Ignore storage quota issues in demo mode
      }
    }

    return {
      status: 'saved',
      employeeCode: payload.employeeCode || 'EMP-001',
      fullName: payload.fullName || 'Aarav Sharma',
      message: 'HR Admin profile saved locally.',
    };
  },
};

