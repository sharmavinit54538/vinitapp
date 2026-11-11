import { API_BASE_URL, authClient } from '../../lib/auth-api';
import { HrAdminProfileStepData } from '../lib/auth-bootstrap';

export interface SaveHrAdminProfileResponse {
  status: 'saved';
  employeeCode: string;
  fullName: string;
  message: string;
}

export const profileApi = {
  async saveHrAdminProfile(
    payload: HrAdminProfileStepData
  ): Promise<SaveHrAdminProfileResponse> {
    const token = authClient.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/hr/workspace-onboarding/profile`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to save HR Admin profile (${response.status})`
      );
    }

    return (await response.json()) as SaveHrAdminProfileResponse;
  },
};
