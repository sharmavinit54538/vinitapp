/**
 * Authenticated Attendance HTTP Transport & RTK Query Base Query
 *
 * - Preserves configured API origin and single /api/v1 or /api/v2 version prefix.
 * - Attaches Authorization: Bearer <access token> and credentials: 'include'.
 * - Coalesces concurrent 401 token refreshes through the shared authClient.
 * - Retries ONLY safe reads (GET/HEAD/OPTIONS) after a successful refresh.
 * - Never blindly retries uncertain writes (POST/PUT/PATCH/DELETE); marks
 *   `isUncertainWrite: true` so the caller reconciles via `/face/me`.
 * - Preserves exact server messages on 403 without triggering token refresh.
 * - Supports authenticated binary downloads outside Redux state.
 */

import type { BaseQueryFn } from '@reduxjs/toolkit/query';
import { API_BASE_URL, authClient } from '@/lib/auth-api';
import {
  buildVersionedUrl,
  parseAttendanceApiError,
  stripSensitiveResponseFields,
} from './builders';
import type { AttendanceApiError } from './types';

export type AttendanceHttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';

export interface AttendanceRequestConfig {
  version: 'v1' | 'v2';
  path: string;
  method?: AttendanceHttpMethod;
  query?: Record<string, string | number | boolean | undefined | null>;
  body?: unknown;
  headers?: Record<string, string>;
  signal?: AbortSignal;
  /** Override response handling for binary exports outside RTK Query */
  responseType?: 'json' | 'blob';
}

export interface AttendanceTransportAdapter {
  getOrigin: () => string;
  fetchImpl: typeof fetch;
  getAccessToken: () => string | null;
  refreshAccessToken: () => Promise<string | null>;
  onSessionExpired?: () => void;
}

let inFlightRefresh: Promise<string | null> | null = null;

function resolveConfiguredOrigin(): string {
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  return API_BASE_URL || '';
}

const defaultAdapter: AttendanceTransportAdapter = {
  getOrigin: resolveConfiguredOrigin,
  fetchImpl: (input, init) => globalThis.fetch(input, init),
  getAccessToken: () => authClient.getAccessToken(),
  refreshAccessToken: () => authClient.refreshAccessToken(),
  onSessionExpired: () => authClient.clearSession(),
};

let activeAdapter: AttendanceTransportAdapter = defaultAdapter;

/**
 * Allows tests to inject a deterministic fetch/auth adapter without touching
 * production code paths. Always restore via `resetAttendanceTransportAdapter()`.
 */
export function configureAttendanceTransportAdapter(
  overrides: Partial<AttendanceTransportAdapter>
): void {
  activeAdapter = {
    ...defaultAdapter,
    ...overrides,
  };
  inFlightRefresh = null;
}

export function resetAttendanceTransportAdapter(): void {
  activeAdapter = defaultAdapter;
  inFlightRefresh = null;
}

async function coalescedRefresh(): Promise<string | null> {
  if (inFlightRefresh) {
    return inFlightRefresh;
  }
  inFlightRefresh = (async () => {
    try {
      return await activeAdapter.refreshAccessToken();
    } catch {
      return null;
    } finally {
      inFlightRefresh = null;
    }
  })();
  return inFlightRefresh;
}

function isSafeReadMethod(method: AttendanceHttpMethod): boolean {
  return method === 'GET';
}

async function parseResponseBodySafe(response: Response): Promise<unknown> {
  if (response.status === 204) return null;
  const contentType = (response.headers.get('content-type') || '').toLowerCase();
  if (contentType.includes('application/json')) {
    try {
      return await response.json();
    } catch {
      return null;
    }
  }
  try {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  } catch {
    return null;
  }
}

function buildRequestHeaders(
  token: string | null,
  extraHeaders: Record<string, string> | undefined,
  isFormData: boolean,
  hasBody: boolean,
  accept: string
): Record<string, string> {
  const headers: Record<string, string> = {
    Accept: accept,
    ...(extraHeaders || {}),
  };
  if (hasBody && !isFormData && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }
  // For FormData, never set Content-Type manually so transport generates boundary
  if (isFormData && headers['Content-Type']) {
    delete headers['Content-Type'];
  }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export async function executeAttendanceRequest<T = unknown>(
  config: AttendanceRequestConfig
): Promise<{ data: T } | { error: AttendanceApiError }> {
  const method: AttendanceHttpMethod = config.method || 'GET';
  const url = buildVersionedUrl(
    activeAdapter.getOrigin(),
    config.version,
    config.path,
    config.query
  );
  const isFormData =
    typeof FormData !== 'undefined' && config.body instanceof FormData;
  const hasBody = config.body !== undefined && config.body !== null;
  const serializedBody: BodyInit | undefined = !hasBody
    ? undefined
    : isFormData
    ? (config.body as FormData)
    : JSON.stringify(config.body);
  const acceptHeader =
    config.responseType === 'blob' ? '*/*' : 'application/json';

  const doFetch = async (token: string | null): Promise<Response> => {
    return activeAdapter.fetchImpl(url, {
      method,
      headers: buildRequestHeaders(
        token,
        config.headers,
        isFormData,
        hasBody,
        acceptHeader
      ),
      body: serializedBody,
      credentials: 'include',
      signal: config.signal,
    });
  };

  let response: Response;
  try {
    response = await doFetch(activeAdapter.getAccessToken());
  } catch (err) {
    const isAbort = err instanceof Error && err.name === 'AbortError';
    return {
      error: parseAttendanceApiError(
        0,
        isAbort
          ? 'The attendance request timed out or was cancelled.'
          : err instanceof Error
          ? err.message
          : 'Network error',
        {
          isNetworkError: true,
          isUncertainWrite: !isSafeReadMethod(method),
        }
      ),
    };
  }

  // Handle 401 with coalesced refresh: retry safe reads ONLY.
  if (response.status === 401) {
    const refreshedToken = await coalescedRefresh();
    if (refreshedToken && isSafeReadMethod(method)) {
      try {
        response = await doFetch(refreshedToken);
      } catch (retryErr) {
        return {
          error: parseAttendanceApiError(
            0,
            retryErr instanceof Error ? retryErr.message : 'Network error after refresh',
            { isNetworkError: true, isUncertainWrite: false }
          ),
        };
      }
    } else if (!refreshedToken) {
      activeAdapter.onSessionExpired?.();
    } else if (!isSafeReadMethod(method)) {
      // Token refreshed, but do not blindly replay a mutation without reconciling state first.
      const errBody = await parseResponseBodySafe(response);
      return {
        error: parseAttendanceApiError(401, errBody, {
          retryAfterHeader: response.headers.get('retry-after'),
          isUncertainWrite: true,
        }),
      };
    }
  }

  if (!response.ok) {
    const errBody = await parseResponseBodySafe(response);
    return {
      error: parseAttendanceApiError(response.status, errBody, {
        retryAfterHeader: response.headers.get('retry-after'),
        isUncertainWrite:
          !isSafeReadMethod(method) &&
          (response.status === 408 ||
            response.status === 409 ||
            response.status === 502 ||
            response.status === 503 ||
            response.status === 504),
      }),
    };
  }

  if (config.responseType === 'blob') {
    const blob = await response.blob();
    return { data: blob as unknown as T };
  }

  const parsed = await parseResponseBodySafe(response);
  return { data: stripSensitiveResponseFields(parsed) as T };
}

export const attendanceBaseQuery: BaseQueryFn<
  AttendanceRequestConfig,
  unknown,
  AttendanceApiError
> = async (args) => {
  return executeAttendanceRequest(args);
};

/**
 * Performs an authenticated binary export download outside Redux state.
 */
export async function downloadAuthenticatedAttendanceFile(params: {
  path: string;
  query?: Record<string, string | number | boolean | undefined | null>;
  fallbackFilename: string;
}): Promise<{ ok: true; filename: string; sizeBytes: number } | { ok: false; error: AttendanceApiError }> {
  const result = await executeAttendanceRequest<Blob>({
    version: 'v1',
    path: params.path,
    method: 'GET',
    query: params.query,
    responseType: 'blob',
  });

  if ('error' in result) {
    return { ok: false, error: result.error };
  }

  const blob = result.data;
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    const objectUrl = window.URL.createObjectURL(blob);
    try {
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = params.fallbackFilename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
    } finally {
      window.URL.revokeObjectURL(objectUrl);
    }
  }

  return {
    ok: true,
    filename: params.fallbackFilename,
    sizeBytes: blob.size,
  };
}
