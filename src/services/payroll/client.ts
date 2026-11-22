import { API_BASE_URL, authClient } from '../../../lib/auth-api';
import { PayrollApiErrorPayload, PayrollQueryParams } from '../../types/payroll';
import { localMockFetch } from '../local-mock-engine';

export class PayrollApiError extends Error {
  public readonly statusCode: number;
  public readonly code?: string;
  public readonly fieldErrors?: Record<string, string[]>;

  constructor(payload: PayrollApiErrorPayload) {
    super(payload.message);
    this.name = 'PayrollApiError';
    this.statusCode = payload.statusCode;
    this.code = payload.code;
    this.fieldErrors = payload.fieldErrors;
  }

  public isPermissionDenied(): boolean {
    return this.statusCode === 403;
  }

  public isUnauthorized(): boolean {
    return this.statusCode === 401;
  }
}

export interface PayrollRequestOptions {
  signal?: AbortSignal;
  params?: PayrollQueryParams;
  headers?: Record<string, string>;
  retries?: number;
}

export function buildQueryString(params?: PayrollQueryParams): string {
  if (!params) return '';
  const entries = Object.entries(params).filter(
    ([, val]) => val !== undefined && val !== null && val !== ''
  );
  if (entries.length === 0) return '';
  const searchParams = new URLSearchParams();
  for (const [key, val] of entries) {
    searchParams.append(key, String(val));
  }
  const qs = searchParams.toString();
  return qs ? `?${qs}` : '';
}

export class PayrollHttpClient {
  private readonly baseUrl: string;
  private readonly customFetch?: typeof fetch;

  constructor(baseUrl: string = API_BASE_URL, customFetch?: typeof fetch) {
    this.baseUrl = baseUrl.replace(/\/+$/, '');
    this.customFetch = customFetch;
  }

  private getFetchImpl(): typeof fetch {
    if (this.customFetch) return this.customFetch;
    return localMockFetch;
  }

  private buildHeaders(extraHeaders?: Record<string, string>, isMultipart = false): Record<string, string> {
    const headers: Record<string, string> = {
      Accept: 'application/json',
      ...extraHeaders,
    };
    if (!isMultipart && !headers['Content-Type']) {
      headers['Content-Type'] = 'application/json';
    }
    const token = authClient.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  private async parseErrorResponse(res: Response): Promise<PayrollApiError> {
    let message = `Payroll API error (${res.status} ${res.statusText || 'Request Failed'})`;
    let code: string | undefined;
    let fieldErrors: Record<string, string[]> | undefined;

    try {
      const json = (await res.json()) as Record<string, unknown>;
      if (typeof json.message === 'string' && json.message.trim().length > 0) {
        message = json.message;
      } else if (typeof json.detail === 'string' && json.detail.trim().length > 0) {
        message = json.detail;
      } else if (typeof json.error === 'string' && json.error.trim().length > 0) {
        message = json.error;
      }
      if (typeof json.code === 'string') {
        code = json.code;
      }
      if (json.fieldErrors && typeof json.fieldErrors === 'object') {
        fieldErrors = json.fieldErrors as Record<string, string[]>;
      }
    } catch {
      // Fallback to status message if body is not valid JSON
    }

    return new PayrollApiError({
      message,
      statusCode: res.status,
      code,
      fieldErrors,
    });
  }

  public async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    path: string,
    body?: unknown,
    options?: PayrollRequestOptions
  ): Promise<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${normalizedPath}${buildQueryString(options?.params)}`;
    const maxRetries = method === 'GET' ? (options?.retries ?? 1) : 0;
    const fetchFn = this.getFetchImpl();

    let attempt = 0;
    while (true) {
      try {
        const res = await fetchFn(url, {
          method,
          headers: this.buildHeaders(options?.headers, false),
          body: body !== undefined ? JSON.stringify(body) : undefined,
          signal: options?.signal,
        });

        if (!res.ok) {
          const apiErr = await this.parseErrorResponse(res);
          // Retry idempotent GET on transient 502/503/504 errors
          if (
            method === 'GET' &&
            attempt < maxRetries &&
            (res.status === 502 || res.status === 503 || res.status === 504)
          ) {
            attempt += 1;
            continue;
          }
          throw apiErr;
        }

        if (res.status === 204) {
          return {} as T;
        }

        return (await res.json()) as T;
      } catch (err) {
        if (err instanceof PayrollApiError) {
          throw err;
        }
        if (err instanceof Error && err.name === 'AbortError') {
          throw err;
        }
        if (method === 'GET' && attempt < maxRetries) {
          attempt += 1;
          continue;
        }
        const message =
          err instanceof Error
            ? err.message
            : 'Unable to reach the Payroll backend service';
        throw new PayrollApiError({
          message,
          statusCode: 503,
          code: 'NETWORK_UNAVAILABLE',
        });
      }
    }
  }

  public get<T>(path: string, options?: PayrollRequestOptions): Promise<T> {
    return this.request<T>('GET', path, undefined, options);
  }

  public post<T>(path: string, body?: unknown, options?: PayrollRequestOptions): Promise<T> {
    return this.request<T>('POST', path, body, options);
  }

  public put<T>(path: string, body?: unknown, options?: PayrollRequestOptions): Promise<T> {
    return this.request<T>('PUT', path, body, options);
  }

  public delete<T>(path: string, options?: PayrollRequestOptions): Promise<T> {
    return this.request<T>('DELETE', path, undefined, options);
  }

  public async uploadFile<T>(
    path: string,
    formData: FormData,
    options?: PayrollRequestOptions
  ): Promise<T> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${normalizedPath}${buildQueryString(options?.params)}`;
    const fetchFn = this.getFetchImpl();

    try {
      const res = await fetchFn(url, {
        method: 'POST',
        headers: this.buildHeaders(options?.headers, true),
        body: formData,
        signal: options?.signal,
      });

      if (!res.ok) {
        throw await this.parseErrorResponse(res);
      }

      return (await res.json()) as T;
    } catch (err) {
      if (err instanceof PayrollApiError) {
        throw err;
      }
      throw new PayrollApiError({
        message: err instanceof Error ? err.message : 'File upload failed',
        statusCode: 503,
        code: 'UPLOAD_FAILED',
      });
    }
  }

  public async downloadBlob(
    path: string,
    method: 'GET' | 'POST' = 'GET',
    body?: unknown,
    options?: PayrollRequestOptions
  ): Promise<Blob> {
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${normalizedPath}${buildQueryString(options?.params)}`;
    const fetchFn = this.getFetchImpl();

    try {
      const res = await fetchFn(url, {
        method,
        headers: this.buildHeaders(
          { Accept: 'application/octet-stream, application/pdf, text/csv, */*', ...options?.headers },
          false
        ),
        body: body !== undefined ? JSON.stringify(body) : undefined,
        signal: options?.signal,
      });

      if (!res.ok) {
        throw await this.parseErrorResponse(res);
      }

      return await res.blob();
    } catch (err) {
      if (err instanceof PayrollApiError) {
        throw err;
      }
      throw new PayrollApiError({
        message: err instanceof Error ? err.message : 'Document download failed',
        statusCode: 503,
        code: 'DOWNLOAD_FAILED',
      });
    }
  }
}

export const payrollHttpClient = new PayrollHttpClient();

/**
 * Currency formatting via Intl.NumberFormat (INR default, configurable from company settings).
 * Never computes payroll amounts on the client — only formats numeric values returned by the API.
 */
export function formatPayrollCurrency(
  amount: number | null | undefined,
  currencyCode = 'INR',
  maximumFractionDigits = 0
): string {
  if (amount === null || amount === undefined || Number.isNaN(Number(amount))) {
    return '—';
  }
  const locale = currencyCode.toUpperCase() === 'INR' ? 'en-IN' : 'en-US';
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency: currencyCode.toUpperCase(),
      maximumFractionDigits,
      minimumFractionDigits: 0,
    }).format(Number(amount));
  } catch {
    return `${currencyCode} ${Number(amount).toLocaleString()}`;
  }
}

/**
 * Date formatting helper for ISO dates returned by the API
 */
export function formatPayrollDate(isoDate: string | null | undefined): string {
  if (!isoDate) return '—';
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return isoDate;
  }
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(parsed);
}

/**
 * Masks sensitive statutory & banking identifiers (PAN, UAN, ESI, Bank A/C)
 * unless explicitly revealed by an authorized user with `payroll.sensitive.reveal`.
 */
export function maskSensitiveField(
  rawOrMasked: string | null | undefined,
  visibleTrailingChars = 4
): string {
  if (!rawOrMasked) return '—';
  const trimmed = rawOrMasked.trim();
  if (trimmed.length <= visibleTrailingChars) {
    return '••••';
  }
  const tail = trimmed.slice(-visibleTrailingChars);
  return `${'•'.repeat(Math.min(8, trimmed.length - visibleTrailingChars))}${tail}`;
}
