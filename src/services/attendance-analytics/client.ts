import { API_BASE_URL, authClient } from '../../../lib/auth-api';

export interface AttendanceApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class AttendanceAnalyticsApiError extends Error {
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
    this.name = 'AttendanceAnalyticsApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  public isPermissionDenied(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN';
  }
}

export function buildAttendanceQueryString(
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
 * Timezone-safe date-only formatter (YYYY-MM-DD -> localized date via UTC noon)
 * so night shifts or regional timezones never suffer off-by-one day shifts.
 */
export function formatAttendanceDateOnly(
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
 * Formats shift start/end times and explicitly marks night shifts crossing midnight (+1d).
 */
export function formatShiftWindowWithMidnightCheck(
  startHHMM: string,
  endHHMM: string
): { label: string; crossesMidnight: boolean } {
  const toMin = (hhmm: string) => {
    const parts = hhmm.split(':').map(Number);
    if (parts.length < 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
      return 0;
    }
    return parts[0] * 60 + parts[1];
  };
  const crossesMidnight = toMin(endHHMM) <= toMin(startHHMM);
  return {
    label: crossesMidnight
      ? `${startHHMM} – ${endHHMM} (+1d Night Shift)`
      : `${startHHMM} – ${endHHMM}`,
    crossesMidnight,
  };
}

/**
 * Masks precise GPS coordinates for privacy unless explicitly revealed by authorized roles.
 */
export function maskGeoLocationCoord(
  rawCoordOrLabel: string | undefined | null
): string {
  if (!rawCoordOrLabel) return '—';
  return rawCoordOrLabel.replace(
    /(-?\d+\.\d{2})\d+/g,
    '$1••'
  );
}

export interface AttendanceRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  retriesForGet?: number;
}

export class AttendanceAnalyticsHttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(baseUrl?: string, fetchImpl?: typeof fetch) {
    const defaultBase = `${API_BASE_URL.replace(/\/+$/, '')}/api/v1/attendance-analytics`;
    this.baseUrl = (baseUrl || defaultBase).replace(/\/$/, '');
    this.fetchImpl = fetchImpl || fetch.bind(globalThis);
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
    options?: AttendanceRequestOptions
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

          let parsedError: AttendanceApiErrorPayload | null = null;
          try {
            const errJson = (await response.json()) as {
              error?: AttendanceApiErrorPayload;
              message?: string;
            };
            if (errJson?.error) {
              parsedError = errJson.error;
            } else if (errJson?.message) {
              parsedError = {
                code: `HTTP_${response.status}`,
                message: errJson.message,
              };
            }
          } catch {
            // Non-JSON error response
          }

          throw new AttendanceAnalyticsApiError(
            response.status,
            parsedError?.code ||
              (response.status === 403
                ? 'FORBIDDEN'
                : `HTTP_${response.status}`),
            parsedError?.message ||
              `Attendance Analytics API error (${response.status} ${response.statusText || 'Request Failed'})`,
            parsedError?.details
          );
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err;
        if (err instanceof AttendanceAnalyticsApiError) {
          throw err;
        }
        if (
          err instanceof Error &&
          (err.name === 'AbortError' || attempt >= maxAttempts)
        ) {
          throw new AttendanceAnalyticsApiError(
            0,
            err.name === 'AbortError' ? 'ABORTED' : 'NETWORK_ERROR',
            err.message || 'Network request failed'
          );
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new AttendanceAnalyticsApiError(0, 'UNKNOWN_ERROR', 'Request failed');
  }

  public async downloadBlob(
    path: string,
    filename: string,
    options?: AttendanceRequestOptions
  ): Promise<void> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;
    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: this.buildHeaders(options?.headers, true),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new AttendanceAnalyticsApiError(
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

export const attendanceAnalyticsHttpClient =
  new AttendanceAnalyticsHttpClient();
