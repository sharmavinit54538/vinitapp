import {
  AuthSession,
  EmployeeDashboardData,
  ExecutiveDashboardData,
  HrAdminDashboardData,
  ItAdminDashboardData,
  ManagerDashboardData,
  Ofc360Role,
  PushNotificationItem,
  UserProfile,
} from '@/types/hrms';
import {
  apiRequest,
  clearSecureSession,
  getSecureAccessToken,
  getSecureRefreshToken,
  getSecureUserJson,
  saveSecureSession,
} from './apiClient';
import { getMobileInitials } from '@/theme/tokens';

const VALID_ROLES: Ofc360Role[] = [
  'hr_admin',
  'employee',
  'manager',
  'it_admin',
  'executive',
];

function normalizeRole(raw: unknown): Ofc360Role {
  const normalized = String(raw || 'employee')
    .toLowerCase()
    .replace(/[\s-]+/g, '_') as Ofc360Role;
  return VALID_ROLES.includes(normalized) ? normalized : 'employee';
}

function normalizeUserProfile(raw: Record<string, unknown>): UserProfile {
  const fullName = String(raw.full_name || raw.fullName || raw.name || '').trim();
  const email = String(raw.email || '').trim();
  return {
    id: String(raw.id || ''),
    employeeCode: String(raw.employee_code || raw.employeeCode || ''),
    fullName: fullName || email,
    email,
    role: normalizeRole(raw.role),
    designation: String(raw.designation || ''),
    department: String(raw.department || ''),
    location: String(raw.location || ''),
    avatarInitials: getMobileInitials(fullName || email),
    phone: String(raw.phone || ''),
  };
}

/**
 * Production OFC360 mobile service layer.
 * All authentication and module data flow directly through live backend APIs
 * with zero hardcoded mock business data.
 */
export const hrmsService = {
  async login(email: string, password: string): Promise<AuthSession> {
    const payload = await apiRequest<Record<string, unknown>>('/api/v1/auth/login', {
      method: 'POST',
      skipAuth: true,
      body: { email: email.trim(), password },
    });

    const accessToken = String(
      payload.access_token || payload.accessToken || payload.token || ''
    ).trim();
    const refreshToken = String(
      payload.refresh_token || payload.refreshToken || ''
    ).trim();

    if (!accessToken) {
      throw new Error('Authentication server did not return a valid access token.');
    }

    const userRaw = (payload.user || payload.data || {}) as Record<string, unknown>;
    const user = normalizeUserProfile(userRaw);

    await saveSecureSession({
      accessToken,
      refreshToken: refreshToken || undefined,
      userJson: JSON.stringify(user),
    });

    return {
      accessToken,
      user,
      expiresAt: String(
        payload.expires_at ||
          payload.expiresAt ||
          new Date(Date.now() + 3600 * 1000).toISOString()
      ),
    };
  },

  async restoreSession(): Promise<AuthSession | null> {
    const token = await getSecureAccessToken();
    const userRaw = await getSecureUserJson();
    if (!token || !userRaw) return null;

    try {
      const cachedUser = JSON.parse(userRaw) as UserProfile;
      return {
        accessToken: token,
        user: cachedUser,
        expiresAt: new Date(Date.now() + 3600 * 1000).toISOString(),
      };
    } catch {
      await clearSecureSession();
      return null;
    }
  },

  async validateActiveSession(): Promise<UserProfile | null> {
    const token = await getSecureAccessToken();
    if (!token) return null;
    const payload = await apiRequest<Record<string, unknown>>('/api/v1/auth/me');
    const userRaw = (payload.user || payload) as Record<string, unknown>;
    const user = normalizeUserProfile(userRaw);
    await saveSecureSession({
      accessToken: token,
      userJson: JSON.stringify(user),
    });
    return user;
  },

  async logout(): Promise<void> {
    try {
      const refreshToken = await getSecureRefreshToken();
      await apiRequest('/api/v1/auth/logout', {
        method: 'POST',
        body: refreshToken ? { refresh_token: refreshToken } : {},
      });
    } catch {
      // Always clear local encrypted credentials even if offline
    } finally {
      await clearSecureSession();
    }
  },

  async fetchPushNotifications(role: Ofc360Role): Promise<PushNotificationItem[]> {
    const result = await apiRequest<{ notifications?: PushNotificationItem[] } | PushNotificationItem[]>(
      `/api/v1/notifications?role=${encodeURIComponent(role)}`
    );
    if (Array.isArray(result)) return result;
    return Array.isArray(result?.notifications) ? result.notifications : [];
  },

  async markNotificationsRead(): Promise<void> {
    await apiRequest('/api/v1/notifications/read-all', { method: 'POST' });
  },

  async fetchHrAdminDashboard(): Promise<HrAdminDashboardData> {
    return apiRequest<HrAdminDashboardData>('/api/v1/hr-admin/dashboard');
  },

  async fetchEmployeeDashboard(): Promise<EmployeeDashboardData> {
    return apiRequest<EmployeeDashboardData>('/api/v1/employee/dashboard');
  },

  async fetchManagerDashboard(): Promise<ManagerDashboardData> {
    return apiRequest<ManagerDashboardData>('/api/v1/manager/dashboard');
  },

  async fetchItAdminDashboard(): Promise<ItAdminDashboardData> {
    return apiRequest<ItAdminDashboardData>('/api/v1/it-admin/dashboard');
  },

  async fetchExecutiveDashboard(): Promise<ExecutiveDashboardData> {
    return apiRequest<ExecutiveDashboardData>('/api/v1/executive/dashboard');
  },

  async submitFaceAttendancePunch(payload: {
    action: 'check_in' | 'check_out';
    latitude?: number;
    longitude?: number;
    livenessVerified: boolean;
  }): Promise<{ status: string; timestamp: string; locationLabel: string }> {
    return apiRequest('/api/v1/attendance/punch', {
      method: 'POST',
      body: payload,
    });
  },

  async decideApproval(
    approvalId: string,
    decision: 'Approved' | 'Rejected',
    comment?: string
  ): Promise<void> {
    await apiRequest(`/api/v1/approvals/${encodeURIComponent(approvalId)}/decision`, {
      method: 'POST',
      body: { decision, comment },
    });
  },
};
