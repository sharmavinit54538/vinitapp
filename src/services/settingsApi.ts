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

const WORKSPACE_SETTINGS_STORAGE_KEY = 'ofc360_local_workspace_settings_v1';

export const settingsApi = {
  async saveCompanyAndWorkspaceSettings(
    payload: SaveWorkspaceSettingsPayload
  ): Promise<SaveWorkspaceSettingsResponse> {
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        window.localStorage.setItem(
          WORKSPACE_SETTINGS_STORAGE_KEY,
          JSON.stringify(payload)
        );
      } catch {
        // Ignore storage quota issues in demo mode
      }
    }

    return {
      status: 'saved',
      companyName: payload.company.companyName || 'OFC360 Technologies Pvt. Ltd.',
      departmentsCount: payload.workspaceConfig.departments?.length || 4,
      message: 'Company and workspace settings saved locally.',
    };
  },
};

