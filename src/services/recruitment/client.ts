import { API_BASE_URL, authClient } from '../../../lib/auth-api';

export interface RecruitmentApiErrorPayload {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export class RecruitmentApiError extends Error {
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
    this.name = 'RecruitmentApiError';
    this.status = status;
    this.code = code;
    this.details = details;
  }

  public isPermissionDenied(): boolean {
    return this.status === 403 || this.code === 'FORBIDDEN';
  }
}

export function buildRecruitmentQueryString(
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

export function formatRecruitmentCurrency(
  amount: number | undefined | null,
  currency = 'INR',
  locale = 'en-IN'
): string {
  if (amount === undefined || amount === null || Number.isNaN(amount)) {
    return '—';
  }
  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      maximumFractionDigits: 0,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toLocaleString()}`;
  }
}

export function maskCandidatePii(
  rawValue: string | undefined | null,
  visibleTrailingChars = 4
): string {
  if (!rawValue) return '••••••••';
  const trimmed = rawValue.trim();
  if (trimmed.includes('@')) {
    const [localPart, domain] = trimmed.split('@');
    const visiblePrefix = localPart.slice(0, Math.min(2, localPart.length));
    return `${visiblePrefix}••••@${domain}`;
  }
  if (trimmed.length <= visibleTrailingChars) {
    return '••••';
  }
  const trailing = trimmed.slice(-visibleTrailingChars);
  return `••••••${trailing}`;
}

export interface RecruitmentRequestOptions {
  signal?: AbortSignal;
  headers?: Record<string, string>;
  retriesForGet?: number;
}

export class RecruitmentHttpClient {
  private readonly baseUrl: string;
  private readonly fetchImpl: typeof fetch;

  constructor(baseUrl?: string, fetchImpl?: typeof fetch) {
    const defaultBase = `${API_BASE_URL.replace(/\/+$/, '')}/api/v1/recruitment`;
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
    options?: RecruitmentRequestOptions
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

          let parsedError: RecruitmentApiErrorPayload | null = null;
          try {
            const errJson = (await response.json()) as {
              error?: RecruitmentApiErrorPayload;
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

          throw new RecruitmentApiError(
            response.status,
            parsedError?.code ||
              (response.status === 403
                ? 'FORBIDDEN'
                : `HTTP_${response.status}`),
            parsedError?.message ||
              `Recruitment API error (${response.status} ${response.statusText || 'Request Failed'})`,
            parsedError?.details
          );
        }

        if (response.status === 204) {
          return undefined as T;
        }

        return (await response.json()) as T;
      } catch (err) {
        lastError = err;
        if (err instanceof RecruitmentApiError) {
          throw err;
        }
        if (
          err instanceof Error &&
          (err.name === 'AbortError' || attempt >= maxAttempts)
        ) {
          throw new RecruitmentApiError(
            0,
            err.name === 'AbortError' ? 'ABORTED' : 'NETWORK_ERROR',
            err.message || 'Network request failed'
          );
        }
      }
    }

    throw lastError instanceof Error
      ? lastError
      : new RecruitmentApiError(0, 'UNKNOWN_ERROR', 'Request failed');
  }

  public async downloadBlob(
    path: string,
    filename: string,
    options?: RecruitmentRequestOptions
  ): Promise<void> {
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    const url = `${this.baseUrl}${cleanPath}`;
    const response = await this.fetchImpl(url, {
      method: 'GET',
      headers: this.buildHeaders(options?.headers, true),
      signal: options?.signal,
    });

    if (!response.ok) {
      throw new RecruitmentApiError(
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

export const recruitmentHttpClient = new RecruitmentHttpClient();
