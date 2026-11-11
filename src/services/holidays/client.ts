import { API_BASE_URL, authClient } from '../../../lib/auth-api';

export interface HolidayApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class HolidayApiError extends Error {
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
    this.name = 'HolidayApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  public isPermissionDenied(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN';
  }
}

export function buildHolidayQueryString(
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
 * Timezone-safe date-only formatter: parses YYYY-MM-DD using UTC noon
 * so local timezones never shift the date by -1 or +1 day.
 */
export function formatHolidayDateOnly(
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
 * Timezone-safe weekday resolver for YYYY-MM-DD strings.
 */
export function getWeekdayLabelFromDateOnly(
  dateOnly: string | undefined | null,
  locale = 'en-US'
): string {
  if (!dateOnly) return '—';
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(dateOnly.trim());
  if (!match) return '—';
  const year = Number(match[1]);
  const month = Number(match[2]) - 1;
  const day = Number(match[3]);
  const utcNoon = new Date(Date.UTC(year, month, day, 12, 0, 0));
  return new Intl.DateTimeFormat(locale, {
    weekday: 'long',
    timeZone: 'UTC',
  }).format(utcNoon);
}

export interface HolidayRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  retriesForGet?: number;
}

export class HolidayHttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(baseUrl?: string, fetchImpl?: typeof fetch) {
    const defaultBase = `${API_BASE_URL.replace(/\/+$/, '')}/api/v1/holidays`;
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
    options?: HolidayRequestOptions
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

          let parsedError: HolidayApiErrorPayload | null = null;
          try {
            const errJson = (await response.json()) as {
              error?: HolidayApiErrorPayload;
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
            // Non-JSON error body
          }

          throw new HolidayApiError(
            response.status,
            parsedError?.code ||
              (response.status === 403
                ? 'FORBIDDEN'
                : `HTTP_${response.status}`),
            parsedError?.message ||
              `Holiday API error (${response.status} ${response.statusText || 'Request Failed'})`,
            parsedError?.details
          );
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err;
        if (err instanceof HolidayApiError) {
          throw err;
        }
        if (
          err instanceof Error &&
          (err.name === 'AbortError' || attempt >= maxAttempts)
        ) {
          throw new HolidayApiError(
            0,
            err.name === 'AbortError' ? 'ABORTED' : 'NETWORK_ERROR',
            err.message || 'Network request failed'
          );
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new HolidayApiError(0, 'UNKNOWN_ERROR', 'Request failed');
  }

  public async downloadBlob(
    path: string,
    filename: string,
    options?: HolidayRequestOptions
  ): Promise<void> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;
    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: this.buildHeaders(options?.headers, true),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new HolidayApiError(
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

export const holidayHttpClient = new HolidayHttpClient();
