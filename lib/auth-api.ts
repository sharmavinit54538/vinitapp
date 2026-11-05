import {
  extractBackendErrorMessage,
  OFC360_ROLES,
  Ofc360Role,
  resolveRoleDashboardPath,
} from './auth-schemas';

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/+$/, '') || '';

export const AUTH_API_PREFIX = `${API_BASE_URL}/api/v1/auth`;

export interface Ofc360User {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  company_name?: string;
  role: Ofc360Role;
  email_verified: boolean;
  is_active: boolean;
  created_at?: string;
}

export interface AuthResponseEnvelope {
  access_token?: string;
  token_type?: string;
  requires_otp?: boolean;
  requires_mfa?: boolean;
  email_verified?: boolean;
  is_active?: boolean;
  message?: string;
  user?: Ofc360User;
  raw: Record<string, unknown>;
}

export class AuthApiError extends Error {
  status: number;
  code?: string;
  emailUnverified?: boolean;
  accountInactive?: boolean;
  requiresOtp?: boolean;
  requiresMfa?: boolean;
  raw?: unknown;

  constructor(
    message: string,
    status: number,
    options?: {
      code?: string;
      emailUnverified?: boolean;
      accountInactive?: boolean;
      requiresOtp?: boolean;
      requiresMfa?: boolean;
      raw?: unknown;
    }
  ) {
    super(message);
    this.name = 'AuthApiError';
    this.status = status;
    this.code = options?.code;
    this.emailUnverified = options?.emailUnverified;
    this.accountInactive = options?.accountInactive;
    this.requiresOtp = options?.requiresOtp;
    this.requiresMfa = options?.requiresMfa;
    this.raw = options?.raw;
  }
}

export function extractAccessTokenFromPayload(payload: unknown): string | null {
  if (!payload || typeof payload !== 'object') return null;
  const obj = payload as Record<string, unknown>;

  const directCandidates = [obj.access_token, obj.accessToken, obj.token];
  for (const c of directCandidates) {
    if (typeof c === 'string' && c.trim().length > 0) {
      return c.trim();
    }
  }

  if (obj.data && typeof obj.data === 'object') {
    const nested = obj.data as Record<string, unknown>;
    const nestedCandidates = [
      nested.access_token,
      nested.accessToken,
      nested.token,
    ];
    for (const c of nestedCandidates) {
      if (typeof c === 'string' && c.trim().length > 0) {
        return c.trim();
      }
    }
  }

  return null;
}

export function normalizeUserPayload(payload: unknown): Ofc360User {
  const root =
    payload &&
    typeof payload === 'object' &&
    'user' in (payload as Record<string, unknown>) &&
    typeof (payload as Record<string, unknown>).user === 'object'
      ? ((payload as Record<string, unknown>).user as Record<string, unknown>)
      : payload &&
        typeof payload === 'object' &&
        'data' in (payload as Record<string, unknown>) &&
        typeof (payload as Record<string, unknown>).data === 'object'
      ? ((payload as Record<string, unknown>).data as Record<string, unknown>)
      : ((payload || {}) as Record<string, unknown>);

  const candidateRole = String(
    root.role || root.user_role || root.role_name || 'employee'
  )
    .toLowerCase()
    .replace(/[\s-]+/g, '_') as Ofc360Role;

  const rawRole: Ofc360Role = OFC360_ROLES.includes(candidateRole)
    ? candidateRole
    : 'employee';

  const emailVerified =
    typeof root.email_verified === 'boolean'
      ? root.email_verified
      : typeof root.is_verified === 'boolean'
      ? root.is_verified
      : true;

  const isActive =
    typeof root.is_active === 'boolean'
      ? root.is_active
      : typeof root.account_activated === 'boolean'
      ? root.account_activated
      : true;

  return {
    id: String(root.id || root.user_id || root.sub || ''),
    email: String(root.email || ''),
    full_name: String(
      root.full_name || root.fullName || root.name || root.email || 'AegisAuth User'
    ),
    phone: root.phone ? String(root.phone) : undefined,
    company_name: root.company_name
      ? String(root.company_name)
      : root.company
      ? String(root.company)
      : undefined,
    role: rawRole,
    email_verified: emailVerified,
    is_active: isActive,
    created_at: root.created_at ? String(root.created_at) : undefined,
  };
}

export type FetchLike = (
  input: string,
  init?: RequestInit
) => Promise<Response>;

export class Ofc360AuthClient {
  private accessToken: string | null = null;
  private refreshPromise: Promise<string | null> | null = null;
  private fetchImpl: FetchLike;
  private onSessionExpired?: () => void;

  constructor(fetchImpl?: FetchLike, onSessionExpired?: () => void) {
    this.fetchImpl =
      fetchImpl || ((input, init) => globalThis.fetch(input, init));
    this.onSessionExpired = onSessionExpired;
  }

  public getAccessToken(): string | null {
    return this.accessToken;
  }

  public setAccessToken(token: string | null): void {
    this.accessToken = token;
  }

  public clearSession(): void {
    this.accessToken = null;
  }

  private async parseResponseBody(res: Response): Promise<unknown> {
    const contentType = res.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      try {
        return await res.json();
      } catch {
        return null;
      }
    }
    try {
      const text = await res.text();
      return text ? JSON.parse(text) : null;
    } catch {
      return null;
    }
  }

  public async request<T = Record<string, unknown>>(
    endpoint: string,
    options: RequestInit & { skipAuthRefresh?: boolean } = {}
  ): Promise<T> {
    const url = endpoint.startsWith('http')
      ? endpoint
      : `${AUTH_API_PREFIX}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;

    const buildHeaders = (token: string | null): HeadersInit => {
      const headers: Record<string, string> = {
        Accept: 'application/json',
        ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      };
      if (options.headers) {
        const incoming = options.headers as Record<string, string>;
        Object.assign(headers, incoming);
      }
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
      return headers;
    };

    let response: Response;
    try {
      response = await this.fetchImpl(url, {
        ...options,
        headers: buildHeaders(this.accessToken),
        credentials: 'include',
      });
    } catch (networkErr) {
      throw new AuthApiError(
        `Unable to reach the authentication service (${API_BASE_URL}). Please verify network connectivity or CORS settings.`,
        0,
        { code: 'NETWORK_ERROR', raw: networkErr }
      );
    }

    if (
      response.status === 401 &&
      !options.skipAuthRefresh &&
      !endpoint.includes('/login') &&
      !endpoint.includes('/refresh') &&
      !endpoint.includes('/register')
    ) {
      const newToken = await this.refreshAccessToken();
      if (newToken) {
        response = await this.fetchImpl(url, {
          ...options,
          headers: buildHeaders(newToken),
          credentials: 'include',
        });
      } else {
        this.clearSession();
        this.onSessionExpired?.();
      }
    }

    const body = await this.parseResponseBody(response);

    if (!response.ok) {
      const msg = extractBackendErrorMessage(body, response.status);
      const lowerMsg = msg.toLowerCase();
      const bodyObj =
        body && typeof body === 'object' ? (body as Record<string, unknown>) : {};

      const emailUnverified =
        lowerMsg.includes('verify your email') ||
        lowerMsg.includes('email not verified') ||
        lowerMsg.includes('unverified') ||
        bodyObj.code === 'EMAIL_NOT_VERIFIED' ||
        bodyObj.email_verified === false;

      const accountInactive =
        lowerMsg.includes('inactive') ||
        lowerMsg.includes('not activated') ||
        lowerMsg.includes('activate your account') ||
        bodyObj.code === 'ACCOUNT_INACTIVE' ||
        bodyObj.is_active === false;

      const requiresOtp =
        lowerMsg.includes('otp') || bodyObj.requires_otp === true;

      const requiresMfa =
        lowerMsg.includes('mfa') ||
        lowerMsg.includes('totp') ||
        bodyObj.mfa_required === true ||
        bodyObj.requires_mfa === true;

      throw new AuthApiError(msg, response.status, {
        code: typeof bodyObj.code === 'string' ? bodyObj.code : undefined,
        emailUnverified,
        accountInactive,
        requiresOtp,
        requiresMfa,
        raw: body,
      });
    }

    const extractedToken = extractAccessTokenFromPayload(body);
    if (extractedToken) {
      this.accessToken = extractedToken;
    }

    return (body ?? {}) as T;
  }

  public async refreshAccessToken(): Promise<string | null> {
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    this.refreshPromise = (async () => {
      try {
        const res = await this.fetchImpl(`${AUTH_API_PREFIX}/refresh`, {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        if (!res.ok) {
          this.clearSession();
          return null;
        }

        const data = await this.parseResponseBody(res);
        const token = extractAccessTokenFromPayload(data);
        if (token) {
          this.accessToken = token;
          return token;
        }
        return null;
      } catch {
        this.clearSession();
        return null;
      } finally {
        this.refreshPromise = null;
      }
    })();

    return this.refreshPromise;
  }

  // 1. POST /api/v1/auth/register
  public async register(payload: {
    full_name: string;
    email: string;
    phone: string;
    country_code?: string;
    company_name?: string;
    password: string;
    confirm_password: string;
  }): Promise<AuthResponseEnvelope> {
    const raw = await this.request<Record<string, unknown>>('/register', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuthRefresh: true,
    });
    return {
      access_token: extractAccessTokenFromPayload(raw) || undefined,
      requires_otp: Boolean(raw.requires_otp ?? true),
      requires_mfa: Boolean(raw.mfa_required ?? raw.requires_mfa ?? false),
      email_verified:
        typeof raw.email_verified === 'boolean' ? raw.email_verified : false,
      is_active: typeof raw.is_active === 'boolean' ? raw.is_active : true,
      message: typeof raw.message === 'string' ? raw.message : undefined,
      raw,
    };
  }

  // 2. POST /api/v1/auth/login (supports both email and mobile login)
  public async login(payload: {
    email?: string;
    phone?: string;
    country_code?: string;
    password?: string;
    remember_me?: boolean;
  }): Promise<AuthResponseEnvelope> {
    const raw = await this.request<Record<string, unknown>>('/login', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuthRefresh: true,
    });
    return {
      access_token: extractAccessTokenFromPayload(raw) || undefined,
      requires_otp: Boolean(raw.requires_otp ?? false),
      requires_mfa: Boolean(raw.mfa_required ?? raw.requires_mfa ?? false),
      email_verified:
        typeof raw.email_verified === 'boolean' ? raw.email_verified : true,
      is_active: typeof raw.is_active === 'boolean' ? raw.is_active : true,
      message: typeof raw.message === 'string' ? raw.message : undefined,
      user: raw.user ? normalizeUserPayload(raw.user) : undefined,
      raw,
    };
  }

  // 3. POST /api/v1/auth/verify-otp
  public async verifyOtp(payload: {
    email?: string;
    phone?: string;
    otp: string;
    trust_device?: boolean;
  }): Promise<AuthResponseEnvelope> {
    const raw = await this.request<Record<string, unknown>>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuthRefresh: true,
    });
    return {
      access_token: extractAccessTokenFromPayload(raw) || undefined,
      message: typeof raw.message === 'string' ? raw.message : undefined,
      user: raw.user ? normalizeUserPayload(raw.user) : undefined,
      raw,
    };
  }

  // 4. MFA Verification (TOTP / Backup Recovery Code via /verify-otp)
  public async verifyMfa(payload: {
    code: string;
    mode: 'totp' | 'recovery';
    trust_device?: boolean;
    email?: string;
  }): Promise<AuthResponseEnvelope> {
    const raw = await this.request<Record<string, unknown>>('/verify-otp', {
      method: 'POST',
      body: JSON.stringify({
        otp: payload.code,
        code: payload.code,
        mode: payload.mode,
        trust_device: payload.trust_device,
        email: payload.email,
      }),
      skipAuthRefresh: true,
    });
    return {
      access_token: extractAccessTokenFromPayload(raw) || undefined,
      message: typeof raw.message === 'string' ? raw.message : undefined,
      user: raw.user ? normalizeUserPayload(raw.user) : undefined,
      raw,
    };
  }

  // 5. POST /api/v1/auth/logout
  public async logout(): Promise<void> {
    try {
      await this.request('/logout', {
        method: 'POST',
        skipAuthRefresh: true,
      });
    } finally {
      this.clearSession();
    }
  }

  // 6. POST /api/v1/auth/forgot-password
  public async forgotPassword(payload: {
    email: string;
  }): Promise<{ message: string; raw: Record<string, unknown> }> {
    const raw = await this.request<Record<string, unknown>>('/forgot-password', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuthRefresh: true,
    });
    return {
      message:
        typeof raw.message === 'string'
          ? raw.message
          : typeof raw.detail === 'string'
          ? raw.detail
          : 'If an account matches that email, a password reset link has been sent.',
      raw,
    };
  }

  // 7. POST /api/v1/auth/reset-password
  public async resetPassword(payload: {
    token: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string; raw: Record<string, unknown> }> {
    const raw = await this.request<Record<string, unknown>>('/reset-password', {
      method: 'POST',
      body: JSON.stringify({
        token: payload.token,
        new_password: payload.new_password,
        password: payload.new_password,
        confirm_password: payload.confirm_password,
      }),
      skipAuthRefresh: true,
    });
    return {
      message:
        typeof raw.message === 'string'
          ? raw.message
          : 'Your password has been reset successfully. You may now sign in.',
      raw,
    };
  }

  // 8. POST /api/v1/auth/verify-email
  public async verifyEmail(payload: {
    token?: string;
    email?: string;
  }): Promise<{ message: string; status: string; raw: Record<string, unknown> }> {
    const raw = await this.request<Record<string, unknown>>('/verify-email', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuthRefresh: true,
    });
    return {
      message:
        typeof raw.message === 'string'
          ? raw.message
          : 'Your email address has been verified.',
      status: typeof raw.status === 'string' ? raw.status : 'verified',
      raw,
    };
  }

  // 9. POST /api/v1/auth/activate
  public async activateAccount(payload: {
    token?: string;
    email?: string;
  }): Promise<{ message: string; raw: Record<string, unknown> }> {
    const raw = await this.request<Record<string, unknown>>('/activate', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuthRefresh: true,
    });
    return {
      message:
        typeof raw.message === 'string'
          ? raw.message
          : 'Your enterprise account has been activated.',
      raw,
    };
  }

  // 10. POST /api/v1/auth/change-password
  public async changePassword(payload: {
    current_password: string;
    new_password: string;
    confirm_password: string;
  }): Promise<{ message: string; raw: Record<string, unknown> }> {
    const raw = await this.request<Record<string, unknown>>('/change-password', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      message:
        typeof raw.message === 'string'
          ? raw.message
          : 'Password updated successfully.',
      raw,
    };
  }

  // 11. GET /api/v1/auth/me
  public async getMe(): Promise<Ofc360User> {
    const raw = await this.request<Record<string, unknown>>('/me', {
      method: 'GET',
    });
    return normalizeUserPayload(raw);
  }

  // 12. POST /api/v1/auth/google
  public async loginWithGoogle(payload: {
    token?: string;
    id_token?: string;
    code?: string;
    redirect_uri?: string;
  }): Promise<AuthResponseEnvelope> {
    const raw = await this.request<Record<string, unknown>>('/google', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuthRefresh: true,
    });
    return {
      access_token: extractAccessTokenFromPayload(raw) || undefined,
      user: raw.user ? normalizeUserPayload(raw.user) : undefined,
      raw,
    };
  }

  // 13. POST /api/v1/auth/github
  public async loginWithGithub(payload: {
    code: string;
    redirect_uri?: string;
  }): Promise<AuthResponseEnvelope> {
    const raw = await this.request<Record<string, unknown>>('/github', {
      method: 'POST',
      body: JSON.stringify(payload),
      skipAuthRefresh: true,
    });
    return {
      access_token: extractAccessTokenFromPayload(raw) || undefined,
      user: raw.user ? normalizeUserPayload(raw.user) : undefined,
      raw,
    };
  }

  // 14. POST /api/v1/auth/verify-email-change
  public async verifyEmailChange(payload: {
    token: string;
  }): Promise<{ message: string; raw: Record<string, unknown> }> {
    const raw = await this.request<Record<string, unknown>>(
      '/verify-email-change',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      }
    );
    return {
      message:
        typeof raw.message === 'string'
          ? raw.message
          : 'Your new email address has been verified and updated.',
      raw,
    };
  }
}

export const authClient = new Ofc360AuthClient();
export { resolveRoleDashboardPath };
