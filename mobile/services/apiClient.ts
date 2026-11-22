import * as SecureStore from 'expo-secure-store';
import Constants from 'expo-constants';

const ACCESS_TOKEN_KEY = 'ofc360_native_access_token_v2';
const REFRESH_TOKEN_KEY = 'ofc360_native_refresh_token_v2';
const USER_KEY = 'ofc360_native_auth_user_v2';

const SECURE_STORE_OPTIONS: SecureStore.SecureStoreOptions = {
  keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
};

const configuredUrl =
  process.env.EXPO_PUBLIC_API_URL ||
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ||
  '';

export const API_BASE_URL = configuredUrl.replace(/\/+$/, '');

export class MobileApiError extends Error {
  status: number;
  isNetworkError: boolean;
  code?: string;

  constructor(
    message: string,
    status: number,
    options?: { isNetworkError?: boolean; code?: string }
  ) {
    super(message);
    this.name = 'MobileApiError';
    this.status = status;
    this.isNetworkError = options?.isNetworkError ?? false;
    this.code = options?.code;
  }
}

type SessionExpiredListener = () => void;
const sessionExpiredListeners = new Set<SessionExpiredListener>();

export function subscribeSessionExpired(
  listener: SessionExpiredListener
): () => void {
  sessionExpiredListeners.add(listener);
  return () => {
    sessionExpiredListeners.delete(listener);
  };
}

function notifySessionExpired() {
  sessionExpiredListeners.forEach((fn) => {
    try {
      fn();
    } catch {
      // Ignore listener errors
    }
  });
}

export async function saveSecureSession(params: {
  accessToken: string;
  refreshToken?: string;
  userJson: string;
}): Promise<void> {
  await SecureStore.setItemAsync(
    ACCESS_TOKEN_KEY,
    params.accessToken,
    SECURE_STORE_OPTIONS
  );
  if (params.refreshToken) {
    await SecureStore.setItemAsync(
      REFRESH_TOKEN_KEY,
      params.refreshToken,
      SECURE_STORE_OPTIONS
    );
  }
  await SecureStore.setItemAsync(
    USER_KEY,
    params.userJson,
    SECURE_STORE_OPTIONS
  );
}

export async function getSecureAccessToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(ACCESS_TOKEN_KEY, SECURE_STORE_OPTIONS);
  } catch {
    return null;
  }
}

export async function getSecureRefreshToken(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(REFRESH_TOKEN_KEY, SECURE_STORE_OPTIONS);
  } catch {
    return null;
  }
}

export async function getSecureUserJson(): Promise<string | null> {
  try {
    return await SecureStore.getItemAsync(USER_KEY, SECURE_STORE_OPTIONS);
  } catch {
    return null;
  }
}

export async function clearSecureSession(): Promise<void> {
  await Promise.allSettled([
    SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY, SECURE_STORE_OPTIONS),
    SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY, SECURE_STORE_OPTIONS),
    SecureStore.deleteItemAsync(USER_KEY, SECURE_STORE_OPTIONS),
  ]);
}

let inFlightRefreshPromise: Promise<string | null> | null = null;

/**
 * Single-flight refresh token exchange using encrypted SecureStore credentials.
 */
export async function refreshAccessToken(): Promise<string | null> {
  if (inFlightRefreshPromise) {
    return inFlightRefreshPromise;
  }

  inFlightRefreshPromise = (async () => {
    if (!API_BASE_URL) return null;
    const refreshToken = await getSecureRefreshToken();
    if (!refreshToken) return null;

    try {
      const response = await fetch(`${API_BASE_URL}/api/v1/auth/refresh`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Client-Platform': 'mobile',
        },
        body: JSON.stringify({ refresh_token: refreshToken }),
      });

      if (!response.ok) {
        await clearSecureSession();
        notifySessionExpired();
        return null;
      }

      const payload = (await response.json()) as Record<string, unknown>;
      const nextAccess =
        (payload.access_token as string | undefined) ||
        (payload.accessToken as string | undefined);
      const nextRefresh =
        (payload.refresh_token as string | undefined) ||
        (payload.refreshToken as string | undefined);

      if (!nextAccess) {
        await clearSecureSession();
        notifySessionExpired();
        return null;
      }

      await SecureStore.setItemAsync(
        ACCESS_TOKEN_KEY,
        nextAccess,
        SECURE_STORE_OPTIONS
      );
      if (nextRefresh) {
        await SecureStore.setItemAsync(
          REFRESH_TOKEN_KEY,
          nextRefresh,
          SECURE_STORE_OPTIONS
        );
      }
      return nextAccess;
    } catch {
      return null;
    }
  })();

  try {
    return await inFlightRefreshPromise;
  } finally {
    inFlightRefreshPromise = null;
  }
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  timeoutMs?: number;
  skipAuth?: boolean;
  _retried?: boolean;
}

export async function apiRequest<T>(
  endpoint: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  if (!API_BASE_URL) {
    throw new MobileApiError(
      'EXPO_PUBLIC_API_URL is not configured. Set your OFC360 backend URL in mobile/.env.',
      0,
      { isNetworkError: true, code: 'API_URL_UNCONFIGURED' }
    );
  }

  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  const token = options.skipAuth ? null : await getSecureAccessToken();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 12000);

  try {
    const response = await fetch(`${API_BASE_URL}${normalizedEndpoint}`, {
      method: options.method ?? 'GET',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Client-Platform': 'mobile',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
      signal: controller.signal,
    });

    if (response.status === 401 && !options.skipAuth && !options._retried) {
      const refreshedToken = await refreshAccessToken();
      if (refreshedToken) {
        return apiRequest<T>(endpoint, { ...options, _retried: true });
      }
      throw new MobileApiError('Your session has expired. Please sign in again.', 401, {
        code: 'SESSION_EXPIRED',
      });
    }

    if (!response.ok) {
      let detail = `Request failed (${response.status})`;
      try {
        const errJson = (await response.json()) as Record<string, unknown>;
        if (typeof errJson.detail === 'string') detail = errJson.detail;
        else if (typeof errJson.message === 'string') detail = errJson.message;
      } catch {
        // Non-JSON error body
      }
      throw new MobileApiError(detail, response.status);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return (await response.json()) as T;
  } catch (err) {
    if (err instanceof MobileApiError) {
      throw err;
    }
    const isAbort = err instanceof Error && err.name === 'AbortError';
    throw new MobileApiError(
      isAbort
        ? 'Request timed out. Check your network connection and retry.'
        : 'Unable to reach OFC360 server. Check your connection and retry.',
      0,
      { isNetworkError: true, code: isAbort ? 'TIMEOUT' : 'NETWORK_ERROR' }
    );
  } finally {
    clearTimeout(timer);
  }
}
