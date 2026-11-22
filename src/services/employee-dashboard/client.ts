import { API_BASE_URL, authClient } from '../../../lib/auth-api';
import { localMockFetch } from '../local-mock-engine';

export interface EmployeeDashboardErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class EmployeeDashboardApiError extends Error {
  public readonly status: number;
  public readonly code: string;
  public readonly details?: Record<string, unknown>;

  constructor(
    status: number,
    code: string,
    message: string,
    details?: Record<string, unknown>
  ) {
    super(message);
    this.name = 'EmployeeDashboardApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  public isPermissionDenied(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN';
  }

  public isNotApplicable(): boolean {
    return this.status === 404 || this.code === 'NOT_APPLICABLE';
  }
}

export function buildEmployeeQueryString(
  params?: Record<string, string | number | boolean | undefined | null>
): string {
  if (!params) return '';
  const searchParams = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      searchParams.set(key, String(value));
    }
  }
  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : '';
}

/**
 * Computes server-to-client clock offset in milliseconds:
 * serverTimeMs - clientNowMs
 */
export function computeServerClockOffsetMs(
  serverTimeIso: string | undefined | null,
  clientNowMs = Date.now()
): number {
  if (!serverTimeIso) return 0;
  const parsed = Date.parse(serverTimeIso);
  if (Number.isNaN(parsed)) return 0;
  return parsed - clientNowMs;
}

/**
 * The ONLY allowed client-side calculation on the Employee Dashboard:
 * Computes live running working hours ("HH:MM:SS") seeded from server punchInTimeIso
 * and serverClockOffsetMs.
 */
export function computeLiveWorkingHoursDisplay(
  punchInTimeIso: string | undefined | null,
  serverClockOffsetMs = 0,
  baseWorkedSecondsToday = 0,
  clientNowMs = Date.now()
): { formattedHHMMSS: string; totalSeconds: number } {
  let totalSeconds = Math.max(0, Math.floor(baseWorkedSecondsToday));

  if (punchInTimeIso) {
    const punchInMs = Date.parse(punchInTimeIso);
    if (!Number.isNaN(punchInMs)) {
      const synchronizedServerNowMs = clientNowMs + serverClockOffsetMs;
      const elapsedSincePunchInSec = Math.max(
        0,
        Math.floor((synchronizedServerNowMs - punchInMs) / 1000)
      );
      totalSeconds = Math.max(totalSeconds, elapsedSincePunchInSec);
    }
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => String(n).padStart(2, '0');
  return {
    formattedHHMMSS: `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    totalSeconds,
  };
}

/**
 * Timezone-safe date-only formatter (YYYY-MM-DD -> UTC noon)
 * Prevents off-by-one date shifts across employee timezones or midnight shifts.
 */
export function formatEmployeeDateOnly(
  dateOnly: string | undefined | null,
  locale = 'en-IN'
): string {
  if (!dateOnly) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly.trim());
  if (!match) return dateOnly;
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const utcNoon = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(utcNoon);
}

/**
 * Formats shift window and explicitly flags night shifts crossing midnight (+1d).
 */
export function formatEmployeeShiftWindow(
  startHHMM: string,
  endHHMM: string
): { label: string; crossesMidnight: boolean } {
  const toMinutes = (hhmm: string) => {
    const parts = hhmm.split(':').map(Number);
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
      return 0;
    }
    return parts[0] * 60 + parts[1];
  };
  const crossesMidnight = toMinutes(endHHMM) <= toMinutes(startHHMM);
  return {
    label: crossesMidnight
      ? `${startHHMM} – ${endHHMM} (+1d Night Shift)`
      : `${startHHMM} – ${endHHMM}`,
    crossesMidnight,
  };
}

export interface EmployeeRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  retriesForGet?: number;
}

export class EmployeeDashboardHttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(baseUrl?: string, fetchImpl?: typeof fetch) {
    const defaultBase = `${API_BASE_URL.replace(/\/+$/, '')}/api/v1/employee-dashboard`;
    this.baseUrl = (baseUrl || defaultBase).replace(/\/$/, '');
    this.fetchImpl = fetchImpl || localMockFetch;
  }

  private buildHeaders(
    extra?: Record<string, string>,
    isFormData = false
  ): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...(extra || {}),
    };
    if (!isFormData && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const token = authClient.getAccessToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
    path: string,
    body?: unknown,
    options?: EmployeeRequestOptions
  ): Promise<T> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;
    const isFormData =
      typeof FormData !== 'undefined' && body instanceof FormData;
    const maxAttempts =
      method === 'GET' ? Math.max(1, (options?.retriesForGet ?? 1) + 1) : 1;

    let lastError: unknown;
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const response = await this.fetchImpl(url, {
          method,
          headers: this.buildHeaders(options?.headers, isFormData),
          body:
            body === undefined
              ? undefined
              : isFormData
              ? (body as FormData)
              : JSON.stringify(body),
          signal: options?.signal,
        });

        if (!response.ok) {
          if (
            method === 'GET' &&
            attempt < maxAttempts &&
            (response.status === 502 ||
              response.status === 503 ||
              response.status === 504)
          ) {
            await new Promise((r) => setTimeout(r, 150 * attempt));
            continue;
          }

          let parsedError: EmployeeDashboardErrorPayload | null = null;
          try {
            const errJson = (await response.json()) as {
              error?: EmployeeDashboardErrorPayload;
              message?: string;
              code?: string;
            };
            if (errJson?.error) {
              parsedError = errJson.error;
            } else if (errJson?.message) {
              parsedError = {
                code: errJson.code || `HTTP_${response.status}`,
                message: errJson.message,
              };
            }
          } catch {
            // Non-JSON error response
          }

          throw new EmployeeDashboardApiError(
            response.status,
            parsedError?.code ||
              (response.status === 403
                ? 'FORBIDDEN'
                : response.status === 404
                ? 'NOT_APPLICABLE'
                : `HTTP_${response.status}`),
            parsedError?.message ||
              `Employee Dashboard API error (${response.status} ${
                response.statusText || 'Request Failed'
              })`,
            parsedError?.details
          );
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err;
        if (err instanceof EmployeeDashboardApiError) {
          throw err;
        }
        if (
          err instanceof Error &&
          (err.name === 'AbortError' || attempt >= maxAttempts)
        ) {
          throw new EmployeeDashboardApiError(
            0,
            err.name === 'AbortError' ? 'ABORTED' : 'NETWORK_ERROR',
            err.message || 'Network request failed'
          );
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new EmployeeDashboardApiError(0, 'UNKNOWN_ERROR', 'Request failed');
  }

  public async downloadBlob(
    path: string,
    filename: string,
    options?: EmployeeRequestOptions
  ): Promise<void> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;
    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: this.buildHeaders(options?.headers, true),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new EmployeeDashboardApiError(
        response.status,
        response.status === 403 ? 'FORBIDDEN' : `HTTP_${response.status}`,
        `Failed to download file (${response.status})`
      );
    }

    const blob = await response.blob();
    if (typeof window !== 'undefined' && typeof document !== 'undefined') {
      const objectUrl = window.URL.createObjectURL(blob);
      const anchor = document.createElement('a');
      anchor.href = objectUrl;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      window.URL.revokeObjectURL(objectUrl);
    }
  }
}

export const employeeDashboardHttpClient = new EmployeeDashboardHttpClient();
