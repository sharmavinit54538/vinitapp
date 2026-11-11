import { API_BASE_URL, authClient } from '../../lib/auth-api';
import {
  CompanyDetailsStepData,
  WorkspaceConfigStepData,
} from '../lib/auth-bootstrap';

export interface SaveWorkspaceSettingsPayload {
  company: CompanyDetailsStepData;
  workspaceConfig: WorkspaceConfigStepData;
}

export interface SaveWorkspaceSettingsResponse {
  status: 'saved';
  companyName: string;
  departmentsCount: number;
  message: string;
}

export const settingsApi = {
  async saveCompanyAndWorkspaceSettings(
    payload: SaveWorkspaceSettingsPayload
  ): Promise<SaveWorkspaceSettingsResponse> {
    const token = authClient.getAccessToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/api/v1/hr/workspace-onboarding/settings`,
      {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
      }
    );

    if (!response.ok) {
      throw new Error(
        `Failed to save company and workspace settings (${response.status})`
      );
    }

    return (await response.json()) as SaveWorkspaceSettingsResponse;
  },
};
